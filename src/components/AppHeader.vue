<template>
  <header class="chat-header">
    <button
      class="hamburger"
      @click="menuOpen = !menuOpen"
      aria-label="Open menu"
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="10" y="12" width="28" height="4" rx="2" fill="white" />
        <rect x="10" y="22" width="28" height="4" rx="2" fill="white" />
        <rect x="10" y="32" width="28" height="4" rx="2" fill="white" />
      </svg>
    </button>
    <router-link
      to="/"
      class="logo-link"
      aria-label="Go to home"
      @click.prevent="handleLogoClick"
    >
      <img src="/bina-logo.png" alt="Bina Logo" />
    </router-link>
    <nav v-if="menuOpen" class="hamburger-menu-modal">
      <button
        class="close-menu"
        @click="menuOpen = false"
        aria-label="Close menu"
      >
        &times;
      </button>
      <ul class="menu-list">
        <li>
          <a href="#" @click.prevent="goToSection('how-it-works')"
            >How Bina works</a
          >
        </li>
        <li>
          <router-link to="/blog" class="menu-link" @click="menuOpen = false"
            >Blog</router-link
          >
        </li>
        <li>
          <a href="#" @click.prevent="goToSection('why')">Why It Works</a>
        </li>
        <li>
          <a href="#" @click.prevent="goToSection('faq')">FAQ's</a>
        </li>
        <li>
          <a href="#" @click.prevent="goToSection('vision')">Our Vision</a>
        </li>
        <li>
          <router-link to="/contact" class="menu-link" @click="menuOpen = false"
            >Contact Us</router-link
          >
        </li>
      </ul>
      <router-link to="/chat" class="menu-action" @click="menuOpen = false">
        <button class="menu-action-btn">Try it Free</button>
      </router-link>
    </nav>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const menuOpen = ref(false);
const route = useRoute();
const router = useRouter();

function handleLogoClick() {
  if (route.path === "/") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    router.push("/");
  }
}

function goToSection(sectionId) {
  if (route.path === "/") {
    scrollToSection(sectionId);
  } else {
    router.push("/").then(() => {
      setTimeout(() => scrollToSection(sectionId), 100);
    });
  }
  menuOpen.value = false;
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
</script>

<style scoped>
.chat-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
  background: var(--color-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.logo-link {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 5;
}
.logo-link img {
  height: 50px;
  width: auto;
  max-width: 250px;
  object-fit: contain;
  display: block;
}

.hamburger {
  position: absolute;
  left: 11%;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  z-index: 20;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.hamburger svg {
  width: 48px;
  height: 48px;
  display: block;
}

.hamburger-menu-modal {
  position: absolute;
  top: 70px;
  left: 23%;
  transform: translateX(-50%);
  width: 20vw;
  max-width: 340px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem 1rem 1rem;
}

.close-menu {
  position: absolute;
  top: 1rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 2rem;
  cursor: pointer;
  z-index: 1001;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  width: 100%;
  max-width: 320px;
}

.menu-list li {
  width: 100%;
  text-align: center;
  margin: 0;
  padding: 0;
}

.menu-list li:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.menu-list a {
  display: block;
  padding: 1.2rem 0;
  color: var(--color-primary);
  font-size: 1.15rem;
  font-family: var(--font-family-primary);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.menu-list a:hover {
  color: var(--color-secondary);
}

.menu-action {
  width: 100%;
  display: flex;
  justify-content: center;
}

.menu-action-btn {
  width: 100%;
  max-width: 100%;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-primary);
  background: #fff;
  border: 2px solid var(--color-primary);
  border-radius: 12px;
  padding: 0.8rem 25px;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.menu-action-btn:hover {
  background: var(--color-primary);
  color: #fff;
}

.menu-list li:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
}

@media (max-width: 600px) {
  .chat-header {
    height: 72px;
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }

  .logo-link {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 50%;
    display: flex;
    align-items: center;
    z-index: 5;
  }

  .logo-link img {
    height: 40px;
    max-width: 160px;
  }

  .hamburger {
    left: 0.5rem;
    width: 48px;
    height: 48px;
  }

  .hamburger-menu-modal {
    left: 47%;
    transform: translateX(-50%);
    width: 96vw;
    max-width: 320px;
    top: 76px;
    padding: 1rem 0.5rem 0.8rem 0.5rem;
  }
}
</style>
