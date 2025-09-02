<script setup>
/* eslint-disable */
import { ref, onMounted, watch } from "vue";
import { flowData } from '@/composables/useFlowData'
import TypingIndicator from './TypingIndicator.vue'
import { CLAUDE_MODELS } from '@/utils/config.js';

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
  },
  sessionRunner: {
    type: Object,
    default: null
  },
  userProfile: { // Add this prop
    type: Object,
    default: () => null
  }
});

watch(() => props.userProfile, (newProfile) => {
  console.log("[AiStep] 🔍 Received userProfile prop:", newProfile);
  console.log("[AiStep] UserProfile type:", typeof newProfile);
  console.log("[AiStep] UserProfile keys:", newProfile ? Object.keys(newProfile) : "null");
}, { immediate: true });

const emit = defineEmits(["step-result"]);

const isLoading = ref(false);
const error = ref(null);
const aiResponse = ref(null);
const systemMessage = ref("");

const hostname = window.location.hostname;

const API_URL = hostname.includes("staging.binaapp.com")
  ? "https://api-staging.binaapp.com"
  : hostname.includes("binaapp.com")
  ? "https://api.binaapp.com"
  : "http://localhost:3001";

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

    // Add coach's role (from coach data)
  if (instructions.role) {
    sections.push(instructions.role);
  }

  // Add session-specific role/goal (prefer top-level, fallback to legacy location)
  const sessionRole = props.flowData.sessionRole || instructions.sessionRole;
  if (sessionRole) {
    sections.push(`Session Goal: ${sessionRole}`);
  }

  // Add tone cues if available
  if (instructions.toneCues?.length) {
    sections.push(`Tone Cues: ${instructions.toneCues.join('; ')}`);
  }

  // Add coach profile information if available (now from flow data)
  if (props.flowData.coachProfile) {
    const profile = props.flowData.coachProfile;
    const profileSections = [];
    
    if (profile.background) {
      profileSections.push(`Background: ${profile.background}`);
    }
    
    if (profile.coachingSpecialties?.length) {
      profileSections.push(`Coaching Specialties: ${profile.coachingSpecialties.join(', ')}`);
    }
    
    if (profile.coachingStyle) {
      profileSections.push(`Coaching Style: ${profile.coachingStyle}`);
    }
    
    if (profile.signatureMethod) {
      const method = profile.signatureMethod;
      profileSections.push(`Signature Method - ${method.name}: ${method.description}`);
      if (method.stages?.length) {
        profileSections.push(`Method Stages: ${method.stages.join('; ')}`);
      }
    }
    
    if (profile.toolsUsed?.length) {
      profileSections.push(`Tools Used: ${profile.toolsUsed.join(', ')}`);
    }
    
    if (profile.personality?.length) {
      profileSections.push(`Personality: ${profile.personality.join(', ')}`);
    }
    
    if (profileSections.length > 0) {
      sections.push(`Coach Profile:\n${profileSections.join('\n')}`);
    }
  }

  // Add coach signature information if available (now from flow data)
  if (props.flowData.coachSignature) {
    const signature = props.flowData.coachSignature;
    const signatureSections = [];
    
    if (signature.coreBelief) {
      signatureSections.push(`Core Belief: ${signature.coreBelief}`);
    }
    
    if (signature.typicalTools?.length) {
      signatureSections.push(`Typical Tools: ${signature.typicalTools.join(', ')}`);
    }
    
    if (signature.metaphors?.length) {
      signatureSections.push(`Key Metaphors: ${signature.metaphors.join('; ')}`);
    }
    
    if (signature.phrases?.length) {
      signatureSections.push(`Signature Phrases: ${signature.phrases.join('; ')}`);
    }
    
    if (signature.unique_qualities?.length) {
      signatureSections.push(`Unique Qualities: ${signature.unique_qualities.join(', ')}`);
    }
    
    if (signatureSections.length > 0) {
      sections.push(`Coach Signature:\n${signatureSections.join('\n')}`);
    }
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
  systemMessage.value = buildSystemMessage();
  callClaude();
});

const callClaude = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    console.log("[AiStep] 🚀 callClaude started");
    console.log("[AiStep] UserProfile available:", !!props.userProfile);
    console.log("[AiStep] UserProfile content:", props.userProfile);

    // First check if the proxy server is running
    //const healthCheck = await fetch(`${API_URL}/health`);
    //if (!healthCheck.ok) {
    //  throw new Error("Proxy server is not responding");
    //}

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

    // Build the messages array - NO system role messages here
    const messages = [...formattedHistory, currentMessage];
    
    // Build the system message - include user profile information here
    let systemMessageContent = systemMessage.value;
    
    if (props.userProfile && Object.keys(props.userProfile).length > 0) {
      systemMessageContent += `\n\nUser Profile Information:\n${JSON.stringify(props.userProfile, null, 2)}\n\nUse this information to provide more personalized and contextual responses. Pay attention to the user's gender information and use appropriate gendered language (he/him/his for male users, she/her/hers for female users) when referring to the user in your responses.`;
    }

    const requestBody = {
      model: CLAUDE_MODELS.PRIMARY,
      max_tokens: 1000,
      temperature: 0.7,
      messages: messages, // Only user and assistant messages
      system: systemMessageContent, // User profile info goes in system parameter
    };

    // Add this log to see if user profile is being sent
    console.log("[AiStep] Sending to AI with user profile:", {
      hasUserProfile: !!props.userProfile,
      userProfile: props.userProfile,
      messages: requestBody.messages,
      systemLength: requestBody.system.length,
      currentMessage: currentMessage
    });

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

    // Log the raw response to help identify issues
    console.log("\n=== RAW RESPONSE TEXT ===\n", data.content[0].text);

    let parsedResponse;
    let fixedJson = data.content[0].text;

    // First, try to extract the JSON part if there's extra text
    const jsonMatch = fixedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      fixedJson = jsonMatch[0];
    }
    
    // Try to parse the JSON first without any "fixing"
    try {
      parsedResponse = JSON.parse(fixedJson);
      console.log("JSON parsed successfully without any fixes needed");
    } catch (initialParseError) {
      console.log("Initial parse failed, trying to fix JSON...");
      
      // Fix common JSON issues ONLY if needed
      try {
        // Try to fix unescaped quotes in the reply field
        fixedJson = fixedJson.replace(/("reply":\s*")(.*?)(")/gs, (match, p1, p2, p3) => {
          // Properly escape the content of the reply field
          const escapedContent = p2
            .replace(/\\/g, '\\\\')  // Escape backslashes first
            .replace(/"/g, '\\"')    // Escape quotes
            .replace(/\n/g, '\\n')   // Escape newlines
            .replace(/\r/g, '\\r')   // Escape carriage returns
            .replace(/\t/g, '\\t');  // Escape tabs
          return p1 + escapedContent + p3;
        });
        
        // NOW apply my fix AFTER the existing code
        fixedJson = fixedJson.replace(/\\"/g, '"');
        
        parsedResponse = JSON.parse(fixedJson);
        console.log("JSON fixed and parsed successfully");
      } catch (secondParseError) {
        console.log("Second parse attempt failed:", secondParseError.message);
        console.log("Fixed JSON attempt:", fixedJson);
        
        // Last resort: try to construct a minimal valid response
        try {
          // Extract status and reply using more flexible regex
          const statusMatch = fixedJson.match(/"status":\s*"([^"]+)"/);
          const replyMatch = fixedJson.match(/"reply":\s*"([^"]*)"|"reply":\s*"([^"]*?)(?<!\\)"|"reply":\s*"([^"]*?)(?<!\\)"/s);
          
          if (statusMatch && replyMatch) {
            const status = statusMatch[1];
            const reply = (replyMatch[1] || replyMatch[2] || replyMatch[3] || "").replace(/\\n/g, '\n');
            
            parsedResponse = {
              status: status,
              reply: reply
            };
            console.log("Constructed fallback response:", parsedResponse);
          } else {
            throw new Error("Could not extract status or reply from malformed JSON");
          }
        } catch (fallbackError) {
          console.error("All parsing attempts failed:", fallbackError);
          throw new Error(`JSON parsing failed: ${parseError.message}. Raw response: ${data.content[0].text.substring(0, 200)}...`);
        }
      }
    }

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
  <div v-else-if="error" class="ai-error-message">
    <p>
      There was a problem processing your request. Please try refreshing the page and continue again.<br>
      <span style="color: #888; font-size: 0.9em;">Error: {{ error }}</span>
    </p>
  </div>
</template>

<style scoped>
/* Optional loading styles */
</style>
