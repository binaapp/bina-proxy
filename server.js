require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://binaapp.s3-website.eu-north-1.amazonaws.com",
    "https://bina-burnout-proxy.onrender.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization"],
};

app.use(cors(corsOptions));
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
    // Validate request body
    if (!req.body || !req.body.messages || !Array.isArray(req.body.messages)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Request must include 'messages' array",
      });
    }

    console.log("Forwarding request to Claude API:", {
      model: req.body.model,
      messageCount: req.body.messages.length,
    });

    const claudeRequest = {
      model: req.body.model || "claude-3-opus-20240229",
      max_tokens: req.body.max_tokens || 1000,
      temperature: req.body.temperature || 0.7,
      messages: req.body.messages,
      system: req.body.system,
    };

    // Check for API key
    const CLAUDE_API_KEY = process.env.VUE_APP_CLAUDE_API_KEY;
    if (!CLAUDE_API_KEY) {
      throw new Error("Claude API key not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(claudeRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Claude API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      return res.status(response.status).json({
        error: "Claude API Error",
        message: errorData?.error?.message || response.statusText,
        status: response.status,
        details: errorData,
      });
    }

    const data = await response.json();
    console.log("Claude API response received");
    res.json(data);
  } catch (error) {
    console.error("Error in /api/claude:", error);
    next(error);
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
app.listen(port, '0.0.0.0', () => {
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
