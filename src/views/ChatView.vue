<template>
  <div class="chat-wrapper">
    <header class="chat-header">
      <img src="/bina-logo.png" alt="Bina Logo" />
    </header>

    <section class="chat-content">
      <transition-group name="fade" tag="div">
        <div
          v-for="(message, index) in chatMessages"
          :key="index"
          :class="['message', messageTypes[index]]"
        >
          <TypingMessage
            v-if="messageTypes[index] === 'bot'"
            :text="message"
            @typing-start="hideTypingIndicator"
          />
          <div v-else class="user-message">
            {{ message }}
          </div>
        </div>
      </transition-group>

      <transition name="fade">
        <TypingIndicator v-if="sessionRunner?.isAwaitingAi" />
      </transition>

      <!-- Feedback button container -->
      <div
        class="button-container"
        v-if="
          chatMessages.length > 0 &&
          chatMessages[chatMessages.length - 1].includes('feedback')
        "
      >
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfzrsEpCge_BW72pyPD7jRqS1vqEThJT73JGIPN7EERe89IwQ/viewform?usp=dialog"
          target="_blank"
          class="google-form-button"
        >
          Click here to leave your feedback
        </a>
      </div>
    </section>

    <div class="chat-box">
      <input
        type="text"
        v-model="userInput"
        placeholder="Message Bina"
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">&#8593;</button>
    </div>

    <!-- SessionRunner handles the logic -->
    <SessionRunner
      ref="sessionRunner"
      :userInput="userInput"
      @update:userInput="(value) => (userInput = value)"
      :flow-data="flowData"
      :coach-data="coachData"
      @message-sent="handleMessageSent"
      @ai-response="handleAiResponse"
      @session-complete="handleSessionComplete"
      @debug-message="(msg) => console.log('SessionRunner:', msg)"
    />
  </div>
</template>

<script>
import { ref } from "vue"; // Make sure this import is working
import { flowData } from "@/composables/useFlowData";
import coachData from "@/data/coaches/supportive-coach.json";
import SessionRunner from "@/components/SessionRunner.vue";
import TypingMessage from "@/components/TypingMessage.vue";
import TypingIndicator from "@/components/TypingIndicator.vue";
import { useInteractionLimiter } from "../composables/useInteractionLimiter.js";
import { submitSession } from "@/utils/sessionApi";

export default {
  name: "ChatView",
  components: {
    SessionRunner,
    TypingMessage,
    TypingIndicator,
  },
  setup() {
    const { incrementInteraction, isLimitReached } = useInteractionLimiter();
    const sessionRunner = ref(null);
    const userInput = ref("");
    const chatMessages = ref([]);
    const messageTypes = ref([]);

    return {
      sessionRunner,
      userInput,
      chatMessages,
      messageTypes,
      flowData,
      coachData,
      incrementInteraction,
      isLimitReached,
    };
  },
  methods: {
    hideTypingIndicator() {
      if (this.sessionRunner) {
        this.sessionRunner.isAwaitingAi = false;
      }
    },

    sendMessage() {
      if (!this.userInput.trim()) return;

      // Check interaction limit
      if (this.isLimitReached) {
        console.log("Daily interaction limit reached");
        return;
      }

      // Increment the interaction counter
      if (!this.incrementInteraction()) {
        console.log("Daily interaction limit reached");
        return;
      }

      // Let SessionRunner handle the message
      this.sessionRunner?.handleUserSubmit();
    },

    handleMessageSent({ message, type }) {
      console.log("Message sent:", type, message);
      this.chatMessages.push(message);
      this.messageTypes.push(type);
    },

    handleAiResponse({ message, type }) {
      console.log(
        "AI response received:",
        type,
        message.substring(0, 30) + "..."
      );
      this.chatMessages.push(message);
      this.messageTypes.push(type);
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
    },
  },
};
</script>

<style scoped>
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

.chat-box input {
  flex: 1;
  height: 40px;
  padding: 0 1rem;
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
  font-size: 1rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
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
