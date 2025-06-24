<template>
  <component :is="articleComponent" v-if="articleComponent" />
  <div v-else>Article not found.</div>
</template>

<script setup>
import { shallowRef, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const articleComponent = shallowRef(null);

function slugToComponentName(slug) {
  // Converts "why-you-feel-disconnected" => "WhyYouFeelDisconnected"
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

async function loadArticle() {
  const slug = route.params.slug;
  const componentName = slugToComponentName(slug);
  try {
    articleComponent.value = (
      await import(`../components/Articles/${componentName}.vue`)
    ).default;
  } catch (e) {
    articleComponent.value = null;
  }
}

watch(() => route.params.slug, loadArticle, { immediate: true });
</script>

<style scoped>
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
</style>
