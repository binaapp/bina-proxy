/* eslint-disable */
<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  history: Array,
  answer: String,
  systemPrompt: String,
  conditionDescription: String,
  nextQuestionInstruction: String,
  followupQuestionInstruction: String,
  generalInstructions: Array,
  goal: String,
  nextPhase: {
    type: Object,
    default: () => ({}),
  },
  coachData: {
    type: Object,
    required: true,
  },
  coachTool: String,
  reflection: String,
  followupReflection: String,
  followupQuestion: String,
  question: String,
  coachPresenceNote: String,
  styleGuide: {
    type: Object,
    default: () => ({
      tone: "warm, grounded, emotionally spacious",
      language: "reflective, precise, never vague or generalized",
      avoid: [
        "'That sounds like a lot'",
        "'you're going through a tough time'",
        "'that must be difficult'",
      ],
      prioritize: [
        "the user's exact phrasing",
        "emotional tone",
        "unspoken subtext",
        "slowness and presence over progression",
      ],
    }),
  },
  name: String,
});

const emit = defineEmits(["step-result"]);

const isLoading = ref(false);
const error = ref(null);
const aiResponse = ref(null);

const buildCoachingStyle = () => {
  return `
Coaching Style:
- Approach: ${props.coachData.approach}
- Tone of Voice: ${props.coachData.toneOfVoice}
- Level of Guidance: ${props.coachData.levelOfGuidance}
- Emotional Depth: ${props.coachData.emotionalDepth}
- Question Style: ${props.coachData.typeOfQuestions}
- Preferred Techniques: ${props.coachData.preferredToolsAndTechniques.join(
    ", "
  )}
- Success Definition: ${props.coachData.definitionOfSessionSuccess}
`;
};

const buildPrompt = () => {
  const generalInstructions = Array.isArray(props.generalInstructions)
    ? props.generalInstructions.join("\n")
    : "Always act as a coach, not a consultant.\nHelp the user reflect and take responsibility.\nAvoid giving advice; focus on powerful questions.\nKeep the tone warm, clear, and emotionally aware.";

  // Get current phase information from the current step
  const currentPhase = {
    name: props.name || "",
    goal: props.goal || "",
    condition: props.conditionDescription || "",
    question: props.nextQuestionInstruction || "",
    reflection:
      props.reflection ||
      "Help the user reflect on their emotional experience and insights gained",
    coachPresenceNote: props.coachPresenceNote || "",
    followupReflection: props.followupReflection || "",
    followupQuestion: props.followupQuestionInstruction || "",
    coachTool: props.coachTool || "",
  };

  // Get next phase information from props
  const nextPhase = props.nextPhase || {};

  console.log("Current Phase Data:", currentPhase);
  console.log("Next Phase Data:", nextPhase);

  const nextPhaseInstructions = `
Next Phase Information:
Name: ${nextPhase.name || ""}
Goal: ${nextPhase.goal || ""}
Condition: ${nextPhase.condition || ""}
Question: ${nextPhase.question || ""}
Reflection Focus: ${
    nextPhase.reflection ||
    "Help the user reflect on their emotional experience and insights gained"
  }
Coach Presence Note: ${nextPhase.coachPresenceNote || ""}
Coaching tools to use at this stage: ${nextPhase.coachTool || ""}`;

  const coachingStyle = buildCoachingStyle();

  return `
You are a warm, emotionally attuned human coach. You are not a chatbot, consultant, or assistant. You do not evaluate or analyze. Your sole purpose is to help the user feel seen, understood, and supported through emotionally rich reflection and one powerful question at a time.

You coach through presence—not performance.

Your tone is calm, grounded, and compassionate. You respond slowly and with care. You prioritize emotional truth over technical output. You are deeply curious about the user's emotional reality, and everything you say should reflect that curiosity and care.

You work within a structured flow, but your *relationship* with the user is always more important than moving them forward too quickly.

${coachingStyle}

Style Guide:
Tone: ${props.styleGuide.tone}
Language: ${props.styleGuide.language}
Avoid: ${props.styleGuide.avoid.join(", ")}
Prioritize: ${props.styleGuide.prioritize.join(", ")}

Global Coaching Guidelines:
${generalInstructions}

Current Phase Information:
Name: ${currentPhase.name}
Goal: ${currentPhase.goal}
Condition: ${currentPhase.condition}
Question: ${currentPhase.question}
Reflection Focus: ${currentPhase.reflection}
Coach Presence Note: ${currentPhase.coachPresenceNote}
Followup Reflection: ${currentPhase.followupReflection}
Followup Question: ${currentPhase.followupQuestion}
Coaching tools to use at this stage: ${currentPhase.coachTool}

${nextPhaseInstructions}

CRITICAL RESPONSE FORMAT INSTRUCTIONS:
1. You MUST ONLY return a valid JSON object.
2. DO NOT include any text before or after the JSON.
3. DO NOT include any explanations outside the JSON.
4. DO NOT engage in conversation outside the JSON.
5. The JSON object MUST follow this EXACT format:
{
  "status": "passed" or "retry",
  "reflection": "Your deep, emotionally resonant reflection that shows true understanding of their experience",
  "question": ["your follow-up question here"],
  "reasoning": "Explain here why you decided the condition was met or not met. Be specific about what criteria were satisfied or missing."
}

Evaluation Instructions:
1. Evaluate the user's answer according to this condition:
"${currentPhase.condition}"

2. If the condition is met:
- Set status to "passed"
- Use the question from the Next Phase Information section
- Explain why the condition was met

3. If the condition is not met:
- Set status to "retry"
- Use the followup question from the Current Phase Information section: "${
    currentPhase.followupQuestion
  }"
- Explain what criteria were missing

User's response to evaluate:
"${props.answer}"
`;
};

const callClaude = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // Check if proxy server is healthy
    const healthCheck = await fetch("http://127.0.0.1:3001/health");
    if (!healthCheck.ok) {
      throw new Error("Proxy server is not responding");
    }

    const prompt = buildPrompt();
    const response = await fetch("http://127.0.0.1:3001/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to get response from Claude"
      );
    }

    const data = await response.json();
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("Invalid response format from Claude");
    }

    try {
      const result = JSON.parse(data.content[0].text);
      aiResponse.value = result;
      emit("step-result", result);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", data.content[0].text);
      throw new Error("Invalid JSON response from Claude");
    }
  } catch (err) {
    console.error("Error calling Claude:", err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

onMounted(callClaude);
</script>

<template>
  <div v-if="isLoading">Processing...</div>
</template>

<style scoped>
/* Optional loading styles */
</style>
