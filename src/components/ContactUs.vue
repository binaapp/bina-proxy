<template>
  <div class="contact-page">
    <div class="contact-info">
      <h1 class="contact-title">Contact Us</h1>
      <h2 class="contact-subtitle">We'd love to hear from you</h2>
      <p class="contact-description">
        Whether you have a question, feedback, or an idea to explore — we'd love
        to hear from you. Fill out the form and we'll get back to you soon.
      </p>
    </div>
    <form class="contact-form" @submit.prevent="handleSubmit">
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
  </div>
</template>

<script setup>
import { ref } from "vue";

const name = ref("");
const email = ref("");
const reason = ref("");
const message = ref("");

function handleSubmit() {
  // Replace with your actual submission logic (API, email, etc.)
  alert("Thank you for contacting us!");
  name.value = "";
  email.value = "";
  reason.value = "";
  message.value = "";
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
  padding: 4rem 2rem;
  box-sizing: border-box;
}

.contact-info {
  max-width: 500px;
  flex: 1 1 0;
  margin-right: 2rem;
}

.contact-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxxl);
  color: var(--color-secondary);
  margin-bottom: 1.5rem;
  font-weight: 700;
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
  font-size: var(--font-size-xxl);
  font-weight: 700;
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
    margin-right: 0;
    margin-bottom: 0.5rem;
    max-width: 100%;
  }
  .contact-form {
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
</style>
