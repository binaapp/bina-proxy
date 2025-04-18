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

  // Save the result in session history
  sessionHistory.value.push({
    role: "assistant",
    content: result.reply,
  });

  // Emit AI response to ChatView
  emit("ai-response", {
    message: result.reply,
    type: "bot",
  });

  // Handle status (passed, retry, continue, finish)
  if (result.status === "passed" || result.status === "finish") {
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

  // Handle non-API steps directly
  if (currentStep.callAPI === false) {
    emit("debug-message", "Non-API step, handling directly");

    // Move to next step
    if (currentStepIndex.value < props.flowData.steps.length - 1) {
      currentStepIndex.value++;
      const nextStep = props.flowData.steps[currentStepIndex.value];

      // If next step has content, display it
      const responseText = [
        nextStep.introText?.replace(/\\n/g, "\n"),
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
