// Feature flags for internal testing
export const FEATURE_FLAGS = {
  ENABLE_SESSION_END_LOGIC: true, // Set to false to disable
};

// Helper function to check if a flag is enabled
export function isFeatureEnabled(flagName) {
  return FEATURE_FLAGS[flagName] === true;
}
