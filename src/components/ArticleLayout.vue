<template>
  <div>
    <AppHeader />
    <!-- Your existing header component -->

    <div class="article-layout">
      <main class="article-main">
        <h1 class="article-title">{{ title }}</h1>
        <div class="article-content">
          <slot />
        </div>
        <div v-if="buttonUrl" class="button-container">
          <router-link :to="buttonUrl">
            <PrimaryButton>{{ buttonText }}</PrimaryButton>
          </router-link>
        </div>
      </main>
      <aside class="article-sidebar">
        <h2 class="sidebar-title">Additional Articles</h2>
        <div
          class="sidebar-card"
          v-for="item in additionalArticles"
          :key="item.title"
        >
          <h3 class="sidebar-card-title">{{ item.title }}</h3>
          <p class="sidebar-card-excerpt">{{ item.excerpt }}</p>
          <router-link
            v-if="item.link"
            :to="item.link"
            class="sidebar-read-more"
          >
            Read more
          </router-link>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import AppHeader from "./AppHeader.vue";
import PrimaryButton from "./UI/PrimaryButton.vue";

defineProps({
  title: String,
  additionalArticles: {
    type: Array,
    default: () => [],
  },
  buttonUrl: {
    type: String,
    default: "",
  },
  buttonText: {
    type: String,
    default: "START NOW",
  },
});
</script>

<style scoped>
.article-layout {
  display: flex;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 11%;
  gap: 3rem;
}

.article-main {
  flex: 2;
  padding-bottom: 2rem;
}

.article-title {
  font-size: var(--font-size-xxl);
  font-weight: bold;
  text-align: left;
  margin-bottom: 2rem;
  color: var(--color-primary);
  line-height: 1.2;
}

.article-content {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  text-align: left;
}

.article-content h2,
.article-content h3,
.article-content p,
.article-content ul,
.article-content li {
  text-align: left;
}

.article-content h2 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.article-content p {
  margin-bottom: 1.2rem;
}

.article-sidebar {
  flex: 1;
  min-width: 300px;
}

.sidebar-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
  text-align: center;
}

.sidebar-card {
  background: #faf3ee;
  border-radius: 16px;
  box-shadow: 4px 8px 0 #e5ded7;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.sidebar-card-title {
  font-size: var(--font-size-md);
  font-weight: bold;
  margin-bottom: 0.7rem;
  color: var(--color-primary);
  text-align: left;
}

.sidebar-card-excerpt {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  text-align: left;
}

.button-container {
  margin-top: 3rem;
  text-align: center;
}

.sidebar-read-more {
  display: inline-block;
  margin-top: 0.7rem;
  color: #1a0dab;
  text-decoration: underline;
  font-size: 1rem;
  cursor: pointer;
}
.sidebar-read-more:visited {
  color: #551a8b;
}
.sidebar-read-more:hover {
  color: #0056b3;
}

@media (max-width: 900px) {
  .article-layout {
    flex-direction: column;
    gap: 2rem;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  .article-sidebar {
    min-width: unset;
  }
}
</style>
