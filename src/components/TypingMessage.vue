<!-- A component that displays text with a typewriter effect -->
<template>
  <div class="typing-message">
    <span class="typing-message__content">{{ displayedText }}</span>
    <span v-if="isTyping" class="typing-message__cursor"></span>
  </div>
</template>

<script>
import { ref, watch, onBeforeUnmount } from "vue";

export default {
  name: "TypingMessage",
  props: {
    text: {
      type: String,
      required: true,
    },
    typingSpeed: {
      type: Number,
      default: 30, // milliseconds per character
    },
  },

  setup(props, { emit }) {
    const displayedText = ref("");
    const isTyping = ref(false);
    let currentIndex = 0;
    let typingInterval = null;

    console.log("TypingMessage component created");

    const startTyping = () => {
      console.log("Starting typing animation with text:", props.text);
      isTyping.value = true;
      currentIndex = 0;
      displayedText.value = "";
      emit("typing-start");

      clearInterval(typingInterval);
      typingInterval = setInterval(() => {
        if (currentIndex < props.text.length) {
          displayedText.value += props.text[currentIndex];
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          isTyping.value = false;
          console.log("Typing animation complete");
          emit("typing-complete");
        }
      }, props.typingSpeed);
    };

    watch(
      () => props.text,
      (newText) => {
        console.log("TypingMessage received new text:", newText);
        if (newText) {
          startTyping();
        }
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      console.log("TypingMessage component being destroyed");
      clearInterval(typingInterval);
    });

    return {
      displayedText,
      isTyping,
    };
  },
};
</script>

<style scoped>
.typing-message {
  display: inline-flex;
  align-items: center;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  font-size: 1rem;
  line-height: 1.5;
}

.typing-message__content {
  white-space: pre-wrap;
}

.typing-message__cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background-color: currentColor;
  margin-left: 2px;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from,
  to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
