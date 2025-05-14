<template>
  <AppHeader />
  <div class="contact-page">
    <div class="contact-info">
      <h1 class="contact-title">Contact Us</h1>
      <h2 class="contact-subtitle">We'd love to hear from you</h2>
      <p class="contact-description">
        Whether you have a question, feedback, or an idea to explore — we'd love
        to hear from you. Fill out the form and we'll get back to you soon.
      </p>
    </div>
    <div class="contact-right">
      <form v-if="!sent" class="contact-form" @submit.prevent="handleSubmit">
        <input
          type="text"
          v-model="name"
          placeholder="Full Name (required)"
          required
          autocomplete="name"
        />
        <input
          type="email"
          v-model="email"
          placeholder="Email (required)"
          required
          autocomplete="email"
        />
        <select v-model="reason" required>
          <option disabled value="">Reason for contact</option>
          <option>General Inquiry</option>
          <option>Feedback</option>
          <option>Support</option>
          <option>Other</option>
        </select>
        <textarea
          v-model="message"
          placeholder="Message"
          required
          rows="5"
        ></textarea>
        <button type="submit" class="send-button">Send Message</button>
      </form>
      <div v-else class="thank-you-message">
        <h1 class="thanks-title">Thanks for reaching out.</h1>
        <p class="thanks-text">
          We've received your message and will get back to you soon.<br />
          In the meantime, feel free to start a session or explore more about
          Bina.
        </p>
        <button class="start-button" @click="$router.push('/chat')">
          START NOW
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppHeader from "./AppHeader.vue";

const name = ref("");
const email = ref("");
const reason = ref("");
const message = ref("");
const sent = ref(false);

async function handleSubmit() {
  try {
    await fetch("http://localhost:3001/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        reason: reason.value,
        message: message.value,
      }),
    });
    sent.value = true;
  } catch (err) {
    // Show error message
  }
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--color-primary);
  color: var(--color-text-light);
  font-family: var(--font-family-primary);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 4rem;
  padding: 4rem 9rem;
  box-sizing: border-box;
}

.contact-info {
  max-width: var(--content-width, 1200px) !important;
  max-width: 500px;
  flex: 1 1 0;
  margin-right: 2rem;
  text-align: left;
}

.contact-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxxl);
  color: var(--color-secondary);
  margin-bottom: 1.5rem;
  font-weight: 700;
  margin-top: 0;
}

.contact-subtitle {
  font-size: var(--font-size-xl);
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--color-text-light);
}

.contact-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
  line-height: 1.5;
}

.contact-right {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.contact-form {
  background: var(--color-background);
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 16px var(--color-shadow);
  padding: 2rem;
  min-width: 350px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  flex: 1 1 0;
}

.contact-form input,
.contact-form select,
.contact-form textarea {
  font-size: var(--font-size-lg);
  font-family: var(--font-family-primary);
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-primary);
  background: var(--color-background);
  color: var(--color-primary);
  outline: none;
  transition: border-color 0.2s;
}

.contact-form input:focus,
.contact-form select:focus,
.contact-form textarea:focus {
  border-color: var(--color-secondary);
}

.contact-form textarea {
  min-height: 120px;
  resize: vertical;
}

.send-button {
  background: var(--color-secondary);
  color: var(--color-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-lg);
  font-weight: 500;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.5rem 2rem;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.send-button:hover {
  background: var(--color-secondary-light);
}

@media (max-width: 900px) {
  .contact-page {
    flex-direction: column;
    align-items: stretch;
    gap: 2rem;
    padding: 2rem 1rem;
  }
  .contact-info {
    min-height: unset !important;
    height: auto !important;
    flex: none !important;
    margin-right: 0;
    margin-bottom: 0.5rem;
    max-width: 100%;
  }
  .contact-form {
    min-height: unset !important;
    height: auto !important;
    flex: none !important;
    padding-top: 0.5rem;
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .contact-title {
    font-size: var(--font-size-xxl);
  }
  .contact-subtitle {
    font-size: var(--font-size-lg);
  }
  .contact-description {
    font-size: var(--font-size-md);
  }
  .contact-form {
    padding: 1rem 1.2rem;
    gap: 1rem;
    width: 100%;
    box-sizing: border-box;
  }
  .send-button {
    font-size: var(--font-size-xl);
    padding: 0.5rem 1rem;
  }
}

.thank-you-message {
  background: var(--color-primary);
  border-radius: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  text-align: left;
  padding: 0;
}

.thanks-title {
  font-family: var(--font-family-heading);
  font-size: 3rem;
  color: var(--color-secondary);
  margin-bottom: 2rem;
  font-weight: 700;
  margin-top: 0;
}

.thanks-text {
  color: var(--color-text-light);
  font-size: 2rem;
  margin-bottom: 2.5rem;
  line-height: 1.3;
}

.start-button {
  background-color: var(--color-secondary);
  color: var(--color-primary);
  padding: 1rem 3rem;
  font-size: 2rem;
  font-weight: 700;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  box-shadow: 0 6px 12px var(--color-shadow);
  transition: all var(--transition-fast);
  margin-top: 2rem;
}

.start-button:hover {
  background-color: var(--color-secondary-light);
}
</style>
