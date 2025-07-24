<template>
  <div class="login-ui">
    <h2 class="title">Welcome back</h2>
    <p class="subtitle">
      This is your space to pause, reflect, and<br />
      reconnect with what matters.
    </p>
    <button class="google-btn" @click="onGoogleSignIn">
      <span class="google-logo" aria-hidden="true">
        <!-- Google "G" SVG -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 48 48"
        >
          <g>
            <path
              fill="#4285F4"
              d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.18 2.7 30.45 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.99 6.21C12.13 13.16 17.62 9.5 24 9.5z"
            />
            <path
              fill="#34A853"
              d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.36 46.1 24.55z"
            />
            <path
              fill="#FBBC05"
              d="M10.68 28.65c-1.02-2.98-1.02-6.18 0-9.16l-7.99-6.21C.64 17.1 0 20.47 0 24c0 3.53.64 6.9 1.69 10.02l7.99-6.21z"
            />
            <path
              fill="#EA4335"
              d="M24 48c6.45 0 12.18-2.13 16.7-5.81l-7.19-5.6c-2.01 1.35-4.59 2.15-7.51 2.15-6.38 0-11.87-3.66-14.32-8.95l-7.99 6.21C6.73 42.52 14.82 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </g>
        </svg>
      </span>
      Login with Google
    </button>
    <div class="divider">
      <span>or</span>
    </div>
    <p class="subtitle2">Enter your email and pasword to access your account</p>
    <form @submit.prevent="onEmailLogin">
      <label class="label" for="email">EMAIL</label>
      <input
        id="email"
        class="input"
        type="email"
        v-model="email"
        placeholder="hello@reallygreatsite.com"
        required
      />

      <label class="label" for="password">PASSWORD</label>
      <div class="password-wrapper">
        <input
          id="password"
          class="input"
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="XXXXX"
          required
        />
        <span class="toggle-password" @click="showPassword = !showPassword">
          <svg
            v-if="showPassword"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="var(--color-text-dark)"
              stroke-width="2"
              d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="var(--color-text-dark)"
              stroke-width="2"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="var(--color-text-dark)"
              stroke-width="2"
              d="M3 3l18 18M3 12s3.6-7 9-7c2.1 0 4.1.7 5.8 1.8M21 12s-3.6 7-9 7c-2.1 0-4.1-.7-5.8-1.8"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="var(--color-text-dark)"
              stroke-width="2"
            />
          </svg>
        </span>
      </div>
      <div class="login-options">
        <label>
          <input type="checkbox" v-model="rememberMe" />
          Remember me
        </label>
        <a href="#" class="forgot-link">Forgot Password?</a>
      </div>
      <button class="signup-btn" type="submit">Login</button>
    </form>
    <p class="login-link">
      Dont have an account? <router-link to="/signup">Sign up now</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter, useRoute } from "vue-router";
import { getApiBase } from "@/utils/sessionApi";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const router = useRouter();
const route = useRoute();

async function onGoogleSignIn() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();
    const sessionId = localStorage.getItem("binaSessionId");
    const apiUrl = `${getApiBase()}/api/firebase-login`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        sessionId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      if (data.sessionId) {
        localStorage.setItem("binaSessionId", data.sessionId);
      }
      const redirectPath = route.query.redirect || "/chat";
      console.log("route.query.redirect", route.query.redirect);
      console.log("Redirecting to", redirectPath);
      router.replace(redirectPath);
    } else {
      alert(data.error || "Google login failed");
    }
  } catch (error) {
    alert("Google sign-in failed");
  }
}

async function onEmailLogin() {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    const sessionId = localStorage.getItem("binaSessionId");
    const apiUrl = `${getApiBase()}/api/firebase-login`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        sessionId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      if (data.sessionId) {
        localStorage.setItem("binaSessionId", data.sessionId);
      }
      const redirectPath = route.query.redirect || "/chat";
      console.log("route.query.redirect", route.query.redirect);
      console.log("Redirecting to", redirectPath);
      router.replace(redirectPath);
    } else {
      alert(data.error || "Login failed. Please try again.");
    }
  } catch (error) {
    alert(error.message);
  }
}
</script>

<style scoped>
@import "../utils/variables.css";

.login-ui {
  background: var(--color-primary);
  color: var(--color-text-light);
  max-width: 400px;
  margin: 2rem auto;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md)
    var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 24px var(--color-shadow);
  font-family: var(--font-family-primary);
}

.title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  color: var(--color-secondary);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.subtitle {
  text-align: center;
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
}

.subtitle2 {
  text-align: center;
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-light);
}

.google-btn {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: var(--color-primary);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: 500;
  padding: 0;
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  transition: background var(--transition-fast);
  box-shadow: 0 2px 8px var(--color-shadow);
}

.google-btn:hover {
  background: var(--color-background-alt);
}

.google-logo {
  width: 24px;
  height: 24px;
  margin-right: var(--spacing-sm);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: var(--spacing-md) 0;
  color: var(--color-secondary);
  font-size: var(--font-size-md);
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--color-border);
  margin: 0 var(--spacing-sm);
}

.label {
  display: block;
  margin-bottom: var(--spacing-xs);
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
  letter-spacing: 1px;
  color: var(--color-secondary);
}

.input {
  width: 100%;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-text-dark);
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-sm);
  outline: none;
  transition: border var(--transition-fast);
  box-sizing: border-box;
  height: 44px;
}

.input:focus {
  border: 1.5px solid var(--color-secondary);
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: var(--spacing-sm);
}

.password-wrapper .input {
  width: 100%;
  margin-bottom: 0;
  box-sizing: border-box;
  height: 44px;
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: var(--spacing-xs);
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--color-secondary);
  padding: 0 var(--spacing-xs);
  display: flex;
  align-items: center;
  z-index: 2;
  background: transparent;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.forgot-link {
  color: var(--color-text-light);
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}

.signup-btn {
  width: 100%;
  background: var(--color-secondary);
  color: var(--color-primary);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-lg);
  font-weight: 600;
  padding: var(--spacing-sm) 0;
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.signup-btn:hover {
  background: var(--color-secondary-light);
}

.login-link {
  text-align: center;
  font-size: var(--font-size-md);
  color: var(--color-text-light);
}
.login-link a {
  color: var(--color-secondary);
  text-decoration: underline;
}
</style>
