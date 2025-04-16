<!-- A simple typing indicator with animated dots -->
<template>
  <div class="typing-indicator" :class="{ 'is-visible': isVisible }">
    <div class="typing-indicator-text">Bina is reflecting</div>
    <div class="typing-indicator__dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "TypingIndicator",
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.typing-indicator-text {
  margin-bottom: 8px;
  color: #f0f0f0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.typing-indicator {
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 8px 16px;
}

.typing-indicator.is-visible {
  opacity: 1;
}

.typing-indicator__dots {
  display: flex;
  gap: 4px;
}

.typing-indicator__dots span {
  width: 8px;
  height: 8px;
  background: #666;
  border-radius: 50%;
  animation: typingAnimation 1.4s infinite;
  display: inline-block;
}

.typing-indicator__dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator__dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingAnimation {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
