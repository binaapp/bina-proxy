<script setup>
import { computed } from "vue";

const props = defineProps({
  sessionHistory: Array,
  userAnswers: Object,
  flowData: Object,
  stepSummaries: Object,
});

const stepsWithAnswers = computed(() => {
  return props.flowData.steps.map((step) => {
    const historyItem = props.sessionHistory.find((h) => h.step === step.name);
    return {
      name: step.name,
      question: step.question,
      answer: props.userAnswers[step.name] || "—",
      aiDecision: historyItem?.aiResult?.status || "—",
      summary: props.stepSummaries[step.name] || "—",
    };
  });
});
</script>

<template>
  <div class="session-summary">
    <h3>Session Summary</h3>
    <ul>
      <li v-for="step in stepsWithAnswers" :key="step.name">
        <strong>{{ step.name }}</strong
        ><br />
        <em>Question:</em> {{ step.question }}<br />
        <em>Answer:</em> {{ step.answer }}<br />
        <em>AI Decision:</em> {{ step.aiDecision }}<br />
        <em>Summary:</em> {{ step.summary }}
        <hr />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.session-summary {
  margin-top: 2rem;
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 8px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 1rem;
}
</style>
