// Feature flags for internal testing
const FEATURE_FLAGS = {
  ENABLE_SESSION_END_LOGIC: true, // Set to false to disable
};

// Claude AI model configuration
const CLAUDE_MODELS = {
  PRIMARY: "claude-sonnet-4-0",
  FALLBACK: "claude-3-opus-20240229",
  TERTIARY: "claude-3-haiku-20240307",
};

// Helper function to check if a flag is enabled
function isFeatureEnabled(flagName) {
  return FEATURE_FLAGS[flagName] === true;
}

// Export for CommonJS
module.exports = {
  FEATURE_FLAGS,
  CLAUDE_MODELS,
  isFeatureEnabled,
};
