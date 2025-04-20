<!-- Completely fixed TypingMessage.vue that never shows the link -->
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
    const hasLink = ref(false);
    const extractedLink = ref("");
    let typingInterval = null;

    const startTyping = () => {
      console.log("Starting typing animation with text:", props.text);
      isTyping.value = true;
      hasLink.value = false;
      extractedLink.value = "";
      displayedText.value = "";
      emit("typing-start");

      // Pre-process: Extract links and create a character map
      const charMap = [];
      let processedText = props.text;
      let skipRanges = [];

      // Find all URLs in the text
      const urlRegex = /\(?https?:\/\/[^\s)]+\)?/g;
      let match;
      while ((match = urlRegex.exec(processedText)) !== null) {
        // Extract the URL for the button (first URL found)
        if (!hasLink.value) {
          const url = match[0].replace(/^\(|\)$/g, "");
          hasLink.value = true;
          extractedLink.value = url;
        }

        // Mark character ranges to skip during typing
        skipRanges.push([match.index, match.index + match[0].length]);
      }

      // Create a map of characters to actually type (excluding URL ranges)
      for (let i = 0; i < processedText.length; i++) {
        let shouldSkip = false;

        // Check if this character is within any URL range
        for (const [start, end] of skipRanges) {
          if (i >= start && i < end) {
            shouldSkip = true;
            break;
          }
        }

        if (!shouldSkip) {
          charMap.push({
            char: processedText[i],
            index: i,
          });
        }
      }

      // Type only the non-URL characters
      let typingIndex = 0;
      clearInterval(typingInterval);

      typingInterval = setInterval(() => {
        if (typingIndex < charMap.length) {
          displayedText.value += charMap[typingIndex].char;
          typingIndex++;
        } else {
          clearInterval(typingInterval);
          isTyping.value = false;
          console.log("Typing animation complete");

          // When typing finishes, emit event with link info
          if (hasLink.value) {
            emit("typing-complete", {
              hasLink: true,
              link: extractedLink.value,
            });
          } else {
            emit("typing-complete", {
              hasLink: false,
            });
          }
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
      hasLink,
      extractedLink,
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
