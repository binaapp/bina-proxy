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
