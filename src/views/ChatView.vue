<template>
  <div class="chat-wrapper">
    <header class="chat-header">
      <img src="/bina-logo.png" alt="Bina Logo" />
    </header>

    <section class="chat-content" ref="chatContentRef">
      <transition-group name="fade" tag="div">
        <div
          v-for="(message, index) in chatMessages"
          :key="index"
          :class="['message', messageTypes[index]]"
        >
          <!-- User messages: always use the same markup -->
          <div v-if="messageTypes[index] === 'user'" class="user-message">
            {{ typeof message === "object" ? message.content : message }}
          </div>
          <!-- Restored bot messages: plain text, no typing -->
          <span v-else-if="restoredIndexes && restoredIndexes.has(index)">
            {{ typeof message === "object" ? message.content : message }}
          </span>
          <!-- New bot messages: use TypingMessage -->
          <TypingMessage
            v-else
            :text="typeof message === 'object' ? message.content : message"
            @typing-complete="handleTypingComplete"
          />
        </div>
      </transition-group>

      <transition name="fade">
        <TypingIndicator v-if="sessionRunner?.isAwaitingAi" />
      </transition>

      <!-- Link button container -->
      <transition name="fade">
        <div class="button-container" v-if="showLinkButton && currentLink">
          <a :href="currentLink" target="_blank" class="google-form-button">
            Click here to leave your feedback
          </a>
        </div>
      </transition>

      <!-- Add the button here -->
      <transition name="fade">
        <div class="button-container" v-if="showSessionButton">
          <PrimaryButton
            v-if="sessionButtonType === 'registration'"
            @click="goToRegistration"
          >
            Click Here to Recieve My Analysis
          </PrimaryButton>
        </div>
      </transition>
    </section>

    <div class="chat-box">
      <textarea
        v-model="userInput"
        placeholder="Message Bina"
        @keydown.enter.prevent="sendMessage"
        @input="autoResize"
        ref="chatInput"
        rows="1"
        style="overflow: hidden; resize: none"
      ></textarea>
      <button @click="sendMessage">&#8593;</button>
    </div>

    <!-- SessionRunner handles the logic -->
    <SessionRunner
      v-if="flowData"
      ref="sessionRunner"
      :userInput="userInput"
      @update:userInput="(value) => (userInput = value)"
      :flow-data="flowData"
      :coach-data="coachData"
      :referral-source="source"
      @message-sent="handleMessageSent"
      @ai-response="handleAiResponse"
      @session-complete="handleSessionComplete"
      @debug-message="(msg) => console.log('SessionRunner:', msg)"
      @session-restored="handleSessionRestored"
    />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import {
  getFlowData,
  DEFAULT_FLOW,
  loadFirstSessionOfProgram,
} from "@/composables/useFlowData";
import coachData from "@/data/coaches/supportive-coach.json";
import SessionRunner from "@/components/SessionRunner.vue";
import TypingMessage from "@/components/TypingMessage.vue";
import TypingIndicator from "@/components/TypingIndicator.vue";
import { useInteractionLimiter } from "../composables/useInteractionLimiter.js";
import { submitSession } from "@/utils/sessionApi";
import PrimaryButton from "@/components/UI/PrimaryButton.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const flowData = ref(null);
const chatInput = ref(null);

onMounted(async () => {
  // Only set default if no program param
  if (route.params.program) {
    try {
      flowData.value = await loadFirstSessionOfProgram(route.params.program);
      console.log("Loaded program data:", flowData.value);
    } catch (error) {
      console.error("Error loading program session:", error);
      flowData.value = getFlowData(DEFAULT_FLOW);
    }
  } else {
    flowData.value = getFlowData(DEFAULT_FLOW);
  }

  console.log("Route params:", route.params);
  console.log("Program param:", route.params.program);
});

const { incrementInteraction, isLimitReached } = useInteractionLimiter();
const sessionRunner = ref(null);
const userInput = ref("");
const chatMessages = ref([]);
const messageTypes = ref([]);
const showLinkButton = ref(false);
const currentLink = ref("");
const chatContentRef = ref(null); // Reference to chat content container
const restoredIndexes = ref(new Set());
const showSessionButton = ref(false);
const sessionButtonType = ref(""); // e.g. "registration"
const pendingSessionButtonType = ref("");
const sessionRestored = ref(false);
const justRestored = ref(false);

// Get source from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const source =
  urlParams.get("source") || urlParams.get("utm_source") || "direct";

// Handle restored session
function handleSessionRestored(sessionData) {
  try {
    console.log("Session restored with lastStepId:", sessionData.lastStepId);

    // 1. Safely restore message history
    if (sessionData.history && Array.isArray(sessionData.history)) {
      chatMessages.value = sessionData.history.map((msg) => {
        try {
          if (typeof msg === "object" && msg.role && msg.content) {
            return msg;
          }
          return { role: "assistant", content: String(msg) };
        } catch (error) {
          console.error("[ChatView] Error processing message:", error);
          return { role: "assistant", content: "Error processing message" };
        }
      });
    } else {
      chatMessages.value = [];
    }

    // 2. Safely set message types
    messageTypes.value = chatMessages.value.map((msg) =>
      msg.role === "assistant" ? "bot" : "user"
    );

    // 3. Safely set restored indexes
    restoredIndexes.value = new Set(chatMessages.value.map((_, idx) => idx));

    // 4. Safely handle button state
    if (sessionData.lastStepId && !route.query.justRegistered) {
      const step = flowData.value?.steps?.find(
        (s) => s.name === sessionData.lastStepId
      );
      if (step?.showButton) {
        showSessionButton.value = true;
        sessionButtonType.value = String(step.showButton).toLowerCase();
      }
    }

    // 5. Safely handle API step
    if (sessionData.nextStep?.callAPI) {
      try {
        const aiStep = {
          history: sessionData.history || [],
          name: sessionData.nextStep.name,
          systemPrompt: sessionData.nextStep.instruction || "",
          flowData: flowData.value,
          sessionRunner: sessionRunner.value,
        };

        if (sessionRunner.value) {
          sessionRunner.value.$emit("ai-step-trigger", {
            step: sessionData.nextStep,
            aiStep: aiStep,
          });
        } else {
          console.error("[ChatView] sessionRunner is not available");
        }
      } catch (error) {
        console.error("[ChatView] Error setting up API step:", error);
      }
    }

    sessionRestored.value = true;
    justRestored.value = true;

    // 6. Safely scroll to bottom
    nextTick(() => {
      if (chatContentRef.value) {
        chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
      }
    });
  } catch (error) {
    console.error("[ChatView] Error in handleSessionRestored:", error);
    // Reset to a safe state
    chatMessages.value = [];
    messageTypes.value = [];
    restoredIndexes.value = new Set();
    showSessionButton.value = false;
    sessionButtonType.value = "";
    sessionRestored.value = false;
    justRestored.value = false;
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContentRef.value) {
      const element = chatContentRef.value;
      element.scrollTop = element.scrollHeight;
    }
  });
};

const handleTypingComplete = (data) => {
  console.log("Typing complete, data:", data);
  console.log("Button state before typing complete:", {
    showSessionButton: showSessionButton.value,
    sessionButtonType: sessionButtonType.value,
    pendingSessionButtonType: pendingSessionButtonType.value,
  });

  // Handle link button
  if (data && data.hasLink) {
    currentLink.value = data.link;
    showLinkButton.value = true;
    console.log("Link detected, showing button:", currentLink.value);
  } else {
    showLinkButton.value = false;
    currentLink.value = "";
  }

  // Handle session button - only show after typing is complete
  if (pendingSessionButtonType.value) {
    showSessionButton.value = true;
    sessionButtonType.value = pendingSessionButtonType.value;
    pendingSessionButtonType.value = "";
  }

  console.log("Button state after typing complete:", {
    showSessionButton: showSessionButton.value,
    sessionButtonType: sessionButtonType.value,
    pendingSessionButtonType: pendingSessionButtonType.value,
  });

  scrollToBottom();
};

const sendMessage = () => {
  if (!userInput.value.trim()) return;

  // Check interaction limit
  if (isLimitReached.value) {
    console.log("Daily interaction limit reached");

    // Add a simplified message without mentioning the specific number
    chatMessages.value.push(
      "You've reached your daily interaction limit with Bina. " +
        "Please come back tomorrow to continue your coaching journey. " +
        "This limit helps us provide quality coaching to all users."
    );
    messageTypes.value.push("bot");

    // Scroll to show the limit message
    scrollToBottom();
    return;
  }

  // Attempt to increment the interaction counter
  if (!incrementInteraction()) {
    console.log(
      "Daily interaction limit reached while attempting to increment"
    );

    // Add a simplified message without mentioning the specific number
    chatMessages.value.push(
      "You've reached your daily interaction limit with Bina. " +
        "Please come back tomorrow to continue your coaching journey. " +
        "This limit helps us provide quality coaching to all users."
    );
    messageTypes.value.push("bot");

    // Scroll to show the limit message
    scrollToBottom();
    return;
  }

  // Hide link button when user sends a message
  showLinkButton.value = false;

  // Let SessionRunner handle the message
  sessionRunner.value?.handleUserSubmit();

  // Reset textarea height after sending
  nextTick(() => {
    const textarea = chatInput.value;
    if (textarea) {
      textarea.style.height = "auto";
    }
  });

  // Scroll to bottom immediately after sending
  scrollToBottom();
};

const handleMessageSent = ({ message, type }) => {
  console.log("Message sent:", type, message);
  chatMessages.value.push(message);
  messageTypes.value.push(type);
  sessionRestored.value = false; // Reset after first user message

  // Scroll to bottom when user message is added
  scrollToBottom();
};

const handleAiResponse = async ({
  message,
  type,
  showButton,
  currentStep: stepFromEvent,
}) => {
  if (justRestored.value) {
    justRestored.value = false;
    return; // Ignore the first bot message after restore
  }

  console.log(
    "[handleAiResponse] message:",
    message,
    "type:",
    type,
    "chatMessages:",
    chatMessages.value
  );

  console.log("[ChatView] handleAiResponse called with:", {
    message,
    type,
    showButton,
    currentStep: stepFromEvent,
  });

  // Clear any pending button state
  showSessionButton.value = false;
  sessionButtonType.value = "";

  // Store the button state to be shown after typing completes
  if (showButton) {
    console.log("[ChatView] Pending button state:", showButton);
    pendingSessionButtonType.value = showButton;
  }

  // Add the message to the chat if it's not empty and not the same as the last message
  if (
    message &&
    (chatMessages.value.length === 0 ||
      chatMessages.value[chatMessages.value.length - 1] !== message)
  ) {
    chatMessages.value.push(message);
    messageTypes.value.push(type);
  }

  // If this is a bot message and we have a current step, check if we need to make an API call
  if (type === "bot" && stepFromEvent) {
    console.log("[ChatView] Current step:", stepFromEvent);

    if (stepFromEvent.callAPI) {
      console.log("[ChatView] Making API call for step:", stepFromEvent.name);

      // Instead of making the API call here, emit an event to SessionRunner
      // which will handle it through AiStep
      sessionRunner.value?.handleUserSubmit();
    }
  }

  scrollToBottom();
};

const handleSessionComplete = (sessionData) => {
  console.log("Session completed:", sessionData);

  // Submit the completed session to the database
  try {
    submitSession({
      startedAt: new Date(Date.now() - 600000).toISOString(), // Default to 10 minutes ago
      endedAt: new Date().toISOString(),
      completed: true,
      flowSteps: sessionData.history.map((msg, index) => ({
        stepId: `step-${index}`,
        startedAt: new Date(
          Date.now() - (600000 - index * 30000)
        ).toISOString(),
        endedAt: new Date(
          Date.now() - (600000 - (index + 1) * 30000)
        ).toISOString(),
        userText: msg.role === "user" ? msg.content : "",
        systemText: msg.role === "assistant" ? msg.content : "",
      })),
      feedback: null, // Feedback will be submitted separately through the form
    });
  } catch (error) {
    console.error("Failed to submit session:", error);
  }

  // Scroll to bottom at session completion
  scrollToBottom();
};

const autoResize = () => {
  nextTick(() => {
    const textarea = chatInput.value;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  });
};

const goToRegistration = () => {
  // Use router.push instead of window.location.href
  router.push("/signup");
};
</script>

<style scoped>
.user-message,
.message {
  white-space: pre-line;
}

.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 97dvh; /* Fixes mobile browser UI overlap issue */
  background-color: #12344d;
  position: relative;
  overflow: hidden;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  color: #f0f0f0;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: 1px solid rgba(255, 255, 255, 0.2); /* Subtle white debug */
}

.chat-header {
  padding: 1rem;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 72px;
  outline: 1px solid rgba(255, 255, 255, 0.2); /* Subtle white debug */
}

.chat-header img {
  height: 50px;
  width: auto;
  max-width: 250px;
  object-fit: contain;
}

.quote-card {
  background: rgba(18, 52, 77, 0.7);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  max-width: 700px;
  width: 100%;
  font-family: "Playfair Display", serif;
  font-size: 1.1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease;
  opacity: 1;
  transform: translateY(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.chat-box {
  padding: 0.75rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: calc(100% - 2rem);
  max-width: 700px;
  margin: 0 auto;
  outline: 1px solid rgba(255, 255, 255, 0.2); /* Subtle white debug */
}

.chat-box textarea {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
  font-size: 1rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  min-height: 32px;
  max-height: 200px;
  width: 100%;
  box-sizing: border-box;
}

.chat-box button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #ffffff; /* White background */
  color: #12344d; /* Blue arrow (same as background) */
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.chat-box button:hover {
  background: #f0f0f0; /* Slight hover effect */
  transform: translateY(-1px);
}

@media (min-width: 769px) {
  .chat-box {
    padding: 1rem calc((100% - 700px) / 2);
  }
}

@media (max-width: 768px) {
  .chat-wrapper {
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100dvh;
  }

  .chat-content {
    overflow-y: auto;
    min-height: 0;
    padding: 1rem;
  }

  .chat-header {
    height: 60px;
  }

  .message.bot {
    justify-content: flex-start;
  }

  .user-message,
  .message.bot {
    max-width: 85%;
    padding: 0.75rem 1rem;
  }

  .chat-box {
    width: calc(100% - 1.5rem);
    padding: 0.75rem;
  }
}

.message {
  width: 100%;
  max-width: 700px;
  margin-bottom: 1.5rem;
  text-align: left;
}

.message.user {
  display: flex;
  justify-content: flex-end;
}

.user-message {
  background: rgba(200, 178, 142, 0.1);
  border-radius: 18px;
  padding: 1rem 1.5rem;
  margin-left: auto;
  max-width: 80%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  text-align: left;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
}

.message.bot {
  color: #f0f0f0;
  line-height: 1.6;
  display: flex;
  justify-content: flex-start;
}

.bot-message-container {
  display: flex;
  position: relative;
  align-items: center;
}

.button-container {
  text-align: center;
  /*margin-top: 2rem;*/
}

.google-form-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: rgba(200, 178, 142, 0.2);
  color: #fff;
  border-radius: 24px;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(200, 178, 142, 0.3);
}

.google-form-button:hover {
  background-color: rgba(200, 178, 142, 0.3);
  transform: translateY(-2px);
}
</style>
