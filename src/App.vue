<template>
  <router-view />
  <AppFooter />
</template>

<script setup>
import { useHead } from "@vueuse/head";
import AppFooter from "./components/UI/AppFooter.vue";

useHead({
  title: "bina – Lead with Clarity and Confidence",
  meta: [
    {
      name: "description",
      content:
        "Your AI coaching companion to help you lead with clarity, confidence, and emotional resilience.",
    },
    {
      property: "og:title",
      content: "bina – Lead with Clarity and Confidence",
    },
    {
      property: "og:description",
      content:
        "Your AI coaching companion to help you lead with clarity, confidence, and emotional resilience.",
    },
  ],
});
//import LandingPage from "./components/LandingPage.vue";
</script>

<style>
html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
  overflow-x: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
