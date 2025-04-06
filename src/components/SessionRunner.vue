<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import AiStep from "./AiStep.vue";
import SessionSummary from "./SessionSummary.vue";

import flowData from "@/data/flows/General.json";
import coachData from "@/data/coaches/supportive-coach.json";

const currentStepIndex = ref(0);
const sessionHistory = ref([]);
const userAnswers = reactive({});
const currentQuestion = ref(flowData.steps[0].introText || "");
const aiResponse = ref(null);
const isAwaitingAi = ref(false);
const stepComplete = ref(false);
const userInput = ref("");
const stepSummaries = reactive(
  JSON.parse(localStorage.getItem("stepSummaries") || "{}")
);

const nextStep = () => {
  if (currentStepIndex.value < flowData.steps.length - 1) {
    currentStepIndex.value++;
    const step = flowData.steps[currentStepIndex.value];
    currentQuestion.value = step.question || step.introText || "";
    userInput.value = "";
    stepComplete.value = false;
  } else {
    console.log("🎉 סשן הסתיים");
  }
};

const saveSummariesToStorage = () => {
  localStorage.setItem("stepSummaries", JSON.stringify(stepSummaries));
};

const summarizeStep = async (stepName, messages) => {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VUE_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a coach assistant summarizer. Your task is to summarize the current coaching step based on the conversation below. Use 2-3 sentences. Highlight the user's main insight, emotional reflection, or learning. Do NOT include advice, next steps, or coaching language. Write the summary in a clear, simple, and emotionally aware tone. You are aware of the previous steps.",
          },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    const summaryText = data.choices[0].message.content.trim();
    stepSummaries[stepName] = summaryText;
    saveSummariesToStorage();
  } catch (err) {
    console.error("Summary generation failed:", err);
    stepSummaries[stepName] = "(Summary unavailable)";
    saveSummariesToStorage();
  }
};

const handleStepResult = async (result) => {
  const step = flowData.steps[currentStepIndex.value];
  const stepName = step.name;
  aiResponse.value = result;

  const fullMessages = [];
  for (const [prevStep, summary] of Object.entries(stepSummaries)) {
    fullMessages.push({
      role: "system",
      content: `Previous step (${prevStep}) summary: ${summary}`,
    });
  }

  sessionHistory.value
    .filter((item) => item.step === stepName)
    .forEach((item) => {
      fullMessages.push({ role: "assistant", content: currentQuestion.value });
      fullMessages.push({ role: "user", content: item.userAnswer });
    });

  fullMessages.push({ role: "assistant", content: currentQuestion.value });
  fullMessages.push({ role: "user", content: userInput.value });

  sessionHistory.value.push({
    step: stepName,
    userAnswer: userInput.value,
    aiResult: result,
  });
  userAnswers[stepName] = userInput.value;

  if (result.status === "passed") {
    await summarizeStep(stepName, fullMessages);
    stepComplete.value = true;
  } else {
    currentQuestion.value = result.question;
    userInput.value = "";
  }
  isAwaitingAi.value = false;
};

const handleUserSubmit = () => {
  isAwaitingAi.value = true;
};
</script>

<template>
  <div class="session-runner">
    <h2>{{ flowData.name }}</h2>
    <p>
      <strong>Coach Style:</strong> {{ coachData.toneOfVoice }} /
      {{ coachData.approach }}
    </p>

    <div v-if="!stepComplete">
      <p class="question">{{ currentQuestion }}</p>
      <input
        v-model="userInput"
        placeholder="Type your response..."
        @keyup.enter="handleUserSubmit"
      />
    </div>

    <AiStep
      v-if="isAwaitingAi"
      :history="sessionHistory"
      :answer="userInput"
      :systemPrompt="coachData.communicationStyle"
      :conditionDescription="flowData.steps[currentStepIndex].condition || ''"
      :nextQuestionInstruction="
        flowData.steps[currentStepIndex].nextQuestion || ''
      "
      :followupQuestionInstruction="
        flowData.steps[currentStepIndex].followupQuestion || ''
      "
      :generalInstructions="flowData.globalInstructions"
      @step-result="handleStepResult"
    />

    <button
      v-if="stepComplete && currentStepIndex < flowData.steps.length - 1"
      @click="nextStep"
    >
      Next
    </button>

    <SessionSummary
      v-if="currentStepIndex === flowData.steps.length - 1 && stepComplete"
      :sessionHistory="sessionHistory"
      :userAnswers="userAnswers"
      :flowData="flowData"
      :stepSummaries="stepSummaries"
    />
  </div>
</template>

<style scoped>
.session-runner {
  max-width: 600px;
  margin: 0 auto;
}
.question {
  font-weight: bold;
  margin-bottom: 8px;
}
</style>
