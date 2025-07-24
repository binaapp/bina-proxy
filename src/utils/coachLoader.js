// Utility to load coach data by coach ID
export async function loadCoachData(coachId) {
  try {
    const coachMap = {
      maia: () => import("@/data/coaches/CoachMaia.json"),
      "bina-coach": () => import("@/data/coaches/supportive-coach.json"),
    };

    if (coachMap[coachId]) {
      const module = await coachMap[coachId]();
      return module.default;
    } else {
      console.error(`Coach not found: ${coachId}`);
      // Fallback to default coach
      const module = await import("@/data/coaches/supportive-coach.json");
      return module.default;
    }
  } catch (error) {
    console.error(`Failed to load coach data for ${coachId}:`, error);
    // Fallback to default coach
    try {
      const module = await import("@/data/coaches/supportive-coach.json");
      return module.default;
    } catch (fallbackError) {
      console.error("Failed to load fallback coach:", fallbackError);
      return null;
    }
  }
}

// Utility to merge flow data with coach data
export function mergeFlowWithCoach(flowData, coachData) {
  if (!coachData) {
    return flowData;
  }

  const merged = { ...flowData };

  // Merge system instructions
  if (coachData.systemInstructions) {
    merged.systemInstructions = {
      ...merged.systemInstructions,
      ...coachData.systemInstructions,
    };
  }

  // Add coach profile and signature
  if (coachData.coachProfile) {
    merged.coachProfile = coachData.coachProfile;
  }

  if (coachData.coachSignature) {
    merged.coachSignature = coachData.coachSignature;
  }

  if (coachData.name) {
    merged.coachName = coachData.name;
  }

  return merged;
}
