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

      <!-- Add typing indicator -->
      <transition name="fade">
        <TypingIndicator v-if="isAwaitingAi" />
      </transition>

      <!-- Separate container for the button -->
      <div
        class="button-container"
        v-if="chatMessages[chatMessages.length - 1] === ''"
      >
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfzrsEpCge_BW72pyPD7jRqS1vqEThJT73JGIPN7EERe89IwQ/viewform?usp=dialog"
          target="_blank"
          class="google-form-button"
        >
          Click here to leave your feedback
        </a>
      </div>

      <transition-group name="fade" tag="div">
        <div
          class="quote-card"
          v-for="(quote, index) in shownQuotes"
          :key="quote"
        >
          <span class="quote-number">{{ index + 1 }}.</span>
          <em>{{ quote }}</em>
        </div>
      </transition-group>
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

    <AiStep
      v-if="isAwaitingAi"
      :history="sessionHistory"
      :answer="userInput"
      :systemPrompt="coachData.communicationStyle"
      :conditionDescription="currentStep.condition"
      :nextQuestionInstruction="currentStep.question"
      :followupQuestionInstruction="currentStep.followupQuestion"
      :generalInstructions="flowData.globalInstructions"
      :goal="currentStep.goal"
      :nextPhase="getNextPhase"
      :coachData="coachData"
      :generalGuidelines="currentStep.generalGuidelines"
      :coachTool="currentStep.coachTool"
      :name="currentStep.name"
      :reflection="currentStep.reflection"
      :followupReflection="currentStep.followupReflection"
      :coachPresenceNote="currentStep.coachPresenceNote"
      @step-result="handleStepResult"
    />
  </div>
</template>

<script>
import flowData from "@/data/flows/General.json";
import coachData from "@/data/coaches/supportive-coach.json";
import AiStep from "@/components/AiStep.vue";
import TypingMessage from "@/components/TypingMessage.vue";
import TypingIndicator from "@/components/TypingIndicator.vue";
import { useInteractionLimiter } from "../composables/useInteractionLimiter.js";
import { submitSession } from "@/utils/sessionApi";

export default {
  name: "ChatView",
  components: {
    AiStep,
    TypingMessage,
    TypingIndicator,
  },
  setup() {
    const { incrementInteraction, isLimitReached } = useInteractionLimiter();
    return { incrementInteraction, isLimitReached };
  },
  data: () => ({
    userInput: "",
    currentStepIndex: 0,
    introText: flowData.steps[0].introText || "",
    nextQuestion: flowData.steps[0].nextQuestion || "",
    currentOptions: Array.isArray(flowData.steps[0].options)
      ? flowData.steps[0].options
      : [],
    shownQuotes: [],
    isAwaitingAi: false,
    flowData,
    coachData,
    chatMessages: [],
    sessionHistory: [],
    messageTypes: [],
    sessionStartTime: null,
    sessionId: null,
    isSessionComplete: false,
  }),
  computed: {
    currentStep() {
      // For the first AI evaluation, use the situation phase data
      if (this.currentStepIndex === 0 && this.isAwaitingAi) {
        return this.flowData.steps[1]; // Situation phase
      }
      return this.flowData.steps[this.currentStepIndex] || {};
    },
    progressWidth() {
      return ((this.currentStepIndex + 1) / this.flowData.steps.length) * 100;
    },
    getNextPhase() {
      let nextIndex;
      // For the first AI evaluation, use symptoms (index 2) as next phase
      if (this.currentStepIndex === 0 && this.isAwaitingAi) {
        nextIndex = 2; // Symptoms phase
      } else {
        nextIndex = this.currentStepIndex + 1;
      }

      // Ensure we don't exceed the steps array length
      if (nextIndex < this.flowData.steps.length) {
        const nextStep = this.flowData.steps[nextIndex];
        // Only return next phase if we're actually transitioning
        if (this.currentStepIndex !== nextIndex) {
          return {
            name: nextStep.name,
            goal: nextStep.goal,
            condition: nextStep.condition,
            question: nextStep.question,
            reflection: nextStep.reflection,
            coachPresenceNote: nextStep.coachPresenceNote,
            coachTool: nextStep.coachTool,
          };
        }
      }
      return null;
    },
  },
  mounted() {
    this.sessionStartTime = new Date().toISOString();

    if (this.introText) {
      this.chatMessages.push(
        this.introText + "\n\n" + (this.nextQuestion || "")
      );
      this.messageTypes.push("bot");
      this.sessionHistory.push({
        role: "assistant",
        content: this.introText + "\n\n" + (this.nextQuestion || ""),
      });
    }
  },
  methods: {
    hideTypingIndicator() {
      console.log("Typing started, hiding typing indicator");
      this.isAwaitingAi = false;
    },

    sendMessage() {
      if (!this.userInput.trim()) return;

      // Check interaction limit before proceeding
      if (this.isLimitReached) {
        console.warn("Daily interaction limit reached");
        return;
      }

      // Increment the interaction counter
      if (!this.incrementInteraction()) {
        console.warn("Daily interaction limit reached");
        return;
      }

      console.log("=== START sendMessage ===");
      debugger; // First debug point - entering sendMessage

      console.log("Sending message:", this.userInput);
      console.log("Current step:", this.currentStep);
      console.log("Current step index:", this.currentStepIndex);

      // Only add the message if it's not already in the history
      const lastMessage = this.sessionHistory[this.sessionHistory.length - 1];
      if (!lastMessage || lastMessage.content !== this.userInput) {
        this.chatMessages.push(this.userInput);
        this.messageTypes.push("user");
        this.sessionHistory.push({
          role: "user",
          content: this.userInput,
        });
      }

      // Clear the input after sending
      this.userInput = "";
      console.log("Setting isAwaitingAi to true");
      debugger; // Second debug point - before setting isAwaitingAi
      this.isAwaitingAi = true;
      console.log("isAwaitingAi is now:", this.isAwaitingAi);
    },
    async handleStepResult(result) {
      console.log("=== START handleStepResult ===");
      console.log("Result structure:", {
        reply: result.reply,
        reasoning: result.reasoning,
        status: result.status,
      });

      if (result.reply) {
        if (
          !this.flowData.steps[this.currentStepIndex] ||
          this.flowData.steps[this.currentStepIndex].name !== "integration"
        ) {
          console.log("Adding AI response to chat:", result.reply);
          this.chatMessages.push(result.reply);
          this.messageTypes.push("bot");
          this.sessionHistory.push({
            role: "assistant",
            content: result.reply,
          });
        } else {
          // For integration-to-closing, combine reply with closing message
          const newStep = this.flowData.steps[this.currentStepIndex + 1];
          const closingText = newStep.question
            .split("(https://docs.google.com")[0]
            .trim();

          const combinedMessage = [result.reply, closingText]
            .filter(Boolean)
            .join("\n\n");

          // Set session as complete when showing closing message
          this.isSessionComplete = true;

          this.chatMessages.push(combinedMessage);
          this.messageTypes.push("bot");
          this.sessionHistory.push({
            role: "assistant",
            content: combinedMessage,
          });

          // Add empty message for button after typing is complete
          setTimeout(() => {
            this.chatMessages.push("");
            this.messageTypes.push("bot");
          }, combinedMessage.length * 30 + 500);

          // Disable further input
          this.isAwaitingAi = false;
        }
      }

      // Submit session data
      const currentTime = new Date().toISOString();
      const stepData = {
        stepId: this.currentStep.name,
        startedAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        endedAt: currentTime,
        userText:
          this.sessionHistory[this.sessionHistory.length - 2]?.content || "",
        systemText: JSON.stringify(result),
      };

      try {
        console.log(
          "About to call submitSession with isSessionComplete:",
          this.isSessionComplete
        );
        await submitSession({
          sessionId: this.sessionId,
          startedAt: this.sessionStartTime,
          endedAt: currentTime,
          flowSteps: [...(this.sessionId ? [] : [stepData])],
          completed: this.isSessionComplete,
          feedback: "Test from UI",
        });
      } catch (error) {
        console.error("Failed to submit session:", error);
      }

      if (result.status === "passed") {
        // Store the current step index before updating
        const previousStepIndex = this.currentStepIndex;

        // Update the step index
        if (this.currentStepIndex === 0) {
          this.currentStepIndex = 2; // Move directly to symptoms phase
          console.log("Moving to symptoms step:", this.currentStep);
        } else {
          this.currentStepIndex++;
        }

        // Update step data
        const newStep = this.currentStep;
        console.log("New step data:", newStep);

        // If we just passed the integration phase, we've already handled it above
        if (previousStepIndex < this.flowData.steps.length - 2) {
          // Not the last real step (integration)
          this.isAwaitingAi = false;
        }
      } else {
        this.isAwaitingAi = false;
      }
    },
    revealQuotes() {
      this.shownQuotes = [];

      if (
        !Array.isArray(this.currentOptions) ||
        this.currentOptions.length === 0
      ) {
        return;
      }

      this.currentOptions.forEach((quote, i) => {
        setTimeout(() => {
          this.shownQuotes.push(quote);
        }, i * 200);
      });
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
  padding: 0.5rem 1rem;
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
}

.typing-message {
  text-align: left;
  padding: 0 1rem;
  width: 100%;
}

.message.bot + .message.bot {
  margin-top: 1.5rem;
}

.message.user + .message.bot {
  margin-top: 1.75rem;
}

@media (max-width: 768px) {
  .message {
    margin-bottom: 1.25rem;
  }

  .message.bot + .message.bot {
    margin-top: 1.25rem;
  }

  .message.user + .message.bot {
    margin-top: 1.5rem;
  }
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: -1rem;
}

.google-form-button {
  display: inline-block;
  padding: 12px 24px;
  background-color: white;
  color: #12344d;
  text-decoration: none;
  border-radius: 24px;
  font-weight: 500;
  transition: all 0.3s;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.google-form-button:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
