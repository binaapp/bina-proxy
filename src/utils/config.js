// Frontend feature flags
const FEATURE_FLAGS = {
  ENABLE_SESSION_END_LOGIC: false, // Set to false to disable
};

// Claude AI model configuration (for frontend API calls)
const CLAUDE_MODELS = {
  PRIMARY: "claude-sonnet-4-0",
  FALLBACK: "claude-3-opus-20240229",
  TERTIARY: "claude-3-haiku-20240307",
};

// Frontend-specific configuration
const FRONTEND_CONFIG = {
  // Add any frontend-specific settings here
  API_BASE_URL:
    process.env.NODE_ENV === "production"
      ? "https://binaapp.com"
      : "http://localhost:3001",
  // Add other frontend configs as needed
};

// Helper function to check if a flag is enabled
function isFeatureEnabled(flagName) {
  return FEATURE_FLAGS[flagName] === true;
}

// Export for ES modules (frontend only)
export { FEATURE_FLAGS, CLAUDE_MODELS, FRONTEND_CONFIG, isFeatureEnabled };
