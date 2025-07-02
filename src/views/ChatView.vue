<template>
  <div class="chat-wrapper">
    <AppHeader />

    <section class="chat-content" ref="chatContentRef">
      <transition-group name="fade" tag="div">
        <div
          v-for="(message, index) in chatMessages"
          :key="index"
          :class="['message', messageTypes[index]]"
        >
          <!-- User messages: always use the same markup -->
          <div
            v-if="messageTypes[index] === 'user'"
            class="user-message-container"
          >
            <div class="user-message-lines">
              <div class="user-message-bubble">
                {{ message }}
              </div>
            </div>
            <img src="/user.png" alt="User" class="user-avatar" />
          </div>
          <!-- Bot messages: show Maia's avatar and message bubble(s) -->
          <div v-else class="bot-message-container">
            <img src="/maia.jpg" alt="Maia" class="maia-avatar" />
            <div class="bot-message-lines">
              <div class="bot-message">
                {{ getVisibleBotMessage(message, index) }}
              </div>
            </div>
          </div>
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
    </section>

    <div class="chat-box">
      <textarea
        v-model="userInput"
        placeholder="Type anything, I'm listening"
        @keyup.enter="sendMessage"
        @input="autoResize"
        class="chat-input"
        ref="chatInput"
        :disabled="isLimitReached"
        rows="1"
        style="resize: none; overflow: hidden"
      ></textarea>
      <button class="send-btn" @click="sendMessage" :disabled="isLimitReached">
        SEND
      </button>
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

<script>
import { ref, nextTick, onMounted, watch } from "vue";
import { loadFlowBySessionName } from "@/composables/useFlowData"; // <-- change import
import coachData from "@/data/coaches/supportive-coach.json";
import SessionRunner from "@/components/SessionRunner.vue";
// import TypingMessage from "@/components/TypingMessage.vue"; // <-- commented out
import TypingIndicator from "@/components/TypingIndicator.vue";
import { useInteractionLimiter } from "../composables/useInteractionLimiter.js";
import { submitSession } from "@/utils/sessionApi";
import AppHeader from "@/components/AppHeader.vue";
import { useRoute } from "vue-router"; // <-- add this

export default {
  name: "ChatView",
  components: {
    AppHeader,
    SessionRunner,
    // TypingMessage, // <-- commented out
    TypingIndicator,
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
    const visibleBotLines = ref([]); // Track visible lines for each bot message

    // Get source from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const source =
      urlParams.get("source") || urlParams.get("utm_source") || "direct";

    // Get sessionName from route param
    const route = useRoute();
    const flowData = ref(null);

    onMounted(async () => {
      console.log("route.params:", route.params); // Log the route params
      const sessionName = route.params.program || "GeneralShort";
      console.log("Resolved sessionName:", sessionName); // Log the resolved session name
      try {
        flowData.value = await loadFlowBySessionName(sessionName);
        console.log(
          "Loaded flowData for session:",
          sessionName,
          flowData.value
        ); // Log loaded data
      } catch (e) {
        console.error("Failed to load flow for session:", sessionName, e);
        // fallback to QCoachMaia if not found
        try {
          const { default: fallbackFlow } = await import(
            "@/data/flows/GeneralShort.json"
          );
          flowData.value = fallbackFlow;
          console.log("Loaded fallback flow QCoachMaia.json");
        } catch (fallbackError) {
          console.error(
            "Failed to load fallback QCoachMaia.json",
            fallbackError
          );
        }
      }
    });

    // Handle restored session
    function handleSessionRestored({ history }) {
      chatMessages.value = history.map((msg) => msg.content);
      messageTypes.value = history.map((msg) =>
        msg.role === "assistant" ? "bot" : "user"
      );
      // Mark all current messages as restored
      restoredIndexes.value = new Set(chatMessages.value.map((_, idx) => idx));
      nextTick(() => {
        if (chatContentRef.value) {
          chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
        }
      });
    }

    // Watch for new bot messages and animate their lines
    watch(
      [chatMessages, messageTypes],
      async ([newMessages, newTypes], [oldMessages]) => {
        // Find the index of the newly added bot message
        if (
          newMessages.length > oldMessages.length &&
          newTypes[newTypes.length - 1] === "bot"
        ) {
          const idx = newMessages.length - 1;
          const lines = getBotMessageLines(newMessages[idx]);
          visibleBotLines.value[idx] = 0; // Start with 0 visible lines

          for (let i = 1; i <= lines.length; i++) {
            visibleBotLines.value[idx] = i;
            await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay between lines
          }
        }
      },
      { deep: true }
    );

    function getBotMessageLines(message) {
      return message.split("\n");
    }

    function getVisibleBotMessageLines(message, idx) {
      const allLines = getBotMessageLines(message);
      const visibleCount = visibleBotLines.value[idx] ?? allLines.length;
      return allLines.slice(0, visibleCount);
    }

    function getVisibleBotMessage(message, idx) {
      const allLines = getBotMessageLines(message);
      const visibleCount = visibleBotLines.value[idx] ?? allLines.length;
      return allLines.slice(0, visibleCount).join("\n");
    }

    async function handleAiResponse({ message, type }) {
      chatMessages.value.push(message);
      messageTypes.value.push(type);
      restoredIndexes.value = new Set();

      showLinkButton.value = false;

      if (type === "bot") {
        const idx = chatMessages.value.length - 1;
        const lines = getBotMessageLines(message);
        visibleBotLines.value[idx] = 0;
        for (let i = 1; i <= lines.length; i++) {
          visibleBotLines.value[idx] = i;
          await new Promise((resolve) => setTimeout(resolve, 500));
          // scrollToBottom(); // If you want to scroll, make sure it's defined in setup
        }
      }
      // scrollToBottom();
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
      visibleBotLines,
      getVisibleBotMessageLines,
      getVisibleBotMessage,
      handleAiResponse,
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
      // Only show the button after typing is complete and if there's a link
      if (data && data.hasLink) {
        this.currentLink = data.link;
        this.showLinkButton = true;
        console.log("Link detected, showing button:", this.currentLink);
      } else {
        this.showLinkButton = false;
        this.currentLink = "";
      }

      // Scroll to bottom when typing completes
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

    async addMessagesWithDelay(messages, type, delay = 600) {
      for (let i = 0; i < messages.length; i++) {
        this.chatMessages.push(messages[i]);
        this.messageTypes.push(type);
        this.restoredIndexes.value = new Set();
        this.scrollToBottom();
        if (i < messages.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
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
@import "@/utils/variables.css"; /* Import your color variables */

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
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  max-width: 700px; /* Match your message bubble's max-width */
  /*margin: 1rem auto 0 auto;*/
  justify-content: flex-end; /* Aligns items to the right */
  padding-right: 0; /* Remove if you had any */
  margin-left: auto; /* This ensures right alignment */
  margin-right: auto;
  background: transparent;
  border: none;
  box-shadow: none;
}

.chat-input {
  flex: 1;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 1.2rem;
  background: #f7f7f7;
  color: var(--chat-bot-text, #12344d);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  box-shadow: none;
  min-height: 40px;
  max-height: 120px; /* or whatever you prefer */
  resize: none;
  box-sizing: border-box;
  line-height: 1.4;
}

.chat-input:disabled {
  background: #eee;
  color: #aaa;
}

.chat-input::placeholder {
  color: #7a868f;
  opacity: 1;
  font-size: 1rem;
}

.send-btn {
  background: var(--primary-color, #c8b28e);
  color: var(--chat-bot-text, #12344d);
  border: none;
  border-radius: 1.2rem;
  padding: 0 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 0.6rem;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.send-btn:disabled {
  background: #ddd;
  color: #aaa;
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  background: #b89e7a;
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
    max-width: 95%;
  }

  .chat-box {
    width: calc(100% - 1.5rem);
    padding: 0.75rem;
  }
}

@media (max-width: 600px) {
  .chat-input {
    font-size: 0.9rem;
    padding-top: 0.6rem;
    padding-bottom: 0.6rem;
    line-height: 1.4;
    height: auto;
    min-height: 32px;
  }
  .send-btn {
    font-size: 0.9rem;
    padding: 0 1rem;
  }
  .maia-avatar {
    margin-right: 0.5rem;
  }
  .bot-message-container {
    margin-left: 0;
    padding-left: 0;
  }
  .chat-content {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

.message {
  width: 100%;
  max-width: 700px;
  text-align: left;
}

.message.user {
  display: flex;
  justify-content: flex-end;
}

.user-message-container {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.user-message-lines {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-message-bubble {
  background: #fff;
  color: var(
    --chat-bot-text,
    #12344d
  ); /* Use same text color as bot for consistency */
  border-radius: 18px;
  padding: 0.5rem 1rem;
  max-width: 80%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  font-size: var(--font-size-md);
  text-align: left;
  white-space: pre-line;
  margin-right: 0.75rem;
  line-height: 1.2;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-color, #c8b28e);
  background: var(--background-color, #12344d);
}

.message.bot {
  color: #f0f0f0;
  line-height: 1.6;
  display: flex;
  justify-content: flex-start;
}

.bot-message-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.bot-message-lines {
  display: flex;
  flex-direction: column;
}

.bot-message-line + .bot-message-line {
  margin-top: 0.5rem;
}

.maia-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.75rem;
  border: 2px solid var(--primary-color, #c8b28e); /* fallback if variable missing */
  background: var(--background-color, #12344d);
}

.bot-message {
  background: var(--chat-bot-bg, #f6e7db); /* Use your variable or fallback */
  color: var(--chat-bot-text, #12344d); /* Use your variable or fallback */
  border-radius: 18px;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  font-size: var(--font-size-md);
  text-align: left;
  white-space: pre-line;
  line-height: 1.2;
}

.button-container {
  text-align: center;
  margin-top: 2rem;
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
