<template>
  <div class="chat-wrapper">
    <div class="progress-bar" :style="{ width: progressWidth + '%' }"></div>

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
            :type="messageTypes[index]"
            :delay="index * 500"
          />
          <div v-else class="user-message">
            {{ message }}
          </div>
        </div>
      </transition-group>

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

export default {
  name: "ChatView",
  components: { AiStep, TypingMessage },
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

      if (nextIndex < this.flowData.steps.length) {
        const nextStep = this.flowData.steps[nextIndex];
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
      return null;
    },
  },
  mounted() {
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
    sendMessage() {
      if (!this.userInput.trim()) return;
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
      this.isAwaitingAi = true;
    },
    handleStepResult(result) {
      console.log("Received step result:", result);
      console.log("Current step before transition:", this.currentStep);
      console.log("Current messages:", this.chatMessages);
      console.log("Current message types:", this.messageTypes);
      this.isAwaitingAi = false;

      // First, handle the AI's reflection and question if they exist
      if (
        result.reflection ||
        (result.question && result.question.length > 0)
      ) {
        // Combine reflection and question into one response
        const aiResponse = [
          result.reflection,
          result.question ? result.question[0] : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        console.log("Adding AI response:", aiResponse);
        // Only add the response if it's not already in the history
        const lastMessage = this.sessionHistory[this.sessionHistory.length - 1];
        if (!lastMessage || lastMessage.content !== aiResponse) {
          this.chatMessages.push(aiResponse);
          this.messageTypes.push("bot");
          this.sessionHistory.push({
            role: "assistant",
            content: aiResponse,
          });
        }
      }

      if (result.status === "passed") {
        // Store the current step index before updating
        const previousStepIndex = this.currentStepIndex;

        // Update the step index
        if (this.currentStepIndex === 0) {
          this.currentStepIndex = 1;
          console.log("Moving to situation step:", this.currentStep);
        } else {
          this.currentStepIndex++;
        }

        // Update step data
        const newStep = this.currentStep;
        console.log("New step data:", newStep);

        // Check if we've reached the closing step
        if (newStep.name === "closing") {
          // Add the closing message only if it's not the last message
          const lastMessage =
            this.sessionHistory[this.sessionHistory.length - 1];
          if (!lastMessage || lastMessage.content !== newStep.question) {
            this.chatMessages.push(newStep.question);
            this.messageTypes.push("bot");
            this.sessionHistory.push({
              role: "assistant",
              content: newStep.question,
            });
          }
          // Disable further input
          this.isAwaitingAi = false;
          return;
        }

        // Update the step data
        this.introText = newStep.introText || "";
        this.nextQuestion = newStep.nextQuestion || "";
        this.currentOptions = Array.isArray(newStep.options)
          ? newStep.options
          : [];

        console.log("Updated step data:", {
          introText: this.introText,
          nextQuestion: this.nextQuestion,
          currentOptions: this.currentOptions,
        });

        // If we're moving to a new step (except closing), add the new intro text
        if (
          previousStepIndex !== this.currentStepIndex &&
          this.introText &&
          newStep.name !== "closing"
        ) {
          const newMessage =
            this.introText + "\n\n" + (this.nextQuestion || "");
          console.log("Adding new step message:", newMessage);
          this.chatMessages.push(newMessage);
          this.messageTypes.push("bot");
          this.sessionHistory.push({
            role: "assistant",
            content: newMessage,
          });
        }
      }

      this.userInput = "";
      console.log("After update - messages:", this.chatMessages);
      console.log("After update - types:", this.messageTypes);
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
  height: 100vh;
  max-height: 100vh;
  position: relative;
  background: linear-gradient(to bottom, #12344d, #0f2c3f);
  color: #f0f0f0;
  font-family: "Inter", sans-serif;
}

.chat-wrapper::after {
  content: "";
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 999;
}

.progress-bar {
  height: 4px;
  background-color: #c8b28e;
  width: 20%;
  transition: width 0.3s ease-in-out;
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
}

.chat-header img {
  height: 40px;
  width: auto;
  max-width: 200px;
  object-fit: contain;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 80px; /* Space for chat box */
  display: flex;
  flex-direction: column;
  align-items: center;
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
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 700px;
  padding: 1rem;
  background: #1a2d3b;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  z-index: 1000;
  border-radius: 24px;
  margin: 0 1rem;
  width: calc(100% - 2rem);
}

.chat-box input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  min-width: 0; /* Allows input to shrink */
}

.chat-box button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #4a90e2;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Prevents button from shrinking */
}

@media (max-width: 768px) {
  .chat-content {
    padding: 0.5rem;
    padding-bottom: 70px;
    align-items: flex-start; /* Left align on mobile */
  }

  .chat-box {
    bottom: 15px;
    left: 0.75rem;
    right: 0.75rem;
    transform: none;
    width: calc(100% - 1.5rem);
    padding: 0.75rem;
  }

  .chat-box input {
    padding: 0.5rem 1rem;
    font-size: 16px; /* Prevents iOS zoom */
  }

  .chat-box button {
    width: 36px;
    height: 36px;
  }

  .message.bot {
    justify-content: flex-start; /* Left align on mobile */
  }

  .user-message,
  .message.bot {
    max-width: 85%;
    padding: 0.75rem 1rem;
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
}

.user-message::after {
  content: "";
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent transparent rgba(200, 178, 142, 0.1);
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

/* Add spacing between consecutive bot messages */
.message.bot + .message.bot {
  margin-top: 1.5rem;
}

/* Add spacing after user messages */
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
</style>
