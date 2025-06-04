// emailRoutes.js
const express = require('express');
const router = express.Router();
const { sendEmail } = require('./sesEmailService');
const fetch = require('node-fetch');

// Get the API base URL based on environment
function getApiBase() {
  const hostname = process.env.HOSTNAME || 'localhost';
  const isProduction = hostname === 'binaapp.com' || hostname === 'www.binaapp.com';
  const isStaging = hostname.includes('staging.binaapp.com');
  
  if (isProduction) {
    return 'https://api.binaapp.com';
  } else if (isStaging) {
    return 'https://api-staging.binaapp.com';
  } else {
    return 'http://localhost:3001';
  }
}

router.post('/send-reflection-email', async (req, res) => {
  console.log("[emailRoutes] Received request body:", {
    hasSessionId: !!req.body.sessionId,
    hasFlowData: !!req.body.flowData,
    hasConversationHistory: !!req.body.conversationHistory,
    hasCurrentStep: !!req.body.currentStep,
    userEmail: req.body.userEmail,
    hasInstruction: !!req.body.instruction
  });

  // Log the actual instruction being sent
  console.log("[emailRoutes] Instruction from action:", req.body.instruction);

  const { sessionId, flowData, conversationHistory, currentStep, userEmail, instruction } = req.body;

  if (!userEmail) {
    console.error("[emailRoutes] Error: User email is required");
    return res.status(400).json({ error: "User email is required" });
  }

  try {
    console.log("[emailRoutes] Calling Claude API to generate summary");
    const apiBase = getApiBase();
    
    // Log the complete request body being sent to Claude
    const claudeRequestBody = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        ...conversationHistory,
        {
          role: "user",
          content: instruction
        }
      ],
      system: currentStep.system
    };
    console.log("[emailRoutes] Complete request body for Claude:", JSON.stringify(claudeRequestBody, null, 2));

    const response = await fetch(`${apiBase}/api/claude`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(claudeRequestBody)
    });

    if (!response.ok) {
      console.error("[emailRoutes] Claude API error response:", {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Claude API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[emailRoutes] Full Claude API response:", JSON.stringify(data, null, 2));
    
    // Extract the summary from the correct location in the response
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error("[emailRoutes] Invalid response structure:", data);
      throw new Error("Invalid response structure from Claude API");
    }

    const summary = data.content[0].text;
    console.log("[emailRoutes] Extracted summary:", summary);

    // Convert line breaks to HTML breaks for the HTML version
    const summaryHtml = summary.replace(/\n/g, '<br>');

    // Generate email content with proper formatting
    const emailText = summary;  // Just use the summary directly
    const emailHtml = `
      <div style="white-space: pre-line;">${summary}</div>
      <p>Thank you for exploring your Genious Zone with us!</p>
    `;

    // Log the email content before sending
    console.log("[emailRoutes] Email content being sent:", {
      subject: 'Your Genious Zone Session Summary',
      textContent: emailText,
      htmlContent: emailHtml
    });

    // Send email to the user
    console.log("[emailRoutes] Sending email to user:", userEmail);
    try {
      await sendEmail(
        userEmail,
        'Your Genious Zone Session Summary',
        emailText,
        emailHtml
      );
      console.log("[emailRoutes] Email sent successfully to user");
    } catch (userEmailError) {
      console.error("[emailRoutes] Failed to send email to user:", userEmailError);
    }

    // Send the exact same email to bina@binaapp.com
    console.log("[emailRoutes] Sending email to bina@binaapp.com");
    try {
      await sendEmail(
        'bina@binaapp.com',
        'Your Genious Zone Session Summary',
        emailText,
        emailHtml
      );
      console.log("[emailRoutes] Email sent successfully to bina@binaapp.com");
    } catch (binaEmailError) {
      console.error("[emailRoutes] Failed to send email to bina@binaapp.com:", binaEmailError);
    }

    res.json({ 
      success: true,
      userEmailSent: !userEmailError,
      binaEmailSent: !binaEmailError
    });
  } catch (error) {
    console.error("[emailRoutes] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;