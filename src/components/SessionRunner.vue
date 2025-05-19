<script setup>
/* eslint-disable no-unused-vars */
import { ref, reactive, computed, onMounted } from "vue";
import AiStep from "./AiStep.vue";
import { flowData } from "@/composables/useFlowData";
import { submitSession, API_URL } from "@/utils/sessionApi";
import { useRoute } from "vue-router";

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
  referralSource: {
    type: String,
    default: "direct",
  },
});

const emit = defineEmits([
  "message-sent",
  "ai-response",
  "session-complete",
  "update:userInput",
  "debug-message",
  "session-restored",
]);

const userInput = computed({
  get: () => props.userInput,
  set: (value) => emit("update:userInput", value),
});

const currentStepIndex = ref(0);
const sessionHistory = ref([]);
const isAwaitingAi = ref(false);
const userName = ref("");
const sessionStartTime = ref(new Date().toISOString());
const sessionId = ref(null);
const isSessionComplete = ref(false);
const currentStepDbId = ref(null);
const route = useRoute();

// === SESSION RESTORE LOGIC WITH LOGS ===
onMounted(async () => {
  const savedSessionId = localStorage.getItem("binaSessionId");
  console.log("[SessionRunner] onMounted: savedSessionId =", savedSessionId);
  if (savedSessionId) {
    try {
      const res = await fetch(`${API_URL}/${savedSessionId}`);
      console.log(
        "[SessionRunner] Fetched /api/session/:id, status:",
        res.status
      );
      if (res.ok) {
        const data = await res.json();
        console.log("[SessionRunner] Session data from backend:", data);
        sessionId.value = data.sessionId;
        userName.value = data.userName;
        sessionHistory.value = data.history;
        // Set currentStepIndex based on the last step in the DB
        if (data.steps && data.steps.length > 0) {
          const lastStep = data.steps[data.steps.length - 1];
          const idx = props.flowData.steps.findIndex(
            (step) => step.name === lastStep.step_id
          );
          if (idx !== -1) {
            currentStepIndex.value = idx;
            console.log(
              "[SessionRunner] Restored currentStepIndex:",
              currentStepIndex.value
            );

            // If just registered, move to next step and trigger system message
            if (
              route.query.justRegistered === "1" &&
              currentStepIndex.value < props.flowData.steps.length - 1
            ) {
              currentStepIndex.value += 1;
              console.log(
                "[SessionRunner] justRegistered detected, moved to next step:",
                currentStepIndex.value
              );

              // Trigger the next system message as if the user just advanced
              const nextStep = props.flowData.steps[currentStepIndex.value];
              if (nextStep) {
                let introText = nextStep.introText || "";
                if (userName.value) {
                  introText = introText.replace(/\{name\}/g, userName.value);
                }
                const systemMessage = [
                  introText.replace(/\\n/g, "\n"),
                  nextStep.question,
                  nextStep.options
                    ?.map((opt, i) => `${String.fromCharCode(97 + i)}. ${opt}`)
                    .join("\n"),
                ]
                  .filter(Boolean)
                  .join("\n\n");

                if (systemMessage.trim()) {
                  sessionHistory.value.push({
                    role: "assistant",
                    content: systemMessage,
                  });
                  console.log(
                    "[SessionRunner] Emitting ai-response for step:",
                    nextStep.name,
                    "showButton:",
                    nextStep.showButton
                  );

                  // Explicitly set showButton to false for closing step
                  const showButton =
                    nextStep.name === "closing" ? false : nextStep.showButton;

                  emit("ai-response", {
                    message: systemMessage,
                    type: "bot",
                    showButton: showButton || null,
                  });
                }
              }
            }
          }
        }
        // Emit restored session history to parent (ChatView)
        emit("session-restored", {
          history: data.history,
          lastStepId:
            data.steps && data.steps.length > 0
              ? data.steps[data.steps.length - 1].step_id
              : null,
        });
      } else {
        // Session not found, clear localStorage and start new session
        console.log(
          "[SessionRunner] Session not found in backend, clearing localStorage."
        );
        localStorage.removeItem("binaSessionId");
      }
    } catch (e) {
      console.error("[SessionRunner] Failed to restore session:", e);
    }
  } else {
    console.log("[SessionRunner] No saved sessionId in localStorage.");
  }
});

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
        showButton: firstStep.showButton || null,
      });
    }
  }
});

// Add this function to handle all database saves
const saveStepToDatabase = async (
  userText,
  systemText,
  isUpdate = false,
  overrideStepName = null
) => {
  try {
    const hostname = window.location.hostname;
    const isProduction =
      hostname === "binaapp.com" || hostname === "www.binaapp.com";

    const params = {
      sessionId: sessionId.value,
      startedAt: sessionStartTime.value,
      endedAt: new Date().toISOString(),
      completed: isSessionComplete.value,
      referralSource: props.referralSource,
      feedback:
        process.env.NODE_ENV === "development"
          ? "Test from UI"
          : hostname.includes("staging.binaapp.com")
          ? "staging"
          : "",
      flowSteps: [
        {
          stepId:
            overrideStepName ||
            props.flowData.steps[currentStepIndex.value]?.name ||
            "unknown",
          startedAt: new Date(Date.now() - 30000).toISOString(),
          endedAt: new Date().toISOString(),
          userText: userText,
          systemText: systemText,
          stepDbId: isUpdate ? currentStepDbId.value : undefined,
        },
      ],
    };

    console.log("Submitting step to database:", params);
    const response = await submitSession(params);
    console.log("Step saved to database:", response);

    // Only fire CompleteRegistration event in production
    if (params.completed && window.fbq && isProduction) {
      console.log("[FB Pixel] Firing CompleteRegistration event in production");
      fbq("track", "CompleteRegistration", {
        content_name: "Session Completed",
        status: "success",
      });
    } else if (params.completed) {
      console.log(
        "[FB Pixel] Skipping CompleteRegistration event - not in production environment"
      );
    }

    // Store session ID from first response and save to localStorage
    if (response?.sessionId) {
      sessionId.value = response.sessionId;
      localStorage.setItem("binaSessionId", response.sessionId);
      console.log(
        "[SessionRunner] Saved sessionId to localStorage:",
        response.sessionId
      );
    }

    // Store step DB ID if this is a new step
    if (!isUpdate && response?.stepId) {
      currentStepDbId.value = response.stepId;
    }

    // Save the new system message to the DB with empty userText
    if (response?.stepId) {
      currentStepDbId.value = response.stepId;
    }
  } catch (error) {
    console.error("Failed to save step:", error);
    // Show error to user (replace with your UI logic)
    alert("The server is not responding. Please try again.");
  }
};

const handleStepResult = async (result) => {
  emit("debug-message", "Received step result: " + result.status);

  // Save the AI result in session history first
  sessionHistory.value.push({
    role: "assistant",
    content: result.reply,
  });

  // For "finish" status, we'll use the next step's name
  let stepNameToUse = props.flowData.steps[currentStepIndex.value]?.name;
  if (
    result.status === "finish" &&
    currentStepIndex.value < props.flowData.steps.length - 1
  ) {
    // Use the next step's name instead
    stepNameToUse = props.flowData.steps[currentStepIndex.value + 1]?.name;
  }

  // Save system message to database immediately (except for the very first system message)
  if (sessionId.value) {
    await saveStepToDatabase("", result.reply, false, stepNameToUse);
  }

  // Prepare to send response to ChatView
  let responseMessage = result.reply;

  // Handle status (passed, retry, continue, finish)
  if (result.status === "finish") {
    // Check if the next step is the closing step
    if (currentStepIndex.value < props.flowData.steps.length - 1) {
      currentStepIndex.value++; // Move this AFTER saving to DB
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

          // Mark session as complete
          isSessionComplete.value = true;

          // Save the final combined message to the database
          await saveStepToDatabase("", responseMessage);
        }
      }
    }
  }

  // Send the complete response (may include both AI reply and closing message)
  const currentStep = props.flowData.steps[currentStepIndex.value];
  emit("ai-response", {
    message: responseMessage,
    type: "bot",
    showButton: currentStep?.showButton || null,
  });

  // Reset waiting state
  isAwaitingAi.value = false;
};

const handleUserSubmit = async () => {
  if (!userInput.value.trim()) return;

  const currentInputText = userInput.value;
  emit("update:userInput", "");
  userInput.value = "";

  // Get the previous system message (the one just shown to the user)
  const previousSystemMessage =
    sessionHistory.value.filter((msg) => msg.role === "assistant").pop()
      ?.content || "";

  // Add user message to history
  sessionHistory.value.push({
    role: "user",
    content: currentInputText,
  });

  // Notify ChatView of message sent
  emit("message-sent", {
    message: currentInputText,
    type: "user",
  });

  // Always save both system and user message together for this step
  await saveStepToDatabase(currentInputText, previousSystemMessage, true);

  const currentStep = props.flowData.steps[currentStepIndex.value];
  if (currentStep.collectsName) {
    userName.value = currentInputText.trim();
  }

  // Only advance for non-AI steps
  if (currentStep.callAPI === false) {
    if (currentStepIndex.value < props.flowData.steps.length - 1) {
      currentStepIndex.value++;
      const nextStep = props.flowData.steps[currentStepIndex.value];

      // Prepare the next system message
      let introText = nextStep.introText || "";
      if (userName.value) {
        introText = introText.replace(/\{name\}/g, userName.value);
      }

      const responseText = [
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
            showButton: nextStep.showButton || null,
          });
        }, 800);

        // Save the new system message to the DB with empty userText
        const response = await saveStepToDatabase("", responseText);
        if (response?.stepId) {
          currentStepDbId.value = response.stepId;
        }
      }

      // If next step is an API step, set waiting state
      if (nextStep.callAPI === true) {
        isAwaitingAi.value = true;
      }
    } else {
      // If this was the last step, you may want to mark session as complete here
      isSessionComplete.value = true;
    }
  } else {
    // For AI steps, just set waiting state and let handleStepResult decide advancement
    isAwaitingAi.value = true;
  }
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
