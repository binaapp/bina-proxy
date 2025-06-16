// emailRoutes.js
const express = require('express');
const router = express.Router();
const { sendEmail } = require('./sesEmailService');
const axios = require('axios');

// Get the API base URL based on environment
function getApiBase() {
  const hostname = process.env.HOSTNAME || 'localhost';
  const isProduction = hostname === 'binaapp.com' || hostname === 'www.binaapp.com';
  const isStaging = hostname.includes('staging.binaapp.com');
  
  console.log("[emailRoutes] Environment detection:", {
    hostname,
    isProduction,
    isStaging,
    apiBase: isProduction ? 'https://api.binaapp.com' : isStaging ? 'https://api-staging.binaapp.com' : 'http://localhost:3001'
  });
  
  if (isProduction) {
    return 'https://api.binaapp.com';
  } else if (isStaging) {
    return 'https://api-staging.binaapp.com';
  } else {
    return 'http://localhost:3001';
  }
}

router.post('/send-reflection-email', async (req, res) => {
  console.log("[emailRoutes] ===== Starting send-reflection-email process =====");
  console.log("[emailRoutes] Received request body:", {
    hasSessionId: !!req.body.sessionId,
    hasFlowData: !!req.body.flowData,
    hasConversationHistory: !!req.body.conversationHistory,
    hasCurrentStep: !!req.body.currentStep,
    userEmail: req.body.userEmail,
    hasInstruction: !!req.body.instruction
  });

  const { sessionId, flowData, conversationHistory, currentStep, userEmail, instruction } = req.body;

  if (!userEmail) {
    console.error("[emailRoutes] Error: User email is required");
    return res.status(400).json({ error: "User email is required" });
  }

  try {
    console.log("[emailRoutes] Step 1: Preparing to call Claude API");
    const apiBase = getApiBase();
    console.log("[emailRoutes] Using API base:", apiBase);
    
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
    console.log("[emailRoutes] Claude request body prepared:", {
      model: claudeRequestBody.model,
      messageCount: claudeRequestBody.messages.length,
      hasSystem: !!claudeRequestBody.system
    });

    console.log("[emailRoutes] Step 2: Calling Claude API");
    try {
      const response = await axios.post(`${apiBase}/api/claude`, claudeRequestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("[emailRoutes] Claude API response received successfully");
      
      const data = response.data;
      console.log("[emailRoutes] Claude API response structure:", {
        hasContent: !!data.content,
        contentLength: data.content?.length,
        hasFirstContent: !!data.content?.[0],
        hasText: !!data.content?.[0]?.text
      });
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error("[emailRoutes] Invalid Claude response structure:", data);
        throw new Error("Invalid response structure from Claude API");
      }

      const summary = data.content[0].text;
      console.log("[emailRoutes] Step 3: Summary generated successfully");

      const summaryHtml = summary.replace(/\n/g, '<br>');
      const emailText = summary;
      const emailHtml = `
        <div style="white-space: pre-line;">${summary}</div>
        <p>Thank you for exploring your Genious Zone with us!</p>
      `;

      console.log("[emailRoutes] Step 4: Preparing to send emails");
      let userEmailSent = false;
      let binaEmailSent = false;

      // Send email to the user
      console.log("[emailRoutes] Step 5: Sending email to user:", userEmail);
      try {
        await sendEmail(
          userEmail,
          'Your Genious Zone Session Summary',
          emailText,
          emailHtml
        );
        console.log("[emailRoutes] User email sent successfully");
        userEmailSent = true;
      } catch (error) {
        console.error("[emailRoutes] Failed to send user email:", {
          error: error.message,
          code: error.code,
          stack: error.stack
        });
      }

      // Send email to bina@binaapp.com
      console.log("[emailRoutes] Step 6: Sending email to bina@binaapp.com");
      try {
        await sendEmail(
          'bina@binaapp.com',
          'Your Genious Zone Session Summary',
          emailText,
          emailHtml
        );
        console.log("[emailRoutes] Bina email sent successfully");
        binaEmailSent = true;
      } catch (error) {
        console.error("[emailRoutes] Failed to send bina email:", {
          error: error.message,
          code: error.code,
          stack: error.stack
        });
      }

      console.log("[emailRoutes] Step 7: Sending final response");
      res.json({ 
        success: true,
        userEmailSent,
        binaEmailSent
      });
      console.log("[emailRoutes] ===== Process completed successfully =====");
    } catch (claudeError) {
      console.error("[emailRoutes] Claude API error:", {
        message: claudeError.message,
        response: claudeError.response?.data,
        status: claudeError.response?.status
      });
      throw claudeError;
    }
  } catch (error) {
    console.error("[emailRoutes] ===== Process failed =====");
    console.error("[emailRoutes] Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;