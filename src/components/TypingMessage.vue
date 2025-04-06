<template>
  <div class="typing-message">
    <p ref="messageText">&nbsp;</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "bot",
  },
  delay: {
    type: Number,
    default: 0,
  },
});

const messageText = ref(null);

onMounted(() => {
  setTimeout(() => {
    let index = 0;
    messageText.value.textContent = "";

    const interval = setInterval(() => {
      if (index < props.text.length) {
        messageText.value.textContent += props.text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);
  }, props.delay);
});
</script>

<style scoped>
.typing-message {
  font-size: 1.1rem;
  line-height: 1.6;
  width: 100%;
}

.typing-message p {
  white-space: pre-wrap;
  margin: 0;
  text-align: left;
  min-height: 1.6em;
  color: #f0f0f0;
}

/* Add spacing between paragraphs */
.typing-message p + p {
  margin-top: 1.25rem;
}

@media (max-width: 768px) {
  .typing-message p + p {
    margin-top: 1rem;
  }
}
</style>
