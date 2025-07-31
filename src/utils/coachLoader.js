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

// General instructions that apply to all AI interactions
const GENERAL_INSTRUCTIONS = {
  nicknameUsage:
    "Use the user's nickname when appropriate, but don't overuse it. Use it naturally in conversation - for example, when greeting them, acknowledging their progress, or when it feels personal and warm. Don't use it in every sentence or when it would feel forced or repetitive. IMPORTANT: Always use the nickname exactly as the user provided it in their own language - do not translate or transliterate it. If the user said their name is 'דנה', use 'דנה', not 'Dana'. If they said 'מיכל', use 'מיכל', not 'Michal'. Preserve the original language and spelling of their nickname.",
  genderLanguage:
    "Use appropriate gendered language based on the user's gender information. For male users, use masculine forms (he/him/his). For female users, use feminine forms (she/her/hers). If gender is not specified, use gender-neutral language. Pay attention to the user's language preference and match their communication style.",
};

// Utility to merge flow data with coach data
export function mergeFlowWithCoach(flowData, coachData) {
  if (!coachData) {
    return flowData;
  }

  const merged = { ...flowData };

  // Initialize systemInstructions if it doesn't exist
  if (!merged.systemInstructions) {
    merged.systemInstructions = {};
  }

  // Add general instructions first (as base layer)
  merged.systemInstructions = {
    ...GENERAL_INSTRUCTIONS,
    ...merged.systemInstructions,
  };

  // Merge coach-specific system instructions (overrides general if needed)
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
