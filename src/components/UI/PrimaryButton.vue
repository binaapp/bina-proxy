<template>
  <button
    class="start-button"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: "PrimaryButton",
  props: {
    type: { type: String, default: "button" },
    disabled: { type: Boolean, default: false },
  },
};
</script>

<style scoped>
@import "../../utils/variables.css";

.start-button {
  background-color: var(--color-secondary);
  color: var(--color-primary);
  /* padding: var(--spacing-sm) var(--spacing-lg);*/
  padding-bottom: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  padding-left: var(--spacing-xl);
  padding-right: var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: 700;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  box-shadow: 0 6px 12px var(--color-shadow);
  transition: all var(--transition-fast);
  margin-top: var(--spacing-md);
}
.start-button:hover {
  background-color: #d4b494; /* Consider adding var(--color-secondary-light) */
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); /* lifted & deeper */
}
.start-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2); /* pressed down */
}
</style>
