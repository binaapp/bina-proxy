<template>
  <div class="landing-page">
    <header class="chat-header">
      <img src="/bina-logo.png" alt="Bina Logo" />
    </header>

    <div class="content">
      <h1 class="main-heading">
        You don't have to figure it<br />all out alone.
      </h1>

      <p class="subtitle">
        Bina is your personal AI-powered coach. Helping you lead with<br />
        confidence, clarity, and emotional strength.
      </p>

      <h2 class="secondary-heading">Private. Empowering. Always available.</h2>

      <p class="cta-text">Try your first coaching session. It's free.</p>

      <div class="start-button-container">
        <router-link to="/chat">
          <button class="start-button">START NOW</button>
        </router-link>
      </div>
    </div>

    <div class="how-it-works">
      <h2 class="section-title">How it works</h2>

      <h3 class="section-subtitle">
        <span class="highlight">Bina</span> guides you through real
        conversations that create growth.
      </h3>

      <div class="steps-container">
        <div class="step">
          <div class="step-number">1</div>
          <h4 class="step-title">Start with a real moment</h4>
          <p class="step-description">
            Tell <span class="highlight">Bina</span> what's on your mind. A
            challenge, a doubt, a conversation you're dreading. Start wherever
            you are.
          </p>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <h4 class="step-title">See things clearly</h4>
          <p class="step-description">
            <span class="highlight">Bina</span> helps you pause, reflect, and
            see what really matters, so your next move feels grounded and clear.
          </p>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <h4 class="step-title">Turn clarity into action</h4>
          <p class="step-description">
            You walk away knowing what to do next and it feels like the right
            move for you.
          </p>
        </div>
      </div>
    </div>

    <div class="workplace-reality">
      <h2 class="workplace-title">The New Workplace Reality</h2>

      <div class="workplace-content">
        <div class="section-1">
          <p class="workplace-text">
            We're living through a massive shift.<br />
            AI is automating the tedious work — the kind of work that used to
            give you a moment to breathe, to feel useful without needing to be
            brilliant.
          </p>
        </div>

        <div class="section-2">
          <p class="workplace-highlight">
            But today, the only way to stay relevant is to be always on, always
            smart.<br />
            You're expected to lead, deliver, regulate your emotions, manage
            people, and outperform — constantly.
          </p>
          <p class="workplace-highlight">It's exhausting.</p>
        </div>

        <div class="section-3">
          <p class="workplace-text">
            And while everything around you is changing fast, the support you
            need often feels out of reach.<br />That's where
            <span class="highlight">Bina</span> comes in.
          </p>
        </div>
      </div>
    </div>

    <div class="why-it-works">
      <h2 class="why-title">Why it works</h2>

      <div class="why-intro">
        <p>
          Most tools tell you what to do.
          <span class="highlight">Bina</span> helps you understand yourself, so
          you can lead in a way that actually fits you.
        </p>
      </div>

      <div class="features-container">
        <div class="feature">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4C14.4 4 6.4 11.2 4.8 20.4C4 24.4 4.4 28.4 6 32C7.6 35.6 10 38.8 13.2 40.8C16.4 42.8 20 44 24 44C28 44 31.6 42.8 34.8 40.8C38 38.8 40.4 35.6 42 32C43.6 28.4 44 24.4 43.2 20.4C41.6 11.2 33.6 4 24 4ZM24 40C17.2 40 11.2 35.6 9.2 29.2C8.4 26.4 8.8 23.2 10 20.4C11.2 17.6 13.2 15.2 15.6 13.6C18 12 20.8 11.2 24 11.2C27.2 11.2 30 12 32.4 13.6C34.8 15.2 36.8 17.6 38 20.4C39.2 23.2 39.6 26.4 38.8 29.2C36.8 35.6 30.8 40 24 40Z"
                fill="#183C56"
              />
              <path
                d="M24 16C20 16 16.8 19.2 16.8 23.2C16.8 27.2 20 30.4 24 30.4C28 30.4 31.2 27.2 31.2 23.2C31.2 19.2 28 16 24 16Z"
                fill="#183C56"
              />
            </svg>
          </div>
          <h3 class="feature-title">It clears the mental clutter</h3>
          <p class="feature-description">
            <span class="highlight">Bina</span> helps you cut through the noise,
            understand what's really happening, and focus on what you want to do
            next.
          </p>
        </div>

        <div class="feature">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#183C56"
                stroke-width="3"
                fill="none"
              />
              <path
                d="M24 12V24L32 28"
                stroke="#183C56"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <h3 class="feature-title">It meets you in real time</h3>
          <p class="feature-description">
            No scheduling. No waiting. <span class="highlight">Bina</span> is
            there when you need to reset your thinking or steady your emotions.
          </p>
        </div>

        <div class="feature">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M40 16H8C6.9 16 6 16.9 6 18V38C6 39.1 6.9 40 8 40H40C41.1 40 42 39.1 42 38V18C42 16.9 41.1 16 40 16ZM40 38H8V18H40V38Z"
                fill="#183C56"
              />
              <path
                d="M24 8C20.7 8 18 10.7 18 14H22C22 12.9 22.9 12 24 12C25.1 12 26 12.9 26 14H30C30 10.7 27.3 8 24 8Z"
                fill="#183C56"
              />
              <path
                d="M24 22C20.7 22 18 24.7 18 28C18 31.3 20.7 34 24 34C27.3 34 30 31.3 30 28C30 24.7 27.3 22 24 22Z"
                fill="#183C56"
              />
            </svg>
          </div>
          <h3 class="feature-title">It's safe to be honest</h3>
          <p class="feature-description">
            You don't have to impress or explain yourself.
            <span class="highlight">Bina</span> gives you a private space to
            reflect, feel, and figure things out, your way.
          </p>
        </div>
      </div>

      <div class="why-footer">
        <p>
          And the more you use it, the better it understands what drives you,
          challenges you, and helps you thrive.
        </p>
      </div>
    </div>

    <div class="testimonials">
      <h2 class="testimonials-title">What manager are saying</h2>

      <div class="testimonials-container">
        <div class="testimonial">
          <div class="quote-mark">"</div>
          <p class="quote-text">
            After just one session, I felt clearer than I had in weeks. Bina
            helped me stop spiraling and focus on what I could actually do.
          </p>
          <div class="profile">
            <img
              src="/testimonial-1.jpg"
              alt="Team Lead Profile"
              class="profile-img"
            />
            <div class="profile-info">
              <span class="profile-role">TEAM LEAD, NEW YORK</span>
            </div>
          </div>
        </div>

        <div class="testimonial">
          <div class="quote-mark">"</div>
          <p class="quote-text">
            I used to feel so alone with my leadership fears. Now I open Bina
            before tough conversations, and it genuinely shifts how I show up.
          </p>
          <div class="profile">
            <img
              src="/testimonial-2.jpg"
              alt="Product Manager Profile"
              class="profile-img"
            />
            <div class="profile-info">
              <span class="profile-role">PRODUCT MANAGER, BERLIN</span>
            </div>
          </div>
        </div>

        <div class="testimonial">
          <div class="quote-mark">"</div>
          <p class="quote-text">
            It's like having a coach in your pocket — but one that doesn't
            judge, doesn't rush, and always meets you where you are.
          </p>
          <div class="profile">
            <img
              src="/testimonial-3.jpg"
              alt="Senior Developer Profile"
              class="profile-img"
            />
            <div class="profile-info">
              <span class="profile-role">SENIOR DEVELOPER, LONDON</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="faq">
      <h2 class="faq-title">FAQ</h2>

      <div class="faq-container">
        <div class="faq-item">
          <h3 class="faq-question">Is this like ChatGPT?</h3>
          No. <span class="highlight">Bina</span> was built specifically to
          coach — not just chat. It's based on proven coaching methods, not just
          clever conversation.
        </div>

        <div class="faq-item">
          <h3 class="faq-question">Do I have to share personal info?</h3>
          No. You control what you share and when. The space is private, safe,
          and yours.
        </div>

        <div class="faq-item">
          <h3 class="faq-question">What if I don't know what I want?</h3>
          That's exactly why <span class="highlight">Bina</span> exists. You
          don't need to have it figured out.
          <span class="highlight">Bina</span> helps you get clarity, step by
          step.
        </div>

        <div class="faq-item">
          <h3 class="faq-question">How much does it cost?</h3>
          Right now, it's free. You're experiencing an early version of
          <span class="highlight">Bina</span> — and your feedback helps us grow.
        </div>
      </div>
    </div>

    <div class="team">
      <h2 class="team-title">Meet the team</h2>

      <div class="team-intro">
        <h3 class="team-subtitle">The people behind Bina</h3>

        <p class="team-description">
          Real leaders, real fears, real experience —<br />
          built into a tool that actually understands you.
        </p>

        <div class="team-story">
          <p>
            We're three women from the high-tech world, and we've lived the
            pressure.
          </p>

          <p>
            Each of us climbed the ladder, led teams, made decisions that kept
            us up at night, and smiled through the moments we felt completely
            alone. We were expected to have all the answers, stay strong, and
            show up perfectly, even when we were filled with doubt.
          </p>

          <p>And we realized something. We weren't the only ones.</p>

          <p>
            We each faced the same silent questions.<br />
            <em
              >Am I doing this right? Does anyone actually see what I'm
              holding?</em
            ><br />
            We each felt the same gap between what leadership demands and the
            support that actually exists.
          </p>

          <p>
            That's why we came together to create
            <span class="highlight">Bina</span>.<br />
            Because we believe leadership shouldn't feel lonely.<br />
            Managers shouldn't have to figure it all out in the dark.<br />
            Coaching shouldn't be a luxury. It should be a tool for anyone who
            wants to grow, lead, and feel good doing it.
          </p>

          <p>
            <span class="highlight">Bina</span> is the coach we each wished we
            had.<br />
            It's built on deep reflection, real insight, and emotional clarity.
            It gives you a space to think clearly, feel supported, and act with
            confidence.
          </p>
        </div>

        <div class="team-members">
          <div class="team-member">
            <img src="/chen.jpg" alt="Chen Lev Ami" class="member-img" />
            <h4 class="member-name">Chen Lev Ami</h4>
            <p class="member-bio">
              [Chen's bio goes here — include a line about her startup
              experience, passion for building things that connect people, and
              her belief in Bina's mission.]
            </p>
          </div>

          <div class="team-member">
            <img src="/maia.jpg" alt="Maia Geberovich" class="member-img" />
            <h4 class="member-name">Maia Geberovich</h4>
            <p class="member-bio">
              Maia has led large teams and complex cross-functional projects in
              global high-tech companies for over 15 years. Today, as a
              leadership coach, she brings that real-world experience into every
              conversation, helping managers cut through noise, connect with
              their strengths, and lead from a place of self-awareness and
              impact. She's known for her deep intuition, directness, and
              ability to ask the one question that changes everything.
            </p>
          </div>

          <div class="team-member">
            <img src="/neta.jpg" alt="Neta Geva" class="member-img" />
            <h4 class="member-name">Neta Geva</h4>
            <p class="member-bio">
              [Neta's bio goes here — include a line about her HR background,
              her years at Lightricks, and how she brings the human side of
              organizations into the heart of Bina.]
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="ready-section">
      <div class="ready-container">
        <h2 class="ready-title">READY TO TRY IT?</h2>

        <div class="ready-content">
          <h3 class="ready-heading">
            Bina is here when you're ready.<br />
            No scheduling, no judgment, no pressure.
          </h3>

          <h4 class="ready-cta">
            Start your first session now.<br />
            It's free, it's private, and it just might change the way you lead.
          </h4>

          <div class="start-button-container">
            <router-link to="/chat">
              <button class="start-button">START NOW</button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  background-color: #12344d;
  display: flex;
  flex-direction: column;
  color: #f0f0f0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  position: relative;
  overflow: hidden;
}

.chat-header {
  padding: 1rem;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 72px;
  outline: 1px solid rgba(255, 255, 255, 0.2);
}

.chat-header img {
  height: 50px;
  width: auto;
  max-width: 250px;
  object-fit: contain;
}

.content {
  flex: 1;
  max-width: 840px;
  width: 100%;
  margin: 0 auto;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.main-heading {
  font-family: "Times New Roman", serif;
  font-size: 4.5rem;
  font-weight: 900;
  color: #e3cfa8;
  line-height: 1.1;
  margin-bottom: 24px;
}

.subtitle {
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.5;
  margin-bottom: 48px;
  color: #f0f0f0;
}

.secondary-heading {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #e3cfa8;
}

.cta-text {
  font-size: 1.5rem;
  margin-bottom: 32px;
  color: #f0f0f0;
}

.start-button-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.start-button {
  background-color: #e3cfa8;
  color: #183c56;
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.start-button:hover {
  background-color: #d4b494;
}

@media (max-width: 768px) {
  .content {
    padding: 60px 20px 40px;
  }

  .chat-header {
    height: 60px;
  }

  .main-heading {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.15rem;
  }

  .secondary-heading {
    font-size: 1rem;
  }

  .cta-text {
    font-size: 1rem;
  }
}

.how-it-works {
  background-color: #f5f5f5;
  padding: 80px 20px;
  width: 100%;
}

.section-title {
  font-family: "Times New Roman", serif;
  font-size: 3rem;
  color: #183c56;
  text-align: center;
  margin-bottom: 40px;
}

.section-subtitle {
  font-size: 2rem;
  color: #183c56;
  text-align: center;
  max-width: 840px;
  margin: 0 auto 60px;
  line-height: 1.4;
}

.highlight {
  color: #e3cfa8;
}

.steps-container {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 60px;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-number {
  width: 80px;
  height: 80px;
  border: 7px solid #e3cfa8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #183c56;
  margin-bottom: 32px;
  font-family: "Times New Roman", serif;
}

.step-title {
  font-size: 1.75rem;
  color: #183c56;
  margin-bottom: 24px;
  font-weight: 600;
  width: 100%;
  text-align: center;
}

.step-description {
  font-size: 1.2rem;
  color: #183c56;
  line-height: 1.6;
  text-align: center;
  max-width: 320px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .steps-container {
    flex-direction: column;
    gap: 40px;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .section-subtitle {
    font-size: 1.5rem;
  }

  .step {
    align-items: center;
    text-align: center;
  }
}

.workplace-reality {
  background-color: #183c56;
  padding: 100px 20px;
  width: 100%;
  color: #ffffff;
}

.workplace-title {
  font-family: "Times New Roman", serif;
  font-size: 3.5rem;
  color: #e3cfa8;
  max-width: 840px;
  margin: 0 auto 40px;
  line-height: 1.2;
  text-align: left;
}

.workplace-content {
  max-width: 840px;
  margin: 0 auto;
  text-align: left;
}

.workplace-content > div {
  margin-bottom: 40px;
}

.workplace-content > div:last-child {
  margin-bottom: 0;
}

.workplace-text {
  font-size: 1.5rem;
  line-height: 1.5;
  margin-bottom: 16px;
  color: #ffffff;
}

.workplace-text:last-child {
  margin-bottom: 0;
}

.workplace-highlight {
  font-size: 1.5rem;
  line-height: 1.5;
  margin-bottom: 16px;
  color: #e3cfa8;
  font-weight: 400;
}

.workplace-highlight:last-child {
  margin-bottom: 0;
}

.workplace-highlight:first-of-type {
  margin-top: 0;
}

.workplace-highlight:last-of-type {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .workplace-reality {
    padding: 60px 20px;
  }

  .workplace-title {
    font-size: 2.5rem;
  }

  .workplace-text,
  .workplace-highlight {
    font-size: 1.2rem;
  }
}

.why-it-works {
  background-color: #f5ece3;
  padding: 100px 20px;
  width: 100%;
}

.why-title {
  font-family: "Times New Roman", serif;
  font-size: 3.5rem;
  color: #183c56;
  text-align: center;
  margin-bottom: 48px;
}

.why-intro {
  max-width: 840px;
  margin: 0 auto 64px;
  text-align: center;
  font-size: 2rem;
  line-height: 1.4;
  color: #183c56;
}

.features-container {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto 64px;
  gap: 60px;
}

.feature {
  flex: 1;
  max-width: 320px;
}

.feature-icon {
  margin-bottom: 24px;
}

.feature-title {
  font-size: 1.5rem;
  color: #183c56;
  margin-bottom: 16px;
  font-weight: 600;
}

.feature-description {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #183c56;
}

.why-footer {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  font-size: 2.5rem;
  line-height: 1.3;
  color: #183c56;
  font-weight: 600;
}

.why-footer p {
  margin: 0;
  padding: 0 20px;
  max-width: none;
}

@media (max-width: 768px) {
  .why-it-works {
    padding: 60px 20px;
  }

  .why-title {
    font-size: 2.5rem;
  }

  .why-intro {
    font-size: 1.5rem;
    margin-bottom: 48px;
  }

  .features-container {
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }

  .feature {
    text-align: center;
  }

  .why-footer {
    font-size: 1.75rem;
    line-height: 1.3;
  }
}

.testimonials {
  background-color: #183c56;
  padding: 100px 20px;
  width: 100%;
}

.testimonials-title {
  font-family: "Times New Roman", serif;
  font-size: 3.5rem;
  color: #e3cfa8;
  text-align: center;
  margin-bottom: 64px;
}

.testimonials-container {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 40px;
}

.testimonial {
  flex: 1;
  background-color: white;
  border-radius: 16px;
  padding: 40px;
  position: relative;
  max-width: 360px;
}

.quote-mark {
  font-family: "Times New Roman", serif;
  font-size: 4rem;
  color: #e3cfa8;
  position: absolute;
  top: 20px;
  left: 20px;
  line-height: 1;
}

.quote-text {
  font-size: 1.25rem;
  line-height: 1.5;
  color: #183c56;
  margin-bottom: 24px;
  margin-top: 24px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-role {
  font-size: 0.875rem;
  color: #183c56;
  font-weight: 600;
}

@media (max-width: 768px) {
  .testimonials {
    padding: 60px 20px;
  }

  .testimonials-title {
    font-size: 2.5rem;
    margin-bottom: 40px;
  }

  .testimonials-container {
    flex-direction: column;
    align-items: center;
  }

  .testimonial {
    width: 100%;
  }
}

.faq {
  background-color: #f5f5f5;
  padding: 100px 20px;
  width: 100%;
}

.faq-title {
  font-family: "Times New Roman", serif;
  font-size: 3.5rem;
  color: #183c56;
  margin-bottom: 64px;
  max-width: 840px;
  margin-left: auto;
  margin-right: auto;
  text-align: left;
}

.faq-container {
  max-width: 840px;
  margin: 0 auto;
  text-align: left;
}

.faq-item {
  margin-bottom: 48px;
  font-size: 1.5rem;
  line-height: 1.5;
  color: #183c56;
}

.faq-item:last-child {
  margin-bottom: 0;
}

.faq-question {
  font-size: 1.75rem;
  color: #183c56;
  margin-bottom: 16px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .faq {
    padding: 60px 20px;
  }

  .faq-title {
    font-size: 2.5rem;
    margin-bottom: 40px;
  }

  .faq-question {
    font-size: 1.5rem;
  }
}

.team {
  background-color: #183c56;
  padding: 100px 20px;
  width: 100%;
  color: #ffffff;
}

.team-title {
  font-family: "Times New Roman", serif;
  font-size: 3.5rem;
  color: #e3cfa8;
  text-align: center;
  margin-bottom: 48px;
}

.team-intro {
  max-width: 840px;
  margin: 0 auto;
}

.team-subtitle {
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 24px;
}

.team-description {
  font-size: 1.75rem;
  line-height: 1.4;
  color: #ffffff;
  margin-bottom: 48px;
}

.team-story {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 64px;
}

.team-story p {
  margin-bottom: 24px;
}

.team-story em {
  color: #e3cfa8;
  font-style: normal;
}

.team-members {
  display: flex;
  gap: 48px;
  margin-top: 64px;
}

.team-member {
  flex: 1;
}

.member-img {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  margin-bottom: 24px;
  object-fit: cover;
}

.member-name {
  font-size: 1.5rem;
  color: #e3cfa8;
  margin-bottom: 16px;
}

.member-bio {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #ffffff;
}

@media (max-width: 768px) {
  .team {
    padding: 60px 20px;
  }

  .team-title {
    font-size: 2.5rem;
    margin-bottom: 32px;
  }

  .team-subtitle {
    font-size: 1.75rem;
  }

  .team-description {
    font-size: 1.5rem;
  }

  .team-story {
    font-size: 1.125rem;
  }

  .team-members {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 48px;
  }

  .team-member {
    max-width: 320px;
  }
}

.ready-section {
  background-color: #f5f5f5;
  padding: 100px 20px;
  width: 100%;
}

.ready-container {
  max-width: 840px;
  margin: 0 auto;
  text-align: left;
}

.ready-title {
  font-family: "Times New Roman", serif;
  font-size: 3.5rem;
  color: #183c56;
  margin-bottom: 64px;
}

.ready-content {
  text-align: left;
}

.ready-heading {
  font-size: 2.5rem;
  color: #183c56;
  margin-bottom: 16px;
}

.ready-subheading {
  font-size: 2.5rem;
  color: #183c56;
  margin-bottom: 48px;
}

.ready-cta {
  font-size: 2rem;
  color: #183c56;
  margin-bottom: 16px;
}

.ready-description {
  font-size: 2rem;
  color: #183c56;
  margin-bottom: 48px;
}

.ready-section .start-button {
  background-color: #183c56;
  color: #e3cfa8;
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.ready-section .start-button:hover {
  background-color: #12344d; /* Slightly darker blue on hover */
}

@media (max-width: 768px) {
  .ready-section {
    padding: 60px 20px;
  }

  .ready-title {
    font-size: 2.5rem;
    margin-bottom: 40px;
  }

  .ready-heading,
  .ready-subheading {
    font-size: 1.75rem;
  }

  .ready-cta,
  .ready-description {
    font-size: 1.5rem;
  }
}
</style>

<script>
export default {
  name: "LandingPage",
};
</script>
