const express = require('express');
const router = express.Router();
const axios = require('axios');
const mysql = require('mysql2/promise');

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

// Helper: update user profile fields
async function updateUserProfile(uid, updates) {
  if (!updates || Object.keys(updates).length === 0) return;
  const fields = Object.keys(updates);
  // Convert arrays to JSON strings, leave other types as-is
  const values = fields.map(f => Array.isArray(updates[f]) ? JSON.stringify(updates[f]) : updates[f]);
  const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');
  await pool.query(`UPDATE users SET ${setClause} WHERE uid = ?`, [...values, uid]);
}

// Helper: update session summary
async function updateSessionSummary(sessionId, summaryJson) {
  await pool.query(
    `UPDATE user_sessions SET summary = ? WHERE id = ?`,
    [JSON.stringify(summaryJson), sessionId]
  );
}

// The prompt for the AI
const aiPromptText = `
Based on the full coaching conversation in this session, and on the existing user profile data provided below, do the following:

1. Update the user profile:
Review the existing profile and return only the new or changed values for each of the following fields (leave out anything unchanged or unknown):

strengths: Updated list of strengths (if new ones emerged or old ones were refined).
weaknesses: Topics the user feels need improvement.
paradigms: Limiting beliefs or repeating patterns.
user_values: Personal values that guide the user.
goals: Current personal or professional goals.
intuition: Your own (AI) observations about strengths, values, or patterns that were not confirmed explicitly by the user.
tools_used: Coaching tools that worked well.
Not_to_do: Tools, styles, or approaches that didn’t work well or the user disliked.
user_history: Factual background (residence, job, family, etc.)
user_stories: Personal stories shared.
user_language: Unique phrases, metaphors, or expressions used.
current_mission: Action items the user committed to.
learning_history: New insights, realizations, or lessons the user expressed.
notes: Any other free-text notes worth saving.

2. Write a JSON summary for the session:
Prepare a JSON object to be saved in the summary field in the user_session table. It should include:

"session_overview": A 2–4 sentence description of the main themes, energy, and moments in the session.
"user_profile_updates": An object that includes all the new or changed values from the user profile fields above. (This is the same as section 1, just nested here.)

📌 Output Format:
{
  "session_overview": "A short narrative description of the session...",
  "user_profile_updates": {
    "strengths": [...],
    "weaknesses": [...],
    "paradigms": [...],
    "user_values": [...],
    "goals": [...],
    "intuition": [...],
    "tools_used": [...],
    "Not_to_do": [...],
    "user_history": "...",
    "user_stories": [...],
    "user_language": [...],
    "current_mission": [...],
    "learning_history": [...],
    "notes": "..."
  }
}
✨ Notes:
Only include keys with new or updated values (do not repeat unchanged fields).
Use plain JSON format – no explanation or text outside the JSON.
You will receive as input:
The full session transcript
The existing user profile JSON
`;

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
    const { sessionId, uid, transcript } = req.body;
    if (!sessionId || !uid || !Array.isArray(transcript)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userProfile = await getUserProfile(uid);

    const strictPrompt = `
Based on the full coaching conversation in this session, and on the existing user profile data provided below, do the following:

1. Update the user profile:
Review the existing profile and return only the new or changed values for each of the following fields (leave out anything unchanged or unknown):

strengths: Updated list of strengths (if new ones emerged or old ones were refined).
weaknesses: Topics the user feels need improvement.
paradigms: Limiting beliefs or repeating patterns.
user_values: Personal values that guide the user.
goals: Current personal or professional goals.
intuition: Your own (AI) observations about strengths, values, or patterns that were not confirmed explicitly by the user.
tools_used: Coaching tools that worked well.
Not_to_do: Tools, styles, or approaches that didn’t work well or the user disliked.
user_history: Factual background (residence, job, family, etc.)
user_stories: Summarize the Personal stories that were shared in the session.
user_language: Unique phrases, metaphors, or expressions used.
current_mission: Action items the user committed to.
learning_history: New insights, realizations, or lessons the user expressed.
notes: Any other free-text notes worth saving.

2. Write a JSON summary for the session:
Prepare a JSON object to be saved in the summary field in the user_session table. It should include:

"session_overview": A 2–4 sentence description of the main themes, energy, and moments in the session.
"user_profile_updates": An object that includes all the new or changed values from the user profile fields above. (This is the same as section 1, just nested here.)

📌 Output Format:
{
  "session_overview": "A short narrative description of the session...",
  "user_profile_updates": {
    "strengths": [...],
    "weaknesses": [...],
    "paradigms": [...],
    "user_values": [...],
    "goals": [...],
    "intuition": [...],
    "tools_used": [...],
    "Not_to_do": [...],
    "user_history": "...",
    "user_stories": [...],
    "user_language": [...],
    "current_mission": [...],
    "learning_history": [...],
    "notes": "..."
  }
}
IMPORTANT: Your entire response MUST be a single valid JSON object, with no explanation, no greeting, and no text outside the JSON. Do not include any conversational text, thank yous, or summaries outside the JSON. If you understand, reply ONLY with the JSON.
`;

    const claudeRequest = {
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      temperature: 0.7,
      system: strictPrompt,
      messages: [
        { role: "user", content: "Existing user profile: " + JSON.stringify(userProfile) },
        ...transcript,
        { role: "user", content: "Remember: reply ONLY with the JSON, no extra text." }
      ]
    };

    const aiApiUrl = 'http://localhost:3001/api/claude';
    const aiResponse = await axios.post(aiApiUrl, claudeRequest, {
      headers: { 'Content-Type': 'application/json' }
    });

    const text = aiResponse.data.content?.[0]?.text || aiResponse.data.completion || "";
    const summaryJson = extractJsonFromText(text);

    if (!summaryJson) {
      console.error("Failed to extract/parse JSON from Claude response:", text);
      return res.status(500).json({ error: "Claude did not return valid JSON" });
    }

    const { user_profile_updates, session_overview } = summaryJson;
    if (!user_profile_updates || !session_overview) {
      console.error("Claude response missing required fields:", summaryJson);
      return res.status(500).json({ error: "Claude response missing required fields" });
    }

    // 5. Update user profile in DB
    console.log("Updating user profile with:", user_profile_updates);
    await updateUserProfile(uid, user_profile_updates);
    console.log("User profile updated.");

    // 6. Update session summary in DB
    console.log("Updating session summary with:", summaryJson);
    await updateSessionSummary(sessionId, summaryJson);
    console.log("Session summary updated.");

    res.json({ success: true, user_profile_updates, session_overview });
  } catch (err) {
    console.error('[analyze-session] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 