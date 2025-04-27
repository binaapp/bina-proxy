require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const mysql = require("mysql2/promise");

// Debug logging for environment variables
console.log("Environment variables loaded:", {
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  HAS_USER: !!process.env.DB_USER,
  HAS_PASSWORD: !!process.env.DB_PASSWORD,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
console.log("🌍 Connected to DB:", process.env.DB_HOST, process.env.DB_NAME);

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://binaapp.s3-website.eu-north-1.amazonaws.com",
    "http://3.72.14.168:3001",
    "http://binaapp.s3-website.eu-north-1.amazonaws.com/",
  ],
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  exposedHeaders: ["Content-Length", "Content-Type"],
  maxAge: 600, // Cache preflight requests for 10 minutes
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get(["/", "/health"], (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "claude-proxy",
  });
});

// Claude API endpoint
app.post("/api/claude", async (req, res, next) => {
  try {
    // Log the incoming request
    console.log("Received request:", {
      body: req.body,
      headers: req.headers,
      url: req.url,
      method: req.method,
    });

    // Validate request body
    if (!req.body) {
      console.error("No request body received");
      return res.status(400).json({
        error: "Bad Request",
        message: "Request body is required",
      });
    }

    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      console.error("Invalid messages array:", req.body.messages);
      return res.status(400).json({
        error: "Bad Request",
        message: "Request must include 'messages' array",
        received: req.body,
      });
    }

    // Validate each message in the array
    const invalidMessages = req.body.messages.filter((msg) => {
      return !msg.role || !msg.content || typeof msg.content !== "string";
    });

    if (invalidMessages.length > 0) {
      console.error("Invalid message format:", invalidMessages);
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Each message must have 'role' and 'content' (string) properties",
        invalidMessages: invalidMessages,
      });
    }

    const claudeRequest = {
      model: req.body.model || "claude-3-opus-20240229",
      max_tokens: req.body.max_tokens || 1000,
      temperature: req.body.temperature || 0.7,
      messages: req.body.messages,
      system: req.body.system,
    };

    console.log("Formatted Claude request:", {
      model: claudeRequest.model,
      messageCount: claudeRequest.messages.length,
      firstMessage: claudeRequest.messages[0],
      lastMessage: claudeRequest.messages[claudeRequest.messages.length - 1],
    });

    // Check for API key
    const CLAUDE_API_KEY = process.env.VUE_APP_CLAUDE_API_KEY;
    if (!CLAUDE_API_KEY) {
      console.error("Missing Claude API key in environment variables");
      return res.status(500).json({
        error: "Server Configuration Error",
        message: "Claude API key not configured",
      });
    }

    let response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(claudeRequest),
      });

      console.log("Claude API response headers:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Claude API error response:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          request: {
            model: claudeRequest.model,
            messageCount: claudeRequest.messages.length,
          },
        });

        return res.status(response.status).json({
          error: "Claude API Error",
          message: errorData?.error?.message || response.statusText,
          status: response.status,
          details: errorData,
        });
      }

      const data = await response.json();
      console.log("Successfully received response from Claude API");
      //data.content = data.content?.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      res.json(data);
    } catch (fetchError) {
      console.error("Fetch error:", {
        message: fetchError.message,
        name: fetchError.name,
        stack: fetchError.stack,
        code: fetchError.code,
      });

      return res.status(500).json({
        error: "Network Error",
        message: "Failed to connect to Claude API",
        details: fetchError.message,
      });
    }
  } catch (error) {
    console.error("Unhandled error in /api/claude:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      env: {
        hasApiKey: !!process.env.VUE_APP_CLAUDE_API_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
app.post("/api/session", async (req, res) => {
  try {
    const {
      sessionId: id,
      startTimestamp,
      endTimestamp,
      completed,
      referralSource,
      feedback,
      deviceInfo,
      flowSteps,
    } = req.body;

    console.log("Raw request body:", req.body);
    console.log("Destructured sessionId value:", id);
    console.log("sessionId type:", typeof id);

    const MYSQL_MAX_INT = 2147483647;
    // Check if id is invalid (null, undefined, exceeds MySQL INT limits, or is not a number)
    const isInvalidId =
      !id || isNaN(Number(id)) || Number(id) > MYSQL_MAX_INT || Number(id) <= 0;

    const connection = await pool.getConnection();
    let resultId;
    let stepIdToReturn = undefined;

    if (isInvalidId) {
      console.log("Invalid or missing session ID. Creating new session...");

      // First, get the last valid ID from the database
      const [lastIdResult] = await connection.query(
        "SELECT MAX(id) as maxId FROM user_sessions WHERE id <= ?",
        [MYSQL_MAX_INT]
      );
      const lastValidId = lastIdResult[0].maxId || 0;
      console.log("Last valid ID in database:", lastValidId);

      // Reset the auto_increment if needed
      if (lastValidId < MYSQL_MAX_INT) {
        await connection.query("ALTER TABLE user_sessions AUTO_INCREMENT = ?", [
          lastValidId + 1,
        ]);
      }

      // 🔁 Save session data to user_sessions
      const [sessionResult] = await connection.query(
        `INSERT INTO user_sessions (start_timestamp, end_timestamp, completed, referral_source, feedback, device_info)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          startTimestamp,
          endTimestamp,
          completed,
          referralSource,
          feedback,
          JSON.stringify(deviceInfo),
        ]
      );
      resultId = sessionResult.insertId;
      console.log("Created new session with ID:", resultId);
    } else {
      console.log("Updating existing session:", id);
      resultId = id;
      // Update existing session
      const [updateResult] = await connection.query(
        `UPDATE user_sessions 
         SET end_timestamp = ?, completed = ?
         WHERE id = ?`,
        [endTimestamp, completed, id]
      );
      console.log("Update result:", updateResult);
    }

    // 💾 Save each step to session_steps
    if (Array.isArray(flowSteps) && flowSteps.length > 0) {
      const step = flowSteps[0]; // Only handle one step at a time

      if (step.stepDbId) {
        // UPDATE existing step
        await connection.query(
          `UPDATE session_steps
           SET user_text = ?, ended_at = ?
           WHERE id = ?`,
          [step.userText, step.endedAt, step.stepDbId]
        );
        stepIdToReturn = step.stepDbId;
      } else {
        // INSERT new step
        const [stepResult] = await connection.query(
          `INSERT INTO session_steps (session_id, step_id, started_at, ended_at, user_text, system_text)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            resultId,
            step.stepId,
            step.startedAt,
            step.endedAt,
            step.userText,
            step.systemText,
          ]
        );
        stepIdToReturn = stepResult.insertId;
      }
    }

    connection.release();
    res.json({ success: true, sessionId: resultId, stepId: stepIdToReturn });
  } catch (err) {
    console.error("Error saving session:", err);
    console.error("Error details:", err.message);
    res.status(500).json({ error: "Failed to save session" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

const port = process.env.PORT || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`
=== Claude API Proxy Server ===
Server running at:
- http://localhost:${port}
- http://127.0.0.1:${port}

Health check endpoints:
- http://localhost:${port}/health
- http://localhost:${port}/

API endpoint:
- http://localhost:${port}/api/claude

Press Ctrl+C to stop the server
`);
});
