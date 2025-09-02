<template>
  <div class="chat-wrapper">
    <AppHeader />

    <section class="chat-content" ref="chatContentRef" :class="{ rtl: isRtl }">
      <transition-group name="fade" tag="div">
        <div
          v-for="(message, index) in chatMessages"
          :key="index"
          :class="['message', messageTypes[index]]"
        >
          <!-- Decorative line -->
          <div
            v-if="messageTypes[index] === 'decorative-line'"
            class="decorative-line-container"
          >
            <div class="decorative-line">
              <div class="starburst"></div>
            </div>
          </div>

          <!-- Regular messages -->
          <div
            v-else-if="messageTypes[index] === 'user'"
            class="user-message-container"
          >
            <div class="user-message-lines">
              <div class="user-message-bubble">
                {{ message }}
              </div>
            </div>
            <img src="/user.png" alt="User" class="user-avatar" />
          </div>

          <!-- Bot messages -->
          <div
            v-else-if="messageTypes[index] === 'bot'"
            class="bot-message-container"
          >
            <img src="/maia.jpg" alt="Maia" class="maia-avatar" />
            <div class="bot-message-lines">
              <div class="bot-message">
                <template
                  v-for="(line, lineIdx) in getVisibleBotMessageLines(
                    message,
                    index
                  )"
                  :key="lineIdx"
                >
                  <div
                    :class="{
                      'bot-message-line': true,
                      'indented-line': isBulletLine(line) && lineIdx > 0,
                    }"
                    v-html="line"
                  ></div>
                </template>
              </div>
              <!-- Add button if message has button data -->
              <div
                v-if="messageButtons[index]"
                class="message-button-container"
              >
                <a
                  :href="messageButtons[index].url"
                  target="_blank"
                  class="message-button"
                >
                  {{ messageButtons[index].text }}
                </a>
              </div>
              <!-- Show button only for the session end message -->
              <div
                v-if="
                  sessionEndConfig &&
                  message === sessionEndConfig.message &&
                  !messageButtons[index]
                "
                class="message-button-container"
              >
                <a
                  :href="sessionEndConfig.buttonUrl"
                  target="_blank"
                  class="message-button"
                >
                  {{ sessionEndConfig.buttonText }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- Session End UI -->
      <TypingIndicator
        v-if="sessionRunner?.isAwaitingAi"
        :isVisible="sessionRunner?.isAwaitingAi"
      />

      <!-- Link button container -->
      <transition name="fade">
        <div class="button-container" v-if="showLinkButton && currentLink">
          <a :href="currentLink" target="_blank" class="google-form-button">
            Click here to leave your feedback
          </a>
        </div>
      </transition>
    </section>

    <!-- Hide chat box when session is completed -->
    <div class="chat-box" v-if="showChatBox">
      <textarea
        v-model="userInput"
        placeholder="Type anything, I'm listening"
        @keydown="handleKeydown"
        @input="autoResize"
        @focus="scrollToBottom"
        class="chat-input"
        ref="chatInput"
        :disabled="isLimitReached"
        rows="1"
        style="resize: none; overflow: hidden"
        :dir="isRtl ? 'rtl' : 'ltr'"
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
      @session-completed="handleSessionCompleted"
      @hide-chat-ui="hideChatUI"
      @session-end-ready="handleSessionEndReady"
      @debug-message="(msg) => console.log('SessionRunner:', msg)"
      @session-restored="handleSessionRestored"
    />
  </div>
</template>

<script>
import { ref, nextTick, onMounted, watch, computed } from "vue";
import { loadFlowBySessionName } from "@/composables/useFlowData"; // <-- change import
import SessionRunner from "@/components/SessionRunner.vue";
// import TypingMessage from "@/components/TypingMessage.vue"; // <-- commented out
import TypingIndicator from "@/components/TypingIndicator.vue";
import { useInteractionLimiter } from "../composables/useInteractionLimiter.js";
import { submitSession } from "@/utils/sessionApi";
import AppHeader from "@/components/AppHeader.vue";
import { useRoute } from "vue-router"; // <-- add this
import { FEATURE_FLAGS } from "@/utils/config.js";

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
    const isSessionCompleted = ref(false); // Add this new property
    const showChatBox = ref(true); // Add this to control chat box visibility
    const pendingSessionEnd = ref(false); // Make sure this is defined as ref(false)

    // Add reactive array to store button data for each message
    const messageButtons = ref([]);

    // Get source from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const source =
      urlParams.get("source") || urlParams.get("utm_source") || "direct";

    // Get sessionName from route param
    const route = useRoute();
    const flowData = ref(null);
    const coachData = ref(null);

    onMounted(async () => {
      console.log("route.params:", route.params); // Log the route params
      const sessionName = route.params.program || "MaiaGenericH";
      console.log("Resolved sessionName:", sessionName); // Log the resolved session name
      try {
        flowData.value = await loadFlowBySessionName(sessionName);
        console.log(
          "Loaded flowData for session:",
          sessionName,
          flowData.value
        ); // Log loaded data

        // Extract coach data from the loaded flow
        if (flowData.value.coachProfile || flowData.value.coachSignature) {
          coachData.value = {
            name:
              flowData.value.coachProfile?.name ||
              flowData.value.coachSignature?.name ||
              flowData.value.name ||
              "מאיה", // Try to get the name from the merged data
            coachProfile: flowData.value.coachProfile,
            coachSignature: flowData.value.coachSignature,
            systemInstructions: flowData.value.systemInstructions,
          };
        }
      } catch (e) {
        console.error("Failed to load flow for session:", sessionName, e);
        // fallback to MaiaGenericH if not found
        try {
          const { default: fallbackFlow } = await import(
            "@/data/flows/MaiaGenericH.json"
          );
          flowData.value = fallbackFlow;
          console.log("Loaded fallback flow MaiaGenericH.json");
        } catch (fallbackError) {
          console.error(
            "Failed to load fallback MaiaGenericH.json",
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

      // Initialize messageButtons array for restored messages
      messageButtons.value = history.map(() => null); // No buttons for restored messages initially

      // Mark all current messages as restored
      restoredIndexes.value = new Set(chatMessages.value.map((_, idx) => idx));

      // If chat box is hidden (meaning session was completed), add session end message
      if (!showChatBox.value && FEATURE_FLAGS.ENABLE_SESSION_END_LOGIC) {
        const sessionEndConfig = flowData.value?.sessionEnd;
        // === FIX: Only add if not already present ===
        if (
          sessionEndConfig &&
          !chatMessages.value.includes(sessionEndConfig.message)
        ) {
          // Add decorative line
          chatMessages.value.push("DECORATIVE_LINE");
          messageTypes.value.push("decorative-line");
          messageButtons.value.push(null);

          // Add session end message
          chatMessages.value.push(sessionEndConfig.message);
          messageTypes.value.push("bot");

          // Add button data for the session end message
          if (sessionEndConfig.buttonText && sessionEndConfig.buttonUrl) {
            messageButtons.value.push({
              text: sessionEndConfig.buttonText,
              url: sessionEndConfig.buttonUrl,
            });
          } else {
            messageButtons.value.push(null);
          }
        }
      }

      // After restoring chatMessages and messageTypes
      const sessionEndConfig = flowData.value?.sessionEnd;
      if (sessionEndConfig) {
        chatMessages.value.forEach((msg, idx) => {
          if (msg === sessionEndConfig.message) {
            messageButtons.value[idx] = {
              text: sessionEndConfig.buttonText,
              url: sessionEndConfig.buttonUrl,
            };
          }
        });
      }

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

    async function handleAiResponse({ message, type, onDisplayed }) {
      showLinkButton.value = false;

      chatMessages.value.push(message);
      messageTypes.value.push(type);
      restoredIndexes.value = new Set();

      if (type === "bot") {
        const idx = chatMessages.value.length - 1;
        const lines = getBotMessageLines(message);
        visibleBotLines.value[idx] = 0;
        for (let i = 1; i <= lines.length; i++) {
          visibleBotLines.value[idx] = i;
          await new Promise((resolve) => setTimeout(resolve, 500)); // normal line animation
        }
      }

      // Call onDisplayed callback AFTER the line animation is complete
      if (onDisplayed) {
        onDisplayed();
      }

      // Add button data if provided
      if (message.buttonText && message.buttonUrl) {
        messageButtons.value.push({
          text: message.buttonText,
          url: message.buttonUrl,
        });
      } else {
        messageButtons.value.push(null);
      }

      // After AI response is complete, check if we need to show session end
      if (pendingSessionEnd.value) {
        pendingSessionEnd.value = false; // Reset the flag

        // === Add delay before showing session end UI ===
        await new Promise((resolve) => setTimeout(resolve, 3000)); // 2 seconds

        showSessionEndUI();
      }
    }

    function isBulletLine(line) {
      // Matches lines starting with a, b, c, ... or a. b. c. etc.
      return /^[a-z]\./i.test(line.trim());
    }

    const isRtl = computed(() => flowData.value?.rtl === true);
    const sessionEndConfig = computed(() => flowData.value?.sessionEnd);

    // Add sendMessage function here, inside setup()
    function sendMessage() {
      if (!userInput.value.trim()) return;

      // Check interaction limit
      if (isLimitReached.value) {
        console.log("Daily interaction limit reached");
        return;
      }

      // Attempt to increment the interaction counter
      if (!incrementInteraction()) {
        console.log(
          "Daily interaction limit reached while attempting to increment"
        );
        return;
      }

      // Let SessionRunner handle the message
      sessionRunner.value?.handleUserSubmit();

      // Reset textarea height after sending
      nextTick(() => {
        const textarea = document.querySelector(".chat-input");
        if (textarea) {
          textarea.style.height = "auto";
        }
      });
    }

    // Add handleKeydown function here, inside setup()
    function handleKeydown(event) {
      // If Shift+Enter is pressed, insert a new line
      if (event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        const textarea = event.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        // Insert newline at cursor position
        userInput.value =
          value.substring(0, start) + "\n" + value.substring(end);

        // Set cursor position after the newline
        nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        });
      }
      // If Enter is pressed without Shift, send the message
      else if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }

    function handleSessionEndReady() {
      console.log("Session end ready, will show after AI response");

      // Just check the variable directly
      if (FEATURE_FLAGS.ENABLE_SESSION_END_LOGIC) {
        pendingSessionEnd.value = true; // Now this should work
      }
    }

    function showSessionEndUI() {
      const sessionEndConfig = flowData.value?.sessionEnd;
      if (sessionEndConfig) {
        // === BEGIN FIX: Prevent duplicate session end message/button ===
        // Check if the session end message already exists in chatMessages
        const alreadyExists = chatMessages.value.includes(
          sessionEndConfig.message
        );
        if (alreadyExists) {
          return; // Do not add again
        }
        // === END FIX ===

        // Add decorative line
        chatMessages.value.push("DECORATIVE_LINE");
        messageTypes.value.push("decorative-line");
        messageButtons.value.push(null);

        // Add session end message
        chatMessages.value.push(sessionEndConfig.message);
        messageTypes.value.push("bot");

        // Add button data for this message
        messageButtons.value.push({
          text: sessionEndConfig.buttonText,
          url: sessionEndConfig.buttonUrl,
        });

        // Hide the chat box only if feature flag is enabled
        if (FEATURE_FLAGS.ENABLE_SESSION_END_LOGIC) {
          showChatBox.value = false;
        }
      }
    }

    function handleSessionCompleted() {
      console.log("=== handleSessionCompleted called ===");
      console.log("Current flowData:", flowData.value);
      console.log("Current sessionEnd config:", flowData.value?.sessionEnd);

      isSessionCompleted.value = true;

      // Only hide chat box if feature flag is enabled
      if (FEATURE_FLAGS.ENABLE_SESSION_END_LOGIC) {
        showChatBox.value = false;
      }

      // Check if there's a sessionEnd configuration in the flow
      const sessionEndConfig = flowData.value?.sessionEnd;

      if (sessionEndConfig && FEATURE_FLAGS.ENABLE_SESSION_END_LOGIC) {
        console.log("Session end config found, calling showSessionEndUI");
        showSessionEndUI();
      } else {
        console.log(
          "No session end config found in flow or feature flag disabled"
        );
      }
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
      handleSessionEndReady, // Add this
      isBulletLine,
      isRtl,
      isSessionCompleted, // Add this to template
      showChatBox, // Add this to template
      pendingSessionEnd, // Add this to template
      messageButtons, // Add this to template
      handleSessionCompleted,
      sessionEndConfig, // Add this to template
      handleKeydown, // Add this line
      sendMessage, // Add this line
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

      // Hide chat interface
      this.isSessionCompleted = true;

      // Submit the completed session to the database
      try {
        submitSession({
          startedAt: new Date(Date.now() - 600000).toISOString(),
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
          feedback: null,
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

    handleSessionEndMessage(data) {
      console.log("Session end message received:", data);
      // this.sessionEndData = data; // This line is removed

      // Scroll to show the session end UI
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    hideChatUI() {
      console.log("Hiding chat UI");
      this.showChatBox = false;
      // Don't clear sessionEndData here - let it show the session end UI
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
  height: 100vh; /* Change from 97dvh to 100vh for better mobile compatibility */
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
  overflow-x: hidden; /* Prevent horizontal scroll */
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: 1px solid rgba(255, 255, 255, 0.2);
  /* Remove any potential width issues */
  width: 100%;
  box-sizing: border-box;
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
  /* Remove position: sticky - this was causing the issue */
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
    display: flex; /* Change from grid to flex */
    flex-direction: column; /* Add this */
    height: 100dvh;
  }

  .chat-content {
    overflow-y: auto;
    min-height: 0;
    flex: 1; /* Add this to make content area flexible */
  }

  .chat-header {
    height: 60px;
  }

  .message.bot {
    justify-content: flex-start;
  }

  .chat-box {
    width: calc(100% - 1.5rem);
    padding: 0.75rem;
    box-sizing: border-box;
  }
}

@media (max-width: 600px) {
  .chat-wrapper {
    /* Better mobile viewport handling */
    height: 100dvh;
    /*grid-template-rows: auto 1fr auto;*/

    min-height: 0; /* -webkit-fill-available;*/
  }

  .chat-content {
    /* Ensure content doesn't overflow */
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    width: 100%;
    box-sizing: border-box;
  }

  .chat-box {
    width: 100%;
    padding: 0.75rem 0.5rem;
    gap: 0.5rem;
    /* Ensure proper bottom positioning */
    margin: 0;
    border-radius: 0; /* Remove border radius on mobile for full width */
    /* Ensure it stays at bottom */
  }

  /* Prevent any horizontal overflow in messages */
  .message {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .user-message-bubble,
  .bot-message {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
  }
}

/* Remove the problematic mobile keyboard handling that was hiding the chat box */
/* @media (max-height: 600px) and (max-width: 768px) {
  .chat-wrapper {
    height: 100vh;
  }
  
  .chat-content {
    /* Reduce padding when keyboard is visible */
/*padding: 0.25rem;
  }
  
  .chat-box {
    /* Ensure chat box stays visible */
/*position: sticky;
    bottom: 0;
    z-index: 10;
  }
} */

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
  padding: 0.5rem 1.5rem; /* Increased left/right padding from 1rem to 1.5rem */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  font-size: var(--font-size-md);
  text-align: left;
  white-space: pre-line;
  line-height: 1.2;
}

/* Add specific RTL padding for Hebrew text */
.rtl .bot-message {
  direction: rtl !important;
  text-align: right !important;
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

.indented-line {
  padding-left: 1.5em; /* Adjust as needed */
  text-indent: -1.2em; /* Pull bullet back out */
  display: block;
}

.rtl .bot-message,
.rtl .user-message-bubble {
  direction: rtl !important;
  text-align: right !important;
}

/* Session End UI Styles */
.session-end-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: var(--content-width);
  margin: var(--spacing-lg) auto;
  padding: 0 var(--spacing-sm);
}

.decorative-line {
  position: relative;
  width: 100%;
  max-width: 700px; /* Match the chat bubble max-width */
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--color-secondary),
    transparent
  );
  margin-bottom: var(--spacing-lg);
}

.starburst {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--color-secondary);
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}

.session-end-card {
  position: relative;
  background: var(--color-background-alt);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  width: 100%;
  box-shadow: 0 4px 20px var(--color-shadow);
  display: flex;
  gap: var(--spacing-lg);
}

.bina-logo {
  position: absolute;
  left: -60px;
  top: 50%;
  transform: translateY(-50%);
}

.logo-circle {
  width: 50px;
  height: 50px;
  border: 2px solid var(--color-secondary);
  border-radius: var(--border-radius-circular);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(196, 162, 126, 0.1);
}

.logo-pattern {
  width: 30px;
  height: 30px;
  background: radial-gradient(
      ellipse at 30% 30%,
      var(--color-secondary) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 70% 70%,
      var(--color-secondary) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 50% 50%,
      var(--color-secondary) 0%,
      transparent 60%
    );
  border-radius: var(--border-radius-circular);
}

.session-end-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.session-end-message {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  line-height: 1.6;
  white-space: pre-line;
  text-align: right;
  font-family: var(--font-family-primary);
}

.session-end-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-sm);
}

.session-end-button {
  background: var(--color-secondary);
  color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--font-size-md);
  font-family: var(--font-family-primary);
  transition: var(--transition-normal);
  border: none;
  cursor: pointer;
  display: inline-block;
}

.session-end-button:hover {
  background: var(--color-secondary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 162, 126, 0.3);
}

.session-end-button:active {
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: var(--breakpoint-tablet)) {
  .session-end-card {
    padding: var(--spacing-lg);
    flex-direction: column;
  }

  .bina-logo {
    position: static;
    transform: none;
    align-self: center;
    margin-bottom: var(--spacing-sm);
  }

  .session-end-message {
    text-align: center;
  }

  .session-end-button-container {
    justify-content: center;
  }
}

/* Fade transition for session end UI */
.fade-enter-active,
.fade-leave-active {
  transition: var(--transition-normal);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Decorative line styles */
.decorative-line-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 1rem 0;
  padding: 0 1rem; /* Add padding to match chat content */
}

.decorative-line {
  position: relative;
  width: 100%;
  max-width: 700px; /* Match the chat bubble max-width */
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--color-secondary),
    transparent
  );
}

.starburst {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--color-secondary);
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
  box-shadow: 0 0 8px rgba(196, 162, 126, 0.6);
}

.message-button-container {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-start;
}

/* Add RTL support for message button alignment */
.rtl .message-button-container {
  justify-content: flex-end;
}

.message-button {
  background: var(--color-secondary);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: inline-block;
}

.message-button:hover {
  background: var(--color-secondary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 162, 126, 0.3);
}

.message-button:active {
  transform: translateY(0);
}
</style>
