import { ref, onMounted } from "vue";

const DAILY_LIMIT = 30;
const STORAGE_KEY = "user_interactions";

export function useInteractionLimiter() {
  const interactionsCount = ref(0);
  const isLimitReached = ref(false);

  const loadInteractions = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { count, date } = JSON.parse(stored);
      const storedDate = new Date(date);
      const today = new Date();

      // Reset counter if it's a new day
      if (
        storedDate.getDate() !== today.getDate() ||
        storedDate.getMonth() !== today.getMonth() ||
        storedDate.getFullYear() !== today.getFullYear()
      ) {
        interactionsCount.value = 0;
        updateStorage();
      } else {
        interactionsCount.value = count;
        isLimitReached.value = count >= DAILY_LIMIT;
      }
    } else {
      updateStorage();
    }
  };

  const updateStorage = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        count: interactionsCount.value,
        date: new Date().toISOString(),
      })
    );
    isLimitReached.value = interactionsCount.value >= DAILY_LIMIT;
  };

  const incrementInteraction = () => {
    if (isLimitReached.value) {
      return false;
    }
    interactionsCount.value++;
    updateStorage();
    return true;
  };

  const getRemainingInteractions = () => {
    return Math.max(0, DAILY_LIMIT - interactionsCount.value);
  };

  onMounted(() => {
    loadInteractions();
  });

  return {
    interactionsCount,
    isLimitReached,
    incrementInteraction,
    getRemainingInteractions,
  };
}
