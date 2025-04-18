<script setup>
/* eslint-disable */
import { ref, onMounted, watch } from "vue";
import { flowData } from '@/composables/useFlowData'
import TypingIndicator from './TypingIndicator.vue'

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
  flowData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["step-result"]);

const isLoading = ref(false);
const error = ref(null);
const aiResponse = ref(null);
const systemMessage = ref("");

const API_URL = process.env.NODE_ENV === "production" ? "http://3.72.14.168:3001" : "http://localhost:3001";

const buildPhaseDefinitions = () => {
  // Find current phase index
  const currentPhaseIndex = props.flowData.steps.findIndex(
    (step) => step.name === props.name
  );

  if (currentPhaseIndex === -1) {
    console.error(`Phase with name ${props.name} not found in flow data.`);
    return "";
  }

  // Get only current and next phases (if available)
  const relevantPhases = props.flowData.steps.slice(
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
      if (step.instruction) fields.push(`Instruction: ${step.instruction}`);
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

      // Include phase evaluation if available (important for persona-identification and coaching-flow)
      if (step.phaseEvaluation) {
        fields.push(
          `Phase Evaluation: ${JSON.stringify(step.phaseEvaluation, null, 2)}`
        );
      }

      return fields.join("\n");
    })
    .filter(Boolean) // Remove any undefined phases
    .join("\n\n");

  return phaseDefinitions;
};

const buildSystemMessage = () => {
  const phaseDefinitions = buildPhaseDefinitions();
  const instructions = props.flowData.systemInstructions || {};
  
  const sections = [];

  // Add coach's presence note if available
  if (props.coachData?.coachPresenceNote) {
    sections.push(props.coachData.coachPresenceNote);
  }

  if (instructions.role) {
    sections.push(instructions.role);
  }

  if (instructions.coachingStyle?.length) {
    sections.push(instructions.coachingStyle.join('. ') + '.');
  }

  if (instructions.toolUsage) {
    sections.push(instructions.toolUsage);
  }

  if (instructions.replyGuidelines) {
    const { requirements, elements, combination } = instructions.replyGuidelines;
    const guidelinesParts = [];
    if (requirements) guidelinesParts.push(requirements);
    if (elements) guidelinesParts.push(`You may include ${elements.join(', ')}`);
    if (combination) guidelinesParts.push(combination);
    if (guidelinesParts.length) {
      sections.push(guidelinesParts.join('. '));
    }
  }

  // Add phase evaluation instructions
  if (instructions.phaseEvaluation) {
    const { instructions: evalInstructions, conditions, reasoning, endCriteria } = instructions.phaseEvaluation;
    const phaseEvalParts = [];

    phaseEvalParts.push('Phase Evaluation Instructions:');
    phaseEvalParts.push(evalInstructions);

    // Add conditions
    Object.entries(conditions).forEach(([status, details]) => {
      phaseEvalParts.push(`\nIf ${details.when}:`);
      details.actions.forEach(action => {
        phaseEvalParts.push(`- ${action}`);
      });
    });

    // Add end criteria if present
    if (endCriteria?.length) {
      phaseEvalParts.push('\nEnd Criteria:');
      endCriteria.forEach(criterion => {
        phaseEvalParts.push(`- ${criterion}`);
      });
    }

    // Add reasoning requirement if present
    if (reasoning) {
      phaseEvalParts.push(`\n${reasoning}`);
    }

    sections.push(phaseEvalParts.join('\n'));
  }

  // Include style guide from the flow data
  if (props.flowData.styleGuide) {
    sections.push(`Style Guide:\n${JSON.stringify(props.flowData.styleGuide, null, 2)}`);
  }

  // Include response format from the flow data (this is in Burnout.json at the top level)
  if (props.flowData.responseFormat) {
    const { rules, format } = props.flowData.responseFormat;
    sections.push('CRITICAL RESPONSE FORMAT INSTRUCTIONS:');
    
    if (rules && Array.isArray(rules)) {
      sections.push(rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n'));
    }
    
    if (format) {
      sections.push(`The JSON object MUST follow this EXACT format:\n${JSON.stringify(format, null, 2)}`);
    }
  }

  sections.push('PHASE DEFINITIONS:', phaseDefinitions);

  return sections.filter(Boolean).join('\n\n');
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
        role,
        content: message,
      });
      return acc;
    }, []);

    const currentMessage = {
      role: "user",
      content: `Current phase: ${props.name}\n${props.answer || ""}`,
    };

    const requestBody = {
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [...formattedHistory, currentMessage],
      system: systemMessage.value,
    };

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
      // Log the raw response to help identify issues
      console.log("\n=== RAW RESPONSE TEXT ===\n", data.content[0].text);
      
      // Simple fix: Remove all control characters (0-31 and 127-159)
      const cleanedText = data.content[0].text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      const parsedResponse = JSON.parse(cleanedText);
      console.log("\n=== PARSED RESPONSE ===\n", parsedResponse);
      
      // Validate response format based on flow's responseFormat
      const expectedFormat = props.flowData.responseFormat?.format || {};
      const validationErrors = [];
      
      // Check each required field exists
      Object.keys(expectedFormat).forEach(field => {
        if (!parsedResponse.hasOwnProperty(field)) {
          validationErrors.push(`Missing required field: ${field}`);
        }
      });

      // Check status values are valid
      if (expectedFormat.status) {
        const allowedStatuses = expectedFormat.status.split('|').map(s => s.trim());
        if (!allowedStatuses.includes(parsedResponse.status)) {
          validationErrors.push(`Invalid status value. Expected one of: ${allowedStatuses.join(', ')}`);
        }
      }

      if (validationErrors.length > 0) {
        throw new Error(`Invalid response format: ${validationErrors.join('; ')}`);
      }

      aiResponse.value = parsedResponse;
      emit("step-result", parsedResponse);
    } catch (parseError) {
      console.error("Failed to parse or validate Claude's response:", parseError);
      console.error("Check the logged RAW RESPONSE TEXT for problematic characters");
      error.value = parseError.message;
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
