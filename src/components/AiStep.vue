<script setup>
/* eslint-disable */
import { ref, onMounted } from "vue";
import flowData from "@/data/flows/General.json";

const props = defineProps({
  history: Array,
  answer: String,
  systemPrompt: String,
  conditionDescription: String,
  nextQuestionInstruction: String,
  followupQuestionInstruction: String,
  //generalInstructions: Array,
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

// Define formatting instructions separately
const FORMATTING_INSTRUCTIONS = `CRITICAL RESPONSE FORMAT INSTRUCTIONS:
Formatting Instructions:

1. You MUST ONLY return a valid JSON object.  
2. DO NOT include any text before or after the JSON.  
3. DO NOT include any explanations outside the JSON.  
4. DO NOT engage in conversation outside the JSON.  
5. The JSON object MUST follow this EXACT format:

{
  "status": "passed" | "retry",
  "reply": "Your emotionally attuned response. This may include a reflection, a question, a coaching tool, or a gentle co-creation prompt—based on what best supports the user in the current phase. You may combine up to two of these if it feels natural, emotionally spacious, and aligned with the user's readiness. Do not overload the user. Always prioritize clarity, presence, and care.",
  "reasoning": "Explain here why you decided the condition was met or not met. Be specific about what criteria were satisfied or missing, based on the phase definition."
}`;

const isLoading = ref(false);
const error = ref(null);
const aiResponse = ref(null);
const systemMessage = ref("");

const API_URL = process.env.NODE_ENV === "production" ? "http://3.72.14.168:3001" : "http://localhost:3001";

const buildPhaseDefinitions = () => {
  // Find current phase index, skipping the start step
  const currentPhaseIndex = flowData.steps.findIndex(
    (step) => step.name === props.name
  );

  // Get only current and next phases
  const relevantPhases = flowData.steps.slice(
    currentPhaseIndex,
    currentPhaseIndex + 2
  );

  // Map phases with conditional field inclusion
  const phaseDefinitions = relevantPhases
    .map((step, index) => {
      const isCurrentPhase = index === 0;

      // Build the phase definition by only including fields that exist and have values
      const fields = [];

      fields.push(
        `${step.name.charAt(0).toUpperCase() + step.name.slice(1)} Phase:`
      );

      if (step.goal) fields.push(`Goal: ${step.goal}`);
      if (step.condition) fields.push(`Condition: ${step.condition}`);
      if (step.question) fields.push(`Question: ${step.question}`);

      // Only include followup fields for current phase
      if (isCurrentPhase && step.followupQuestion) {
        fields.push(`Followup Question: ${step.followupQuestion}`);
      }

      if (step.coachTool) fields.push(`Coach Tool: ${step.coachTool}`);
      if (step.reflection) fields.push(`Reflection: ${step.reflection}`);

      if (isCurrentPhase && step.followupReflection) {
        fields.push(`Followup Reflection: ${step.followupReflection}`);
      }

      if (step.coachPresenceNote) {
        fields.push(`Coach Presence Note: ${step.coachPresenceNote}`);
      }

      return fields.join("\n");
    })
    .filter(Boolean) // Remove any undefined phases
    .join("\n\n");

  return phaseDefinitions;
};

const buildSystemMessage = () => {
  const phaseDefinitions = buildPhaseDefinitions();

  return `
You are a warm, emotionally attuned coach—not a chatbot, consultant, or assistant. You do not analyze, diagnose, evaluate, or advise. Your purpose is to help the user feel deeply seen, understood, and gently empowered—through one emotionally spacious reply at a time.

You coach through presence, not performance. Speak slowly and with care. Your tone is calm, grounded, and emotionally spacious. Prioritize emotional truth over technical output. Stay deeply curious about the user's emotional world and respond to what is alive now—not what was already said.

When helpful, you may gently use a coaching tool (such as metaphor, belief work, body-based imagery, or values reflection) to support emotional insight—as long as your tone remains warm, slow, and non-directive. Coaching tools are provided in each phase and may be woven into your reply when appropriate.

Each reply must feel emotionally attuned, precise, and non-repetitive. You may include a reflection, a question, a coaching tool, or a gentle co-creation prompt. Most replies will include one or two of these—such as a reflection and a question, or a metaphor and an invitation to explore. Choose the combination that best supports the user's emotional process in the moment. Only combine elements when it feels emotionally natural and supportive. Never overload the user. Always prioritize emotional presence over progress.

Avoid generic phrases like "That must be difficult." Use the user's actual words or implied emotional tone. Do not repeat language, imagery, or emotional phrasing from earlier turns. Only move forward once the user has felt fully seen and expressed. If unsure, ask gently: "Is there anything else you'd like to share before we move on?" If the user writes in another language, respond in their language.

Co-Creation and Gentle Brainstorming:  
When the user seems stuck, uncertain, or curious, you may gently shift into a collaborative mode. Offer emotionally grounded prompts that help them think, imagine, or play with new possibilities. This can include light brainstorming, scenario flipping, "what if" questions, symbolic invitations, or exploring multiple paths forward. Always keep your tone warm, slow, and emotionally attuned—not directive or solution-focused. You are allowed to think with the user—as long as you do so gently, curiously, and in partnership.

Phase Evaluation Instructions:

Each user message will include "Current phase: [phase_name]".  
Use the corresponding phase definition to evaluate the user's message and determine whether they meet the condition to advance.

If the condition is met:
- Set "status": "passed".
- Transition to the next phase.
- Craft one emotionally attuned reply that supports the user in moving gently into the next phase. Use the phase's goal, tone, and coaching tool to guide your response. You may reflect, ask a question, offer a metaphor, or invite a new perspective—and you may combine up to two of these if it feels emotionally natural and supportive. Prioritize clarity, presence, and emotional readiness over progress.
- Do not use the followup reply from the next phase.

If the condition is not met:
- Set "status": "retry".
- Remain in the current phase.
- Craft a followup reply based on the user's most recent message, using the followup reply provided in the phase definition. You may also integrate the coaching tool from this phase—such as a metaphor, belief prompt, values exploration, or body-based imagery—if it feels emotionally supportive. You may combine up to two elements (e.g., reflection + question, or metaphor + prompt), as long as the tone remains spacious, warm, and non-directive.

Always include a "reasoning" field explaining why the condition was or wasn't met. Reference what was present or missing based on the phase definition—such as emotional depth, clarity, insight, or closure.

PHASE DEFINITIONS:

${phaseDefinitions}

${FORMATTING_INSTRUCTIONS}`;
};

onMounted(() => {
  // Build system message once when component mounts
  systemMessage.value = buildSystemMessage();
  callClaude();
});

const callClaude = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // First check if the proxy server is running
    const healthCheck = await fetch(`${API_URL}/health`);
    if (!healthCheck.ok) {
      throw new Error("Proxy server is not responding");
    }

    // Format the conversation history
    const formattedHistory = props.history.reduce((acc, message, index) => {
      // Skip role indicators
      if (message === "bot" || message === "user") {
        return acc;
      }

      // If message is already formatted, use it directly
      if (typeof message === "object" && message.role && message.content) {
        acc.push(message);
        return acc;
      }

      // For plain text messages, format with role from previous item
      const role = props.history[index - 1] === "bot" ? "assistant" : "user";
      acc.push({
        role: role,
        content: message,
      });
      return acc;
    }, []);

    // Build current message - only include phase and current answer
    const currentMessage = {
      role: "user",
      content: `Current phase: ${props.name}\n${props.answer || ""}`,
    };

    const requestBody = {
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [...formattedHistory, currentMessage],
      system: FORMATTING_INSTRUCTIONS,
    };

    // Chen Only add full system message on the very first interaction
    // if (formattedHistory.length === 2 && props.name === "situation") {
    //   requestBody.system = systemMessage.value;
    // }
    requestBody.system = systemMessage.value;
    // Enhanced logging
    console.log("\n=== REQUEST DETAILS ===");
    console.log("Current Phase:", props.name);
    console.log("Message Count:", formattedHistory.length + 1);
    console.log("Using System Message:", Boolean(requestBody.system));

    if (requestBody.system) {
      console.log("\n=== SYSTEM MESSAGE ===");
      console.log(
        requestBody.system === systemMessage.value
          ? "Full System Message"
          : "Formatting Instructions Only"
      );
      console.log("Length:", requestBody.system.length);
      console.log(requestBody.system);
    }

    console.log("\n=== CONVERSATION HISTORY ===");
    formattedHistory.forEach((msg, idx) => {
      console.log(
        `[${idx + 1}] ${msg.role} (length: ${msg.content.length}):`,
        msg.content
      );
    });

    console.log("\n=== CURRENT MESSAGE ===");
    console.log(`role: ${currentMessage.role}`);
    console.log(`length: ${currentMessage.content.length}`);
    console.log(`content: ${currentMessage.content}`);

    const response = await fetch(`${API_URL}/api/claude`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("\n=== CLAUDE RESPONSE ===\n", data);

    try {
      const parsedResponse = JSON.parse(data.content[0].text);
      console.log("\n=== PARSED RESPONSE ===\n", parsedResponse);
      aiResponse.value = parsedResponse;
      emit("step-result", parsedResponse);
    } catch (parseError) {
      console.error("Failed to parse Claude's response:", parseError);
      error.value = "Failed to parse Claude's response";
    }
  } catch (err) {
    console.error("Error in callClaude:", err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="isLoading"></div>
</template>

<style scoped>
/* Optional loading styles */
</style>
