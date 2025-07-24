const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const fetch = require('node-fetch'); // Use fetch as in server.js
const { callClaudeWithRetryAndFallback } = require('./claudeApiHelper');
const { sendEmail } = require('./sesEmailService'); // <-- Add this import

// You may want to import your pool from server.js if it's exported
const pool = require('./server').pool || mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Helper: get user profile as an object
async function getUserProfile(uid) {
  const [rows] = await pool.query(
    `SELECT strengths, weaknesses, paradigms, user_values, goals, intuition, tools_used, Not_to_do, user_history, user_stories, user_language, current_mission, learning_history, notes
     FROM users WHERE uid = ? LIMIT 1`, [uid]
  );
  return rows[0] || {};
}

// Helper: update user profile fields with complete data
async function updateUserProfile(uid, updates) {
  if (!updates || Object.keys(updates).length === 0) return;
  
  const fields = Object.keys(updates);
  const values = fields.map(f => {
    const value = updates[f];
    // Convert arrays to JSON strings, leave other types as-is
    return Array.isArray(value) ? JSON.stringify(value) : value;
  });
  
  const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');
  
  console.log(`Updating user ${uid} with complete data for fields:`, fields);
  console.log("Update values:", values);
  
  await pool.query(`UPDATE users SET ${setClause} WHERE uid = ?`, [...values, uid]);
}

// Helper: update session summary
async function updateSessionSummary(sessionId, summaryJson) {
  await pool.query(
    `UPDATE user_sessions SET summary = ? WHERE id = ?`,
    [JSON.stringify(summaryJson), sessionId]
  );
}

function extractJsonFromText(text) {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) return null;
  const jsonString = text.substring(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}

router.post('/analyze-session', async (req, res) => {
  try {
    const { sessionId, uid, transcript, userEmail, userName, coachName } = req.body;

    if (!sessionId || !uid || !Array.isArray(transcript)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userProfile = await getUserProfile(uid);

    // === UPDATED PROMPT ===
    const strictPrompt = `
Based on the full coaching conversation in this session and the existing user profile data below, return a single JSON object with:

1. "session_overview": A 2–4 sentence summary of the session’s main themes, mood, and key moments.

2. "user_profile_updates": An object with the COMPLETE, up-to-date values for each of the following fields:
strengths, weaknesses, paradigms, user_values, goals, intuition, tools_used, Not_to_do, user_history, user_stories, user_language, current_mission, learning_history, notes. 

‼️ Important:
- For all fields: preserve all relevant existing data, update/refine if needed, add new insights from this session, and remove anything no longer accurate.
- For "current_mission": replace any previous assignment with the most recent one from this session only.

3. "summary_email_text": An object with:
{
The coach's name for this session is: ${coachName || 'מאיה'}. Please sign the email with this name.
  "subject_line": "Your email subject line here",
  "body": "A short, friendly email to the user, written as if from their coach. The email should summarize only the current session (do not use information from previous sessions or the profile). Include key insights and, if an assignment was given in this session, describe it clearly. If no assignment was given, end with a brief inspirational comment or encouragement."
For both fields use the same language (Hebrew/English) as the user used in this session
  }

Output only a single valid JSON object in this format:
{
  "session_overview": "Short summary...",
  "user_profile_updates": { ... },
  "summary_email_text": {
    "subject_line": "Your subject line",
    "body": "Your email content..."
  }
}
`;

    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500, // Increased for complete profiles
      temperature: 0.7,
      system: strictPrompt,
      messages: [
        { role: "user", content: "Existing user profile: " + JSON.stringify(userProfile) },
        ...transcript,
        { role: "user", content: "Remember: return COMPLETE updated profile data, not just additions. Reply ONLY with the JSON." }
      ]
    };

    // === BEGIN: Claude API call (same as server.js) ===
    const CLAUDE_API_KEY = process.env.VUE_APP_CLAUDE_API_KEY;
    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ error: "Claude API key not configured" });
    }

    const preferredModel = "claude-3-opus-20240229";
    const fallbackModel = "claude-3-haiku-20240307"; // or another fallback
    let aiResponse;

    // Initial call (unchanged)
    aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ ...claudeRequest, model: preferredModel }),
    });

    // If 529, use helper for retry/fallback
    if (aiResponse.status === 529) {
      aiResponse = await callClaudeWithRetryAndFallback(
        { ...claudeRequest }, // model will be set by helper
        CLAUDE_API_KEY,
        preferredModel,
        fallbackModel
      );
      if (!aiResponse) {
        return res.status(529).json({
          error: "Claude API Overloaded",
          message: "Our AI partner is experiencing high demand. Please try again in a few minutes. Your session is safe and you can continue once the service is available.",
        });
      }
    }

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => null);
      return res.status(aiResponse.status).json({
        error: "Claude API Error",
        message: errorData?.error?.message || aiResponse.statusText,
        status: aiResponse.status,
        details: errorData,
      });
    }

    const data = await aiResponse.json();
    const text = data.content?.[0]?.text || data.completion || "";
    
    // === ADD THESE CONSOLE LOGS ===
    console.log("=== CLAUDE API RESPONSE DEBUG ===");
    console.log("Raw Claude API response:", JSON.stringify(data, null, 2));
    console.log("Extracted text from Claude:", text);
    console.log("Text length:", text.length);
    console.log("Text starts with:", text.substring(0, 200));
    console.log("Text ends with:", text.substring(text.length - 200));
    console.log("=== END CLAUDE API RESPONSE DEBUG ===");
    
    // === END: Claude API call ===

    const summaryJson = extractJsonFromText(text);

    if (!summaryJson) {
      console.error("Failed to extract/parse JSON from Claude response:", text);
      return res.status(500).json({ error: "Claude did not return valid JSON" });
    }

    // === ADD THIS LOG TOO ===
    console.log("=== EXTRACTED JSON DEBUG ===");
    console.log("Extracted JSON:", JSON.stringify(summaryJson, null, 2));
    console.log("=== END EXTRACTED JSON DEBUG ===");

    const { user_profile_updates, session_overview, summary_email_text } = summaryJson;
    if (!user_profile_updates || !session_overview || !summary_email_text) {
      console.error("Claude response missing required fields:", summaryJson);
      return res.status(500).json({ error: "Claude response missing required fields" });
    }

    // 5. Update user profile in DB
    console.log("Updating user profile with complete data:", user_profile_updates);
    await updateUserProfile(uid, user_profile_updates);
    console.log("User profile updated with complete data.");

    // 6. Update session summary in DB
    console.log("Updating session summary with:", summaryJson);
    await updateSessionSummary(sessionId, summaryJson);
    console.log("Session summary updated.");

    // 7. SEND EMAILS
    // --- 1. To the user ---
    if (userEmail) {
      const userMailSubject = summary_email_text.subject_line || "Your Bina Session Summary";
      const personalizedEmail = summary_email_text.body.replace('[Name]', userName || 'there');

      // Detect if the email is in Hebrew
      function isHebrew(text) {
        return /[\u0590-\u05FF]/.test(text);
      }

      // Prepare HTML body with RTL if needed
      let emailHtml;
      if (isHebrew(personalizedEmail)) {
        emailHtml = `<div dir="rtl" style="font-family: Arial, sans-serif; white-space: pre-line;">${personalizedEmail}</div>`;
      } else {
        emailHtml = `<div style="font-family: Arial, sans-serif; white-space: pre-line;">${personalizedEmail}</div>`;
      }

      const signature = `\n\nבברכה,\n${coachName || 'מאיה'}`;
      const emailBodyWithSignature = personalizedEmail + signature;

      console.log("[analyze-session] Attempting to send summary email to user:", userEmail);
      console.log("[analyze-session] Email subject:", userMailSubject);
      console.log("[analyze-session] Email body (first 200 chars):", personalizedEmail.substring(0, 200));
      try {
        await sendEmail(userEmail, userMailSubject, emailBodyWithSignature, emailHtml);
        console.log("[analyze-session] Summary email sent to user:", userEmail);
      } catch (emailErr) {
        console.error("[analyze-session] Failed to send summary email to user:", userEmail, emailErr);
      }
    } else {
      console.warn("[analyze-session] User email not provided, skipping user summary email.");
    }

    // --- 2. To Bina admins ---
    const adminMailSubject = `Session Summary for User ${uid} (Session ${sessionId})`;
    const adminMailBody = `
Session Overview:
${session_overview}

User Profile Updates:
${JSON.stringify(user_profile_updates, null, 2)}

Full Session Transcript:
${JSON.stringify(transcript, null, 2)}

DB Summary JSON:
${JSON.stringify(summaryJson, null, 2)}
    `;
    await sendEmail("bina@binaapp.com", adminMailSubject, adminMailBody);
    console.log("Admin summary email sent.");

    res.json({ success: true, user_profile_updates, session_overview });
  } catch (err) {
    console.error('[analyze-session] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 