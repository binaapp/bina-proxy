<script setup>
/* eslint-disable no-unused-vars */
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import AiStep from "./AiStep.vue";
import {
  submitSession,
  API_URL,
  handleAction,
  getApiBase,
} from "@/utils/sessionApi";
import { useRoute } from "vue-router";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

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
  "ai-step-trigger",
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
const lastUserInput = ref("");
const userProfile = ref(null); // Add this line

// Add this reactive user state
const currentUser = ref(null);

// Add this computed property to log when userProfile changes
const userProfileForLogging = computed(() => {
  console.log(
    "[SessionRunner] 🔍 userProfile value changed:",
    userProfile.value
  );
  return userProfile.value;
});

// Add this function to load user profile
const loadUserProfile = async (uid) => {
  try {
    console.log("[SessionRunner] Loading user profile for UID:", uid);
    const response = await fetch(`${getApiBase()}/api/user-profile/${uid}`);

    console.log("[SessionRunner] API response status:", response.status);
    console.log("[SessionRunner] API response ok:", response.ok);

    if (response.ok) {
      const profileData = await response.json();
      userProfile.value = profileData;
      console.log(
        "[SessionRunner] ✅ User profile loaded successfully:",
        profileData
      );
      console.log(
        "[SessionRunner] User profile keys:",
        Object.keys(profileData)
      );
      console.log(
        "[SessionRunner] User profile strengths:",
        profileData.strengths
      );
      console.log("[SessionRunner] User profile goals:", profileData.goals);
    } else {
      console.log(
        "[SessionRunner] ❌ No existing user profile found, starting fresh"
      );
      const errorText = await response.text();
      console.log("[SessionRunner] Error response:", errorText);

      userProfile.value = {
        strengths: [],
        weaknesses: [],
        paradigms: [],
        user_values: [],
        goals: [],
        intuition: [],
        tools_used: [],
        Not_to_do: [],
        user_history: null,
        user_stories: [],
        user_language: [],
        current_mission: [],
        learning_history: [],
        notes: null,
      };
    }
  } catch (error) {
    console.error("[SessionRunner] ❌ Failed to load user profile:", error);
    // Initialize with empty profile on error
    userProfile.value = {
      strengths: [],
      weaknesses: [],
      paradigms: [],
      user_values: [],
      goals: [],
      intuition: [],
      tools_used: [],
      Not_to_do: [],
      user_history: null,
      user_stories: [],
      user_language: [],
      current_mission: [],
      learning_history: [],
      notes: null,
    };
  }
};

// === SESSION RESTORE LOGIC WITH SESSION NAME VALIDATION ===
onMounted(async () => {
  try {
    console.log("[SessionRunner] 🚀 onMounted started");

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "[SessionRunner]  Auth state changed:",
        user ? user.uid : "No user"
      );
      currentUser.value = user;

      if (user) {
        console.log(
          "[SessionRunner] 🔄 Loading user profile for authenticated user"
        );
        await loadUserProfile(user.uid);
        console.log("[SessionRunner] ✅ User profile loading completed");
      } else {
        console.log(
          "[SessionRunner] ⚠️ No authenticated user found, skipping profile load"
        );
      }
    });

    // Clean up listener when component unmounts
    onUnmounted(() => {
      unsubscribe();
    });

    const savedSessionId = localStorage.getItem("binaSessionId");
    console.log("[SessionRunner] onMounted: savedSessionId =", savedSessionId);

    if (savedSessionId) {
      const res = await fetch(`${API_URL}/${savedSessionId}`);
      if (res.ok) {
        const data = await res.json();

        // Get current session name from the loaded flow data
        const currentSessionName = props.flowData?.name;

        // Get session name from database
        const dbSessionName = data.sessionName;

        console.log("[SessionRunner] Session name comparison:", {
          currentSessionName,
          dbSessionName,
          match: currentSessionName === dbSessionName,
        });

        // Check if session names match
        if (currentSessionName !== dbSessionName) {
          console.log(
            "[SessionRunner] Session name mismatch - treating as new session"
          );
          // Clear localStorage and start fresh
          localStorage.removeItem("binaSessionId");
          sessionId.value = null;
          userName.value = "";
          sessionHistory.value = [];
          currentStepIndex.value = 0;
          isAwaitingAi.value = false;
          return;
        }

        // Session names match - restore the session
        console.log("[SessionRunner] Session names match - restoring session");

        // Safely set session data
        sessionId.value = data.sessionId || null;
        userName.value = data.userName || "";
        sessionHistory.value = Array.isArray(data.history) ? data.history : [];

        if (data.steps?.length > 0) {
          const lastStep = data.steps[data.steps.length - 1];
          const idx = props.flowData?.steps?.findIndex(
            (step) => step?.name === lastStep?.step_id
          );

          if (idx !== -1) {
            currentStepIndex.value = idx;

            // Safely set isAwaitingAi
            const currentStep = props.flowData.steps[idx];
            const lastMsg =
              sessionHistory.value[sessionHistory.value.length - 1];
            isAwaitingAi.value =
              currentStep?.callAPI === true && lastMsg?.role === "user";

            // Safely emit session restored
            emit("session-restored", {
              history: sessionHistory.value,
              lastStepId: lastStep?.step_id || null,
              nextStep: props.flowData.steps[idx]?.callAPI
                ? props.flowData.steps[idx]
                : null,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("[SessionRunner] Failed to restore session:", error);
    // Reset to a safe state
    sessionId.value = null;
    userName.value = "";
    sessionHistory.value = [];
    currentStepIndex.value = 0;
    isAwaitingAi.value = false;
  }
});

// Initialize chat with first message
onMounted(() => {
  const savedSessionId = localStorage.getItem("binaSessionId");
  if (savedSessionId) return; // Only run if no session to restore

  // Check if it's the first step and has introText
  const firstStep = props.flowData.steps[0];
  if (firstStep && firstStep.introText) {
    const initialMessage = [
      firstStep.introText.replace(/\\n/g, "\n"),
      firstStep.question,
      firstStep.options
        ?.map(
          (opt, i) =>
            `<div class="option-indent">${i + 1}. ${opt.replace(
              /\n/g,
              "<br>"
            )}</div>`
        )
        .join(""),
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

    // Add debugging to see what flowData contains
    console.log("[SessionRunner] Debug flowData:", {
      flowData: props.flowData,
      flowDataName: props.flowData?.name,
      flowDataKeys: props.flowData
        ? Object.keys(props.flowData)
        : "no flowData",
    });

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
      sessionName: props.flowData?.name || null,
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

    // Get current user using the same approach
    const getCurrentUser = () => {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });
    };

    const currentUser = await getCurrentUser();
    if (currentUser) {
      params.uid = currentUser.uid;
    }

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
  console.log("[SessionRunner] handleStepResult called with:", {
    result,
    currentStepIndex: currentStepIndex.value,
    currentStep: props.flowData.steps[currentStepIndex.value],
  });

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

  // Handle any actions specified in the step
  const currentStepData = props.flowData.steps[currentStepIndex.value];
  console.log("[SessionRunner] Current step data:", {
    name: currentStepData?.name,
    actions: currentStepData?.actions,
    callAPI: currentStepData?.callAPI,
  });

  if (currentStepData?.actions && Array.isArray(currentStepData.actions)) {
    console.log(
      "[SessionRunner] Found actions to execute:",
      currentStepData.actions
    );

    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("[SessionRunner] No user found");
      return;
    }

    const userEmail = currentUser.email;
    console.log("[SessionRunner] Current user email:", userEmail);

    for (const action of currentStepData.actions) {
      try {
        console.log("[SessionRunner] Executing action:", action.name);
        await handleAction(action.name, {
          sessionId: sessionId.value,
          flowData: props.flowData,
          conversationHistory: sessionHistory.value,
          currentStep: currentStepData,
          userEmail: userEmail,
          instruction: action.instruction,
          system: action.system,
        });
        console.log(
          `[SessionRunner] Action ${action.name} executed successfully`
        );
      } catch (error) {
        console.error(
          `[SessionRunner] Failed to execute action ${action.name}:`,
          error
        );
      }
    }
  } else {
    console.log("[SessionRunner] No actions found in current step");
  }

  // Prepare to send response to ChatView
  let responseMessage = result.reply;

  // Handle status (passed, retry, continue, finish)
  if (result.status === "finish") {
    // Check if the next step is the closing step
    if (currentStepIndex.value < props.flowData.steps.length - 1) {
      currentStepIndex.value++; // Move this AFTER saving to DB
      const nextStep = props.flowData.steps[currentStepIndex.value];

      // --- Handle non-AI closing step ---
      if (nextStep.name === "closing" && nextStep.callAPI === false) {
        // Create the closing message text
        const closingText = [
          nextStep.introText?.replace(/\\n/g, "\n"),
          nextStep.question,
          nextStep.options
            ?.map(
              (opt, i) =>
                `<div class="option-indent">${i + 1}. ${opt.replace(
                  /\n/g,
                  "<br>"
                )}</div>`
            )
            .join(""),
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

      // --- Handle AI closing step ---
      if (nextStep.name === "closing" && nextStep.callAPI === true) {
        // After the AI step result for closing, mark session as complete and save
        isSessionComplete.value = true;
        await saveStepToDatabase("", "", false);
      }
    }
  }

  // Also, after the very last step (if not already handled), ensure session is marked complete
  if (
    currentStepIndex.value === props.flowData.steps.length - 1 &&
    props.flowData.steps[currentStepIndex.value].name === "closing"
  ) {
    isSessionComplete.value = true;
    await saveStepToDatabase("", result.reply, false);
    analyzeSessionAfterCompletion(); // <-- Add this line
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

  lastUserInput.value = userInput.value;

  emit("update:userInput", "");
  userInput.value = "";

  // Get the previous system message (the one just shown to the user)
  const previousSystemMessage =
    sessionHistory.value.filter((msg) => msg.role === "assistant").pop()
      ?.content || "";

  // Add user message to history
  sessionHistory.value.push({
    role: "user",
    content: lastUserInput.value,
  });

  // Check if this is the first user message (start trial event)
  const userMessages = sessionHistory.value.filter(
    (msg) => msg.role === "user"
  );
  const isFirstUserMessage = userMessages.length === 1;

  // Debug log to verify the logic
  console.log(
    "[Debug] User messages count:",
    userMessages.length,
    "Is first message:",
    isFirstUserMessage
  );

  // Fire StartTrial event only in production when user first writes a message
  if (isFirstUserMessage) {
    const hostname = window.location.hostname;
    const isProduction =
      hostname === "binaapp.com" || hostname === "www.binaapp.com";

    console.log("[Debug] Hostname:", hostname, "Is production:", isProduction);

    if (window.fbq && isProduction) {
      console.log("[FB Pixel] Firing StartTrial event in production");
      fbq("track", "StartTrial", {
        content_name: "Session Started",
        status: "success",
      });
    } else if (isFirstUserMessage) {
      console.log(
        "[FB Pixel] Skipping StartTrial event - not in production environment"
      );
    }
  }

  // Notify ChatView of message sent
  emit("message-sent", {
    message: lastUserInput.value,
    type: "user",
  });

  // Always save both system and user message together for this step
  await saveStepToDatabase(lastUserInput.value, previousSystemMessage, true);

  const currentStep = props.flowData.steps[currentStepIndex.value];
  if (currentStep.collectsName) {
    userName.value = lastUserInput.value.trim();
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
          ?.map(
            (opt, i) =>
              `<div class="option-indent">${i + 1}. ${opt.replace(
                /\n/g,
                "<br>"
              )}</div>`
          )
          .join(""),
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

// Add this function in your <script setup> or methods
async function analyzeSessionAfterCompletion() {
  try {
    // Use a promise-based approach to get the current user
    const getCurrentUser = () => {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe(); // Unsubscribe after first call
          resolve(user);
        });
      });
    };

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.log("[SessionRunner] No authenticated user for session analysis");
      return;
    }

    const uid = currentUser.uid;
    const sessionIdVal = sessionId.value; // sessionId is a ref in your component
    const transcript = sessionHistory.value; // full conversation log

    console.log("[SessionRunner] coachData.name:", props.coachData?.name);
    // === FIX: Add userEmail and userName ===
    const requestBody = {
      sessionId: sessionIdVal,
      uid,
      transcript,
      userProfile: userProfile.value,
      userEmail: currentUser.email,
      userName: currentUser.displayName || userName.value || "",
      coachName: props.flowData?.coachName || "מאיה",
    };

    console.log(
      "[SessionRunner] Sending analysis request with user profile:",
      requestBody
    );

    await fetch(`${getApiBase()}/api/analyze-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    // Optionally, reload the user profile after analysis to get updated data
    await loadUserProfile(uid);
  } catch (err) {
    console.error("Failed to analyze session:", err);
  }
}
</script>

<template>
  <AiStep
    v-if="
      isAwaitingAi && props.flowData.steps[currentStepIndex].callAPI !== false
    "
    :history="sessionHistory"
    :answer="lastUserInput"
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
    :userProfile="userProfile"
    @step-result="handleStepResult"
  />

  <!-- Add this debug element to see the user profile in the DOM -->
  <div v-if="userProfile" style="display: none">
    Debug - User Profile: {{ JSON.stringify(userProfile) }}
  </div>
</template>
