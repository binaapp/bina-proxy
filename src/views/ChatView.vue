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
            Sign Up Here
          </PrimaryButton>
        </div>
      </transition>
    </section>

    <div class="chat-box">
      <textarea
        v-model="userInput"
        placeholder="Message Bina"
        @keyup.enter="sendMessage"
        @input="autoResize"
        ref="chatInput"
        rows="1"
        style="overflow: hidden; resize: none"
      ></textarea>
      <button @click="sendMessage">&#8593;</button>
    </div>

    <!-- SessionRunner handles the logic -->
    <SessionRunner
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

<script>
import { ref, nextTick } from "vue"; // Add nextTick import
import { getFlowData, DEFAULT_FLOW } from "@/composables/useFlowData";
import coachData from "@/data/coaches/supportive-coach.json";
import SessionRunner from "@/components/SessionRunner.vue";
import TypingMessage from "@/components/TypingMessage.vue";
import TypingIndicator from "@/components/TypingIndicator.vue";
import { useInteractionLimiter } from "../composables/useInteractionLimiter.js";
import { submitSession } from "@/utils/sessionApi";
import PrimaryButton from "@/components/UI/PrimaryButton.vue";
import { useRoute } from "vue-router";

export default {
  name: "ChatView",
  components: {
    SessionRunner,
    TypingMessage,
    TypingIndicator,
    PrimaryButton,
  },
  setup() {
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
    const route = useRoute();

    // Get source from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const source =
      urlParams.get("source") || urlParams.get("utm_source") || "direct";

    // Get flow name from query string
    const flowName = urlParams.get("flow") || DEFAULT_FLOW;
    const flowData = getFlowData(flowName);

    // Handle restored session
    function handleSessionRestored(sessionData) {
      console.log("Session restored with lastStepId:", sessionData.lastStepId);
      console.log("Button state before restore:", {
        showSessionButton: showSessionButton.value,
        sessionButtonType: sessionButtonType.value,
        pendingSessionButtonType: pendingSessionButtonType.value,
      });

      // 1. Restore the full message history from the backend
      if (sessionData.history && Array.isArray(sessionData.history)) {
        chatMessages.value = sessionData.history.map((msg) => {
          if (typeof msg === "object" && msg.role && msg.content) return msg;
          return { role: "assistant", content: msg };
        });
      } else {
        chatMessages.value = [];
      }

      // Debug: Confirm restoration
      console.log(
        "[ChatView] After restoration, messages:",
        chatMessages.value
      );

      messageTypes.value = chatMessages.value.map((msg) =>
        msg.role === "assistant" ? "bot" : "user"
      );
      restoredIndexes.value = new Set(chatMessages.value.map((_, idx) => idx));

      // Always clear button state first
      showSessionButton.value = false;
      sessionButtonType.value = "";
      pendingSessionButtonType.value = "";

      // Only set button state if we have a valid step with showButton
      // AND we're not coming back from registration
      if (sessionData.lastStepId && !route.query.justRegistered) {
        const step = flowData.steps.find(
          (s) => s.name === sessionData.lastStepId
        );
        console.log("Found step for lastStepId:", step);
        if (step && step.showButton) {
          showSessionButton.value = true;
          sessionButtonType.value = step.showButton.toLowerCase();
        }
      }

      // After restoration, check for nextStep
      if (sessionData.nextStep) {
        // Now it's safe to trigger the AI response, because chatMessages is fully restored
        this.handleAiResponse({
          message: "",
          type: "bot",
          showButton: sessionData.nextStep.showButton || null,
          currentStep: sessionData.nextStep,
        });
      }

      console.log("Button state after restore:", {
        showSessionButton: showSessionButton.value,
        sessionButtonType: sessionButtonType.value,
        pendingSessionButtonType: pendingSessionButtonType.value,
      });

      nextTick(() => {
        if (chatContentRef.value) {
          chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
        }
      });
    }

    return {
      sessionRunner,
      userInput,
      chatMessages,
      messageTypes,
      flowData,
      coachData,
      incrementInteraction,
      isLimitReached,
      showLinkButton,
      currentLink,
      chatContentRef, // Add the ref to template
      restoredIndexes,
      handleSessionRestored,
      source, // Add this
      showSessionButton,
      sessionButtonType,
      pendingSessionButtonType,
      route,
    };
  },
  methods: {
    // Scroll chat to bottom
    scrollToBottom() {
      nextTick(() => {
        if (this.chatContentRef) {
          const element = this.chatContentRef;
          element.scrollTop = element.scrollHeight;
        }
      });
    },

    hideTypingIndicator() {
      if (this.sessionRunner) {
        this.sessionRunner.isAwaitingAi = false;
      }
    },

    handleTypingComplete(data) {
      console.log("Typing complete, data:", data);
      console.log("Button state before typing complete:", {
        showSessionButton: this.showSessionButton,
        sessionButtonType: this.sessionButtonType,
        pendingSessionButtonType: this.pendingSessionButtonType,
      });

      // Handle link button
      if (data && data.hasLink) {
        this.currentLink = data.link;
        this.showLinkButton = true;
        console.log("Link detected, showing button:", this.currentLink);
      } else {
        this.showLinkButton = false;
        this.currentLink = "";
      }

      // Handle session button - always clear first
      this.showSessionButton = false;
      this.sessionButtonType = "";

      // Only set new button state if we have a pending type
      if (this.pendingSessionButtonType) {
        this.showSessionButton = true;
        this.sessionButtonType = this.pendingSessionButtonType;
        this.pendingSessionButtonType = "";
      }

      console.log("Button state after typing complete:", {
        showSessionButton: this.showSessionButton,
        sessionButtonType: this.sessionButtonType,
        pendingSessionButtonType: this.pendingSessionButtonType,
      });

      this.scrollToBottom();
    },

    sendMessage() {
      if (!this.userInput.trim()) return;

      // Check interaction limit
      if (this.isLimitReached) {
        console.log("Daily interaction limit reached");

        // Add a simplified message without mentioning the specific number
        this.chatMessages.push(
          "You've reached your daily interaction limit with Bina. " +
            "Please come back tomorrow to continue your coaching journey. " +
            "This limit helps us provide quality coaching to all users."
        );
        this.messageTypes.push("bot");

        // Scroll to show the limit message
        this.scrollToBottom();
        return;
      }

      // Attempt to increment the interaction counter
      if (!this.incrementInteraction()) {
        console.log(
          "Daily interaction limit reached while attempting to increment"
        );

        // Add a simplified message without mentioning the specific number
        this.chatMessages.push(
          "You've reached your daily interaction limit with Bina. " +
            "Please come back tomorrow to continue your coaching journey. " +
            "This limit helps us provide quality coaching to all users."
        );
        this.messageTypes.push("bot");

        // Scroll to show the limit message
        this.scrollToBottom();
        return;
      }

      // Hide link button when user sends a message
      this.showLinkButton = false;

      // Let SessionRunner handle the message
      this.sessionRunner?.handleUserSubmit();

      // Reset textarea height after sending
      this.$nextTick(() => {
        const textarea = this.$refs.chatInput;
        if (textarea) {
          textarea.style.height = "auto";
        }
      });

      // Scroll to bottom immediately after sending
      this.scrollToBottom();
    },

    handleMessageSent({ message, type }) {
      console.log("Message sent:", type, message);
      this.chatMessages.push(message);
      this.messageTypes.push(type);
      this.restoredIndexes.value = new Set(); // Clear restored indexes for new messages

      // Scroll to bottom when user message is added
      this.scrollToBottom();
    },

    async handleAiResponse({
      message,
      type,
      showButton,
      currentStep: stepFromEvent,
    }) {
      console.log("[ChatView] handleAiResponse called with:", {
        message,
        type,
        showButton,
        currentStep: stepFromEvent,
      });

      // Clear any pending button state
      this.showSessionButton = false;
      this.sessionButtonType = "";
      this.pendingSessionButtonType = "";

      // Add the message to the chat if it's not empty
      if (message) {
        this.chatMessages.push(message);
        this.messageTypes.push(type);
      }

      // If this is a bot message and we have a current step, check if we need to make an API call
      if (type === "bot" && stepFromEvent) {
        console.log("[ChatView] Current step:", stepFromEvent);

        if (stepFromEvent.callAPI) {
          console.log(
            "[ChatView] Making API call for step:",
            stepFromEvent.name
          );

          // Instead of making the API call here, emit an event to SessionRunner
          // which will handle it through AiStep
          this.sessionRunner?.handleUserSubmit();
        }
      }

      // Update button state if provided
      if (showButton) {
        console.log("[ChatView] Pending button state:", showButton);
        this.pendingSessionButtonType = showButton;
      }

      this.scrollToBottom();
    },

    handleSessionComplete(sessionData) {
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
      this.scrollToBottom();
    },

    autoResize() {
      this.$nextTick(() => {
        const textarea = this.$refs.chatInput;
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = textarea.scrollHeight + "px";
        }
      });
    },

    goToRegistration() {
      this.$router.push("/signup"); // Or use window.location.href = "/register";
    },
  },
  mounted() {
    // Initial scroll to bottom when component mounts
    this.scrollToBottom();
  },
  updated() {
    // Scroll to bottom on any update to the component
    this.scrollToBottom();
  },
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
