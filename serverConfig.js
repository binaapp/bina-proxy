// Server-side Claude AI model configuration
const CLAUDE_MODELS = {
  PRIMARY: "claude-3-5-sonnet-20241022",
  FALLBACK: "claude-3-opus-20240229",
  TERTIARY: "claude-3-haiku-20240307",
};

// Server-side feature flags
const SERVER_FEATURE_FLAGS = {
  ENABLE_SESSION_END_LOGIC: true,
};

// Helper function to check if a flag is enabled
function isServerFeatureEnabled(flagName) {
  return SERVER_FEATURE_FLAGS[flagName] === true;
}

module.exports = {
  CLAUDE_MODELS,
  SERVER_FEATURE_FLAGS,
  isServerFeatureEnabled,
}; 