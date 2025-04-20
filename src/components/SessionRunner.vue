<script setup>
/* eslint-disable no-unused-vars */
import { ref, reactive, computed, onMounted } from "vue";
import AiStep from "./AiStep.vue";
import { flowData } from "@/composables/useFlowData";

const props = defineProps({
  flowData: {
    type: Object,
    required: true,
  },
  coachData: {
    type: Object,
    required: true,
  },
  userInput: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "message-sent",
  "ai-response",
  "session-complete",
  "update:userInput",
  "debug-message",
]);

const userInput = computed({
  get: () => props.userInput,
  set: (value) => emit("update:userInput", value),
});

const currentStepIndex = ref(0);
const sessionHistory = ref([]);
const isAwaitingAi = ref(false);
const userName = ref("");

// Initialize chat with first message
onMounted(() => {
  // Check if it's the first step and has introText
  const firstStep = props.flowData.steps[0];
  if (firstStep && firstStep.introText) {
    const initialMessage = [
      firstStep.introText.replace(/\\n/g, "\n"),
      firstStep.question,
      firstStep.options
        ?.map((opt, i) => `${String.fromCharCode(97 + i)}. ${opt}`)
        .join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n");

    if (initialMessage.trim()) {
      // Save to session history
      sessionHistory.value.push({
        role: "assistant",
        content: initialMessage,
      });

      emit("ai-response", {
        message: initialMessage,
        type: "bot",
      });
    }
  }
});

const handleStepResult = async (result) => {
  emit("debug-message", "Received step result: " + result.status);

  // Prepare to send response to ChatView
  let responseMessage = result.reply;

  // Save the AI result in session history
  sessionHistory.value.push({
    role: "assistant",
    content: result.reply,
  });

  // Handle status (passed, retry, continue, finish)
  if (result.status === "finish") {
    // Check if the next step is the closing step
    if (currentStepIndex.value < props.flowData.steps.length - 1) {
      currentStepIndex.value++;
      const nextStep = props.flowData.steps[currentStepIndex.value];

      // Check if next step is the closing message with no API call
      if (nextStep.name === "closing" && nextStep.callAPI === false) {
        // Create the closing message text
        const closingText = [
          nextStep.introText?.replace(/\\n/g, "\n"),
          nextStep.question,
          nextStep.options
            ?.map((opt, i) => `${String.fromCharCode(97 + i)}. ${opt}`)
            .join("\n"),
        ]
          .filter(Boolean)
          .join("\n\n");

        if (closingText.trim()) {
          // Save closing message to history
          sessionHistory.value.push({
            role: "assistant",
            content: closingText,
          });

          // Combine both messages with a separator
          responseMessage = responseMessage + "\n\n---\n\n" + closingText;

          // Signal session complete
          setTimeout(() => {
            emit("session-complete", {
              history: sessionHistory.value,
            });
          }, 1000);
        }
      }
    }
  } else if (result.status === "passed") {
    // Move to next step if available
    if (currentStepIndex.value < props.flowData.steps.length - 1) {
      currentStepIndex.value++;
      const nextStep = props.flowData.steps[currentStepIndex.value];

      // If the next step doesn't need an API call and has content, send it
      if (nextStep.callAPI === false) {
        const messageText = [
          nextStep.introText?.replace(/\\n/g, "\n"),
          nextStep.question,
          nextStep.options
            ?.map((opt, i) => `${String.fromCharCode(97 + i)}. ${opt}`)
            .join("\n"),
        ]
          .filter(Boolean)
          .join("\n\n");

        if (messageText.trim()) {
          // Save to session history
          sessionHistory.value.push({
            role: "assistant",
            content: messageText,
          });

          // Wait a moment before showing the next message
          setTimeout(() => {
            emit("ai-response", {
              message: messageText,
              type: "bot",
            });
          }, 1000);
        }
      }
    } else {
      // Session is complete
      emit("session-complete", {
        history: sessionHistory.value,
      });
    }
  }

  // Send the complete response (may include both AI reply and closing message)
  emit("ai-response", {
    message: responseMessage,
    type: "bot",
  });

  // Reset waiting state
  isAwaitingAi.value = false;
};

const handleUserSubmit = () => {
  if (!userInput.value.trim()) return;

  emit("debug-message", "Processing user input: " + userInput.value);

  // Add user message to history
  sessionHistory.value.push({
    role: "user",
    content: userInput.value,
  });

  // Notify ChatView of message sent
  emit("message-sent", {
    message: userInput.value,
    type: "user",
  });

  // Get current step
  const currentStep = props.flowData.steps[currentStepIndex.value];

  // Check if this step collects the user's name
  if (currentStep.collectsName) {
    // Store the user's name
    userName.value = userInput.value.trim();
    emit("debug-message", "Stored user name: " + userName.value);
  }

  // Handle non-API steps directly
  if (currentStep.callAPI === false) {
    emit("debug-message", "Non-API step, handling directly");

    // Move to next step
    if (currentStepIndex.value < props.flowData.steps.length - 1) {
      currentStepIndex.value++;
      const nextStep = props.flowData.steps[currentStepIndex.value];

      // Process intro text with name placeholder if we have a username
      let introText = nextStep.introText || "";
      if (userName.value) {
        introText = introText.replace(/\{name\}/g, userName.value);
      }

      // Assemble the full message
      let responseText = [
        introText.replace(/\\n/g, "\n"),
        nextStep.question,
        nextStep.options
          ?.map((opt, i) => `${String.fromCharCode(97 + i)}. ${opt}`)
          .join("\n"),
      ]
        .filter(Boolean)
        .join("\n\n");

      if (responseText.trim()) {
        // Save to session history
        sessionHistory.value.push({
          role: "assistant",
          content: responseText,
        });

        setTimeout(() => {
          emit("ai-response", {
            message: responseText,
            type: "bot",
          });
        }, 800);
      }

      // If next step is an API step, set waiting state immediately
      if (nextStep.callAPI === true) {
        isAwaitingAi.value = true;
      }
    }
  } else {
    // Set waiting state for API steps
    isAwaitingAi.value = true;
  }

  // Clear input
  userInput.value = "";
};

// Expose necessary state and methods to parent
defineExpose({
  isAwaitingAi,
  currentStep: computed(
    () => props.flowData.steps[currentStepIndex.value] || {}
  ),
  handleUserSubmit,
  currentStepIndex,
});
</script>

<template>
  <!-- ONLY include AiStep, no visible UI elements -->
  <AiStep
    v-if="
      isAwaitingAi && props.flowData.steps[currentStepIndex].callAPI !== false
    "
    :history="sessionHistory"
    :answer="userInput"
    :conditionDescription="
      props.flowData.steps[currentStepIndex].condition || ''
    "
    :nextQuestionInstruction="
      props.flowData.steps[currentStepIndex].nextQuestion || ''
    "
    :followupQuestionInstruction="
      props.flowData.steps[currentStepIndex].followupQuestion || ''
    "
    :flow-data="props.flowData"
    :coach-data="coachData"
    :name="props.flowData.steps[currentStepIndex].name"
    @step-result="handleStepResult"
  />
</template>
