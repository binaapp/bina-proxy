<template>
  <header class="chat-header">
    <div class="header-inner">
      <div class="header-side left">
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
      </div>
      <div class="header-center">
        <router-link
          to="/"
          class="logo-link"
          aria-label="Go to home"
          @click.prevent="handleLogoClick"
        >
          <img src="/bina-logo.png" alt="Bina Logo" />
        </router-link>
      </div>
      <div class="header-side right">
        <div class="auth-buttons">
          <template v-if="user">
            <span class="hi-user">{{ `Hi ${firstName || "there"}` }}</span>
          </template>
          <template v-else>
            <!-- Desktop: show buttons, Mobile: show icon -->
            <span class="desktop-auth">
              <router-link
                :to="{ path: '/login', query: { redirect: $route.fullPath } }"
                class="login-link"
                >Log in</router-link
              >
              <router-link to="/signup" class="signup-btn">Sign in</router-link>
            </span>
            <span class="mobile-auth">
              <button
                class="user-icon-btn"
                @click="userMenuOpen = !userMenuOpen"
              >
                <!-- Simple user icon SVG -->
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle cx="16" cy="12" r="6" fill="#fff" />
                  <rect x="8" y="22" width="16" height="8" rx="3" fill="#fff" />
                  <rect
                    x="2"
                    y="2"
                    width="28"
                    height="28"
                    rx="6"
                    fill="none"
                    stroke="#fff"
                    stroke-width="0"
                  />
                </svg>
                <svg
                  width="16"
                  height="32"
                  viewBox="0 0 16 16"
                  style="margin-left: 2px"
                >
                  <polygon points="4,6 8,10 12,6" fill="#fff" />
                </svg>
              </button>
              <div v-if="userMenuOpen" class="user-menu-modal">
                <button
                  class="close-user-menu"
                  @click="closeUserMenu"
                  aria-label="Close menu"
                >
                  &times;
                </button>
                <router-link
                  :to="{ path: '/login', query: { redirect: $route.fullPath } }"
                  class="user-menu-link"
                  @click="closeUserMenu"
                  >Log in</router-link
                >
                <router-link
                  to="/signup"
                  class="user-menu-link"
                  @click="closeUserMenu"
                  >Sign in</router-link
                >
              </div>
            </span>
          </template>
        </div>
      </div>
    </div>
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
        <li v-if="user">
          <a href="#" class="menu-link" @click.prevent="handleSignOut"
            >Sign Out</a
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { auth } from "../firebase";

const menuOpen = ref(false);
const userMenuOpen = ref(false); // <-- for mobile user icon menu
const route = useRoute();
const router = useRouter();

const user = ref(null);
const firstName = ref("");

// Listen for auth state changes and extract first name
onMounted(() => {
  user.value = auth.currentUser;
  if (user.value && user.value.displayName) {
    firstName.value = user.value.displayName.split(" ")[0];
  }
  auth.onAuthStateChanged((u) => {
    user.value = u;
    if (u && u.displayName) {
      firstName.value = u.displayName.split(" ")[0];
    } else {
      firstName.value = "";
    }
  });
});

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

async function handleSignOut() {
  await auth.signOut();
  menuOpen.value = false;
  router.push("/");
}

function closeUserMenu() {
  userMenuOpen.value = false;
}
</script>

<style scoped>
.chat-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  width: 100%;
  padding: 0;
}

.header-side {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  min-width: 0;
  justify-content: flex-start;
  padding-left: 2.5rem;
}

.header-side.right {
  justify-content: flex-end;
  padding-left: 0;
  padding-right: 2.5rem;
}

.header-center {
  flex: 0 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}

.hamburger {
  background: none;
  border: none;
  cursor: pointer;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.logo-link img {
  height: 50px;
  width: auto;
  max-width: 250px;
  object-fit: contain;
  display: block;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 10;
}

.login-link {
  color: var(--color-text-on-primary, #fff);
  font-family: var(--font-family-primary);
  font-size: 1.2rem;
  text-decoration: none;
  margin-right: 0.5rem;
  transition: color 0.2s;
}

.login-link:hover {
  color: var(--color-secondary, #c7ab8c);
}

.signup-btn {
  background: var(--color-secondary, #c7ab8c);
  color: var(--color-primary, #1f4057);
  font-family: var(--font-family-primary);
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
  cursor: pointer;
  display: inline-block;
}

.signup-btn:hover {
  background: #b89a7a;
}

.hamburger-menu-modal {
  position: absolute;
  top: 70px;
  left: 23%;
  transform: translateX(-50%);
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

.hi-user {
  color: var(--color-text-on-primary, #fff);
  font-family: var(--font-family-primary);
  font-size: 1.2rem;
  margin-right: 2.5rem; /* Increased right margin */
  cursor: default;
  transition: none;
  text-decoration: none;
  font-weight: 500;
  /* Remove hover effect */
}

.hi-user:hover {
  color: var(--color-text-on-primary, #fff); /* No hover effect */
  text-decoration: none;
  cursor: default;
}

.desktop-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.mobile-auth {
  display: none;
}

/* Mobile styles */
@media (max-width: 600px) {
  .header-side.left,
  .header-side.right {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .header-inner {
    height: 56px;
  }
  .logo-link img {
    height: 40px;
    max-width: 160px;
  }
  .auth-buttons {
    gap: 0.5rem;
  }
  .login-link,
  .signup-btn {
    font-size: 1rem;
    padding: 0.4rem 1rem;
  }
  .desktop-auth {
    display: none;
  }
  .mobile-auth {
    display: inline-block;
    position: relative;
  }
  .user-icon-btn {
    background: none;
    border: 2px solid #fff;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-right: 0.5rem; /* Add this line for extra space from the edge */
  }
  .user-menu-modal {
    position: absolute;
    top: 40px;
    right: 0;
    background: #fff;
    color: var(--color-primary);
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    padding: 2rem 2.5rem 1.5rem 2.5rem;
    z-index: 1001;
    min-width: 120px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .user-menu-link {
    color: var(--color-primary);
    font-size: 1.15rem;
    margin-bottom: 1.5rem;
    text-decoration: none;
    font-family: var(--font-family-primary);
    font-weight: 500;
  }
  .user-menu-link:last-child {
    margin-bottom: 0;
  }
  .close-user-menu {
    position: absolute;
    top: 1rem;
    right: 1.2rem;
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: 2.5rem;
    cursor: pointer;
    z-index: 1002;
  }
  .header-side.right {
    padding-right: 1rem; /* Increase as needed */
  }
}
</style>
