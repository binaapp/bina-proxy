<template>
  <div class="landing-container">
    <header class="hero-section">
      <h1>
        Management doesn’t have to feel stressful.<br />
        Discover your path to confident leadership.
      </h1>
      <router-link to="/chat">
        <button class="cta-btn">Start Now</button>
      </router-link>
    </header>

    <section class="about-section">
      <h2>About Bina</h2>
      <p>
        Bina helps managers build clarity, resilience, and confidence. Through
        insightful coaching conversations and powerful self-reflection
        questions, Bina enables you to manage pressure effectively, make clearer
        decisions, and lead with greater ease and self-assurance.
      </p>
    </section>

    <section class="process-section">
      <h2>How Does Bina Work?</h2>
      <div class="steps">
        <div class="step">
          <span class="step-number">①</span>
          <h3>Personalized Assessment</h3>
          <p>Identify your strengths and clarify your goals.</p>
        </div>
        <div class="step">
          <span class="step-number">②</span>
          <h3>Insightful Coaching</h3>
          <p>Gain deeper self-awareness and navigate proactively.</p>
        </div>
        <div class="step">
          <span class="step-number">③</span>
          <h3>Practical Next Steps</h3>
          <p>Receive clear strategies tailored to you.</p>
        </div>
      </div>
    </section>

    <section class="benefits-section">
      <h2>Why Managers Choose Bina</h2>
      <ul class="benefits-list">
        <li>✓ Strengthen your leadership skills</li>
        <li>✓ Manage stress confidently</li>
        <li>✓ Secure and private environment</li>
      </ul>
    </section>

    <section class="testimonials-section">
      <h2>What Managers Are Saying</h2>
      <blockquote>
        "Bina gave me clarity and confidence in tough management situations.
        Now, instead of feeling overwhelmed, I feel focused and in control."
      </blockquote>
      <blockquote>
        "Working with Bina has made me a calmer, more effective leader. It's
        exactly what I needed."
      </blockquote>
    </section>

    <footer class="footer-cta">
      <router-link to="/chat">
        <button class="cta-btn">Start Now</button>
      </router-link>
    </footer>
  </div>
</template>

<script setup>
// כרגע אין צורך בלוגיקת JS מיוחדת בדף הזה
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap");

.landing-container {
  font-family: "Playfair Display", serif;
  color: #ffffff;
  background-color: #183c56; /* הכחול של הרקע בלוגו */
  text-align: center;
  padding: 40px;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.cta-btn {
  background-color: #e3cfa8; /* צבע זהב מהלוגו */
  color: #183c56;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
}

.about-section,
.process-section,
.benefits-section,
.testimonials-section {
  margin: 50px auto;
  max-width: 800px;
}

.steps {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.step {
  width: 200px;
}

.step-number {
  color: #e3cfa8;
  font-size: 2rem;
  font-weight: bold;
}

.benefits-list {
  list-style-type: none;
  padding: 0;
  font-size: 1.2rem;
}

.testimonials-section blockquote {
  background: rgba(255, 255, 255, 0.1);
  border-left: 4px solid #e3cfa8;
  margin: 20px auto;
  padding: 20px;
  max-width: 700px;
  font-style: italic;
}

.footer-cta {
  margin-top: 60px;
}
</style>
