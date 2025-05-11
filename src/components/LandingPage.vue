<template>
  <div class="landing-page">
    <header class="chat-header">
      <button
        class="hamburger"
        @click="menuOpen = !menuOpen"
        aria-label="Open menu"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
      <router-link
        to="/"
        class="logo-link"
        aria-label="Go to home"
        @click.prevent="handleLogoClick"
      >
        <img src="/bina-logo.png" alt="Bina Logo" />
      </router-link>
      <nav v-if="menuOpen" class="hamburger-menu">
        <button
          class="close-menu"
          @click="menuOpen = false"
          aria-label="Close menu"
        >
          &times;
        </button>
        <a href="#how-it-works" @click="menuOpen = false">How Bina works</a>
        <a href="#testimonials" @click="menuOpen = false">Testimonials</a>
        <a href="#why" @click="menuOpen = false">Why It Works</a>
        <a href="#faq" @click="menuOpen = false">FAQ's</a>
        <a href="#vision" @click="menuOpen = false">Our Vision</a>
        <router-link to="/chat" class="menu-action" @click="menuOpen = false">
          <button class="menu-action-btn">Try it Free</button>
        </router-link>
      </nav>
    </header>

    <div class="content">
      <h1 class="main-heading">
        <span v-html="displayedText"></span>
      </h1>

      <p class="subtitle">
        I'm here to help you navigate your professional challenges.
      </p>

      <h2 class="secondary-heading">
        In our private conversations, you'll gain clarity, reconnect with your
        confidence, and map out simple steps you can trust that move you toward
        what matters most.
      </h2>

      <p class="cta-text">
        Ready to take the first step?<br />
        Start your free session.
      </p>

      <div class="start-button-container-left">
        <router-link to="/chat">
          <button class="start-button">START NOW</button>
        </router-link>
      </div>
    </div>

    <div id="how-it-works" class="how-it-works">
      <h2 class="section-title mobile-center">How it works</h2>

      <h3 class="section-subtitle mobile-container">
        <span class="highlight">Bina</span> guides you through real
        conversations that create growth.
      </h3>

      <div class="steps-container mobile-stack mobile-container">
        <div class="step mobile-center-block">
          <div
            class="step-number circle-fix"
            style="aspect-ratio: 1; border-radius: 50%; overflow: hidden"
          >
            1
          </div>
          <h4 class="step-title">Start with a real moment</h4>
          <p class="step-description">
            Tell <span class="highlight">Bina</span> what's on your mind. A
            challenge, a doubt, a conversation you're dreading. Start wherever
            you are.
          </p>
        </div>

        <div class="step mobile-center-block">
          <div
            class="step-number"
            style="aspect-ratio: 1; border-radius: 50%; overflow: hidden"
          >
            2
          </div>
          <h4 class="step-title">See things clearly</h4>
          <p class="step-description">
            <span class="highlight">Bina</span> helps you pause, reflect, and
            see what really matters, so your next move feels grounded and clear.
          </p>
        </div>

        <div class="step mobile-center-block">
          <div
            class="step-number"
            style="aspect-ratio: 1; border-radius: 50%; overflow: hidden"
          >
            3
          </div>
          <h4 class="step-title">Turn clarity into action</h4>
          <p class="step-description">
            You walk away knowing what to do next and it feels like the right
            move for you.
          </p>
        </div>
      </div>
      <div class="start-button-container">
        <router-link to="/chat">
          <button class="start-button">START NOW</button>
        </router-link>
      </div>
    </div>

    <!--
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
      <div class="start-button-container">
        <router-link to="/chat">
          <button class="start-button">START NOW</button>
        </router-link>
      </div>
    </div>
    -->
    <div id="testimonials" class="testimonials">
      <h2 class="testimonials-title">What people are saying</h2>

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
      <div class="start-button-container">
        <router-link to="/chat">
          <button class="start-button">START NOW</button>
        </router-link>
      </div>
    </div>

    <div id="why" class="why-it-works">
      <h2 class="why-title">Why it works</h2>

      <div class="why-intro">
        <p>
          Most tools offer answers.
          <span class="highlight">Bina</span> helps you find your own.
        </p>
      </div>

      <div class="features-container">
        <div class="feature">
          <div class="feature-icon">
            <img
              src="/whyitworks1.jpg"
              width="48"
              height="48"
              alt="Why it works icon"
              style="display: block"
            />
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
            <img
              src="/Clock.gif"
              width="48"
              height="48"
              autoplay
              loop
              muted
              playsinline
              style="display: block"
            />
          </div>
          <h3 class="feature-title">It meets you in real time</h3>
          <p class="feature-description">
            No scheduling. No waiting. <span class="highlight">Bina</span> is
            there when you need to reset your thinking or steady your emotions.
          </p>
        </div>

        <div class="feature">
          <div class="feature-icon">
            <img
              src="/whyitworks3.jpg"
              width="48"
              height="48"
              alt="Safe to be honest icon"
              style="display: block"
            />
          </div>
          <h3 class="feature-title">It's safe to be honest</h3>
          <p class="feature-description">
            You don't have to impress or explain yourself.
            <span class="highlight">Bina</span> gives you a private space to
            reflect, feel, and figure things out, your way.
          </p>
        </div>
      </div>
      <!-- <div class="why-footer">
        <p>
          And the more you use it, the better it understands what drives you,
          challenges you, and helps you thrive.
        </p>
      </div>
      -->
      <div class="start-button-container">
        <router-link to="/chat">
          <button class="start-button">START NOW</button>
        </router-link>
      </div>
    </div>

    <div id="faq" class="faq">
      <div class="faq-container">
        <h2 class="faq-title">FAQ</h2>
        <div class="faq-item">
          <h3 class="faq-question">Is this like ChatGPT?</h3>
          <p class="faq-answer">
            No. <span class="highlight">Bina</span> was built specifically to
            coach — not just chat. It's based on proven coaching methods, not
            just clever conversation.
          </p>
        </div>

        <div class="faq-item">
          <h3 class="faq-question">Do I have to share personal info?</h3>
          <p class="faq-answer">
            No. You control what you share and when. The space is private, safe,
            and yours.
          </p>
        </div>

        <div class="faq-item">
          <h3 class="faq-question">What if I don't know what I want?</h3>
          <p class="faq-answer">
            That's exactly why <span class="highlight">Bina</span> exists. You
            don't need to have it figured out.
            <span class="highlight">Bina</span> helps you get clarity, step by
            step.
          </p>
        </div>

        <div class="faq-item">
          <h3 class="faq-question">How much does it cost?</h3>
          <p class="faq-answer">
            Right now, it's free. You're experiencing an early version of
            <span class="highlight">Bina</span> — and your feedback helps us
            grow.
          </p>
        </div>

        <div class="start-button-container-left">
          <router-link to="/chat">
            <button class="start-button">START NOW</button>
          </router-link>
        </div>
      </div>
    </div>

    <!--   <div class="team">
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
              Thirteen years ago, Chen founded Yummi—a marketplace connecting
              home cooks with families across Israel. As a solo founder, she
              built the company from the ground up, driven by a deep belief in
              the power of real connection. Over the years, she discovered
              something unexpected: the biggest factor in Yummi's success was
              her own inner state. This insight sparked a personal journey into
              coaching, emotional clarity, and self-leadership. Today, as the
              founder of Bina, she's on a mission to help others find that same
              clarity—using the most powerful tool she's encountered: AI.
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
              Neta Geva combines analytical thinking with deep human insight.
              With a background in philosophy and physics, and over 8 years in
              human resources, she offers a unique perspective on leadership and
              organizational growth. As an HR executive at Lightricks, she
              scaled the company from 70 to 600 employees, led a 30-person
              department, and was part of the executive leadership team.
              Currently, she consults for early-stage startups, helping build
              scalable, people-centered foundations. As a co-founder, she's
              passionate about leveraging AI to deepen self-awareness and human
              connection.
            </p>
          </div>
        </div>
      </div>
    </div>
    -->

    <div id="vision" class="vision-section">
      <div class="vision-container">
        <h2 class="vision-title">Our Vision</h2>
        <div class="vision-content">
          <div class="section-1">
            <p class="vision-text">
              We believe in a world where professionals go to work feeling
              confident, clear, and connected — to themselves, to their purpose,
              and to their power.<br />
              Ensuring a workplace where people grow, contribute meaningfully,
              and feel seen for who they are.
            </p>
          </div>
          <h2 class="mission-title">Our Mission</h2>
          <div class="mission-content">
            <p class="mission-highlight">
              Through AI-powered conversations grounded in real coaching
              methods, we help you reconnect with yourself, build emotional
              strength, and lead your professional journey with clarity and
              courage.
            </p>
            <div class="start-button-container-left">
              <router-link to="/chat">
                <button class="start-button">START NOW</button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ready-section">
      <div class="ready-container">
        <h2 class="ready-title">READY TO TRY IT?</h2>

        <div class="ready-content">
          <h3 class="ready-heading">
            <span class="highlight">Bina</span> is here when you're ready.<br />
            No scheduling, no judgment, no pressure.
          </h3>

          <h4 class="ready-cta">
            Start your first session now.<br />
            It's free, it's private, and it just might change the way you show
            up at work, with more clarity, confidence, and purpose.
          </h4>

          <div class="start-button-container-left">
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
/* Base Layout */

h1 {
  margin-block-end: 0;
}
.landing-page {
  min-height: 100vh;
  background-color: var(--color-primary);
  display: flex;
  flex-direction: column;
  color: var(--color-text-light);
  font-family: var(--font-family-primary);
  position: relative;
  /*overflow: hidden;*/
  width: 100%;
  box-sizing: border-box;
}

.chat-header {
  padding: 1rem;
  background: var(--color-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 72px;
  outline: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chat-header img {
  height: 50px;
  width: auto;
  max-width: 250px;
  object-fit: contain;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.content {
  flex: 1;
  max-width: var(--max-content-width, 1200px);
  width: 80%;
  margin: 0 auto;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
  padding-bottom: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  box-sizing: border-box;
}

/* Headers and Text */
.title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
  /*margin-bottom: var(--spacing-xl);*/
  line-height: 1.5;
}

.secondary-heading {
  font-size: var(--font-size-lg);
  font-weight: 450;
  /*margin-bottom: 24px;*/
  color: #c4a27e;
}

.cta-text {
  font-size: var(--font-size-lg);
  color: #f0f0f0;
}

/* Buttons */
.start-button-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.start-button-container-left {
  width: 100%;
  display: flex;
  justify-content: left;
}

.start-button {
  background-color: var(--color-secondary);
  color: var(--color-primary);
  /* padding: var(--spacing-sm) var(--spacing-lg);*/
  padding-bottom: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  padding-left: var(--spacing-xl);
  padding-right: var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: 700;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  box-shadow: 0 6px 12px var(--color-shadow);
  transition: all var(--transition-fast);
  margin-top: var(--spacing-md);
}

.start-button:hover {
  background-color: #d4b494; /* Consider adding var(--color-secondary-light) */
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); /* lifted & deeper */
}

.start-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2); /* pressed down */
}

/* Sections */

.main-heading {
  font-size: var(--font-size-xxxl);
  font-family: var(--font-family-heading);
  margin-block-end: 0;
  /*font-size: var(--font-size-xxxl);*/
  color: var(--color-secondary);
  /*margin-bottom: var(--spacing-lg);*/
  line-height: 1.2;
  font-weight: 600;
}
.how-it-works {
  background-color: var(--color-background);
  /*padding: var(--spacing-xl) var(--spacing-md);*/
  padding-bottom: var(--spacing-md);
  width: 100%;
}

.section-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);

  color: var(--color-primary);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.section-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  text-align: center;
  max-width: var(--content-width);
  margin: 0 auto var(--spacing-xl);
  line-height: 1.4;
}

.highlight {
  color: var(--color-secondary);
}

/* Steps Section */
.steps-container {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  /*gap: var(--spacing-xl);*/
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
  border: 7px solid var(--color-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xxl);
  color: var(--color-primary);
  font-family: var(--font-family-heading);
  box-sizing: border-box;
}

.step-title {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  width: 100%;
  text-align: center;
}

.step-description {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  line-height: 1.6;
  text-align: center;
  max-width: 320px;
  margin: 0 auto;
  margin-bottom: var(--spacing-md);
}

/* Workplace Section */
.workplace-reality {
  background-color: var(--color-primary);
  padding: var(--spacing-xl) var(--spacing-md);
  width: 100%;
  color: var(--color-text-light);
}

.workplace-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  color: var(--color-secondary);
  max-width: var(--content-width);
  margin: 0 auto var(--spacing-lg);
  line-height: 1.2;
  text-align: left;
}

.workplace-content {
  max-width: var(--content-width);
  margin: 0 auto;
  text-align: left;
}

.workplace-content > div {
  margin-bottom: var(--spacing-lg);
}

.workplace-content > div:last-child {
  margin-bottom: 0;
}

.workplace-text {
  font-size: var(--font-size-lg);
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-light);
}

.workplace-highlight {
  font-size: var(--font-size-lg);
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
  color: var(--color-secondary);
  font-weight: 400;
}

/* Why it Works Section */
.why-it-works {
  background-color: #f5ece3; /* Consider adding var(--color-background-alt) */
  /*padding: var(--spacing-md) var(--spacing-md);*/
  padding-bottom: var(--spacing-md);
  width: 100%;
  align-items: center;
}

.why-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  color: var(--color-primary);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.why-intro {
  max-width: var(--content-width);
  margin: 0 auto var(--spacing-md);
  text-align: center;
  font-size: var(--font-size-lg);
  line-height: 1.4;
  color: var(--color-primary);
}

.features-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto var(--spacing-md);
  /*gap: var(--spacing-xl);*/
}

.feature {
  flex: 1;
  max-width: 320px;
}

.feature-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.feature-title {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.feature-description {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  line-height: 1.5;
}

/* Testimonials Section */
.testimonials {
  background-color: var(--color-primary);
  /*padding: var(--spacing-md) var(--spacing-md);*/
  padding-bottom: var(--spacing-md);
  width: 100%;
}

.testimonials-container {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
}

.testimonials-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  color: var(--color-secondary);
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.testimonial {
  flex: 1;
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  position: relative;
  max-width: 360px;
  box-shadow: 0 4px 8px var(--color-shadow);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.quote-mark {
  font-size: 3rem;
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  color: var(--color-secondary);
  font-family: var(--font-family-heading);
}

.quote-text {
  position: relative;
  font-size: var(--font-size-md);
  line-height: 1.6;
  color: var(--color-text-dark);
  margin: var(--spacing-md) 0;
  padding-left: var(--spacing-md);
  font-style: italic;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
}

.profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: 0;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-circular);
  object-fit: cover;
}

.profile-name {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-dark);
}

.profile-role {
  font-size: var(--font-size-xs);
  color: var(--color-text-dark);
  opacity: 0.7;
}

/* FAQ Section */
.faq {
  background-color: var(--color-background);
  padding: var(--spacing-md) var(--spacing-md);
  width: 100%;
}

.faq-container {
  max-width: var(--max-content-width, 1200px);
  width: 80%;
  align-items: flex-start;
  margin: 0 auto;
  text-align: left;
}

.faq-title {
  /* margin-bottom: var(--spacing-md);*/
  color: var(--color-primary);
}

.faq-question {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  font-weight: 600;
}

.faq-answer {
  font-size: var(--font-size-md);
  line-height: 1.6;
  color: var(--color-primary);
}

/* Team Section */
.team {
  background-color: var(--color-primary);
  padding: var(--spacing-xl) var(--spacing-md);
  width: 100%;
  color: var(--color-text-light);
}

.team-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  color: var(--color-secondary);
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.team-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.team-description {
  max-width: var(--content-width);
  margin: 0 auto var(--spacing-xl);
  text-align: center;
  font-size: var(--font-size-md);
  line-height: 1.6;
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
  color: #c4a27e;
  font-style: normal;
}

.team-members {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
  justify-content: center;
  max-width: var(--content-width);
  margin-left: auto;
  margin-right: auto;
}

.team-member {
  flex: 1;
  text-align: center;
}

.member-img {
  width: 180px;
  height: 180px;
  border-radius: var(--border-radius-circular);
  object-fit: cover;
  margin-bottom: var(--spacing-md);
}

.member-name {
  font-size: var(--font-size-lg);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
}

.member-bio {
  font-size: var(--font-size-sm);
  line-height: 1.6;
  max-width: 320px;
  margin: 0 auto;
}
/* Vision Section */
.vision-section {
  background-color: var(--color-primary);
  padding: var(--spacing-md) var(--spacing-md);
  width: 100%;
}

.vision-container {
  max-width: var(--max-content-width, 1200px);
  width: 80%;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
.vision,
.mission-content {
  max-width: 100%;
  /*margin: 0 auto 48px auto;*/
  /*padding: 32px 16px;*/
  text-align: left;
  font-size: var(--font-size-md);
}

.vision-title,
.mission-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  font-weight: 700;
  margin-bottom: 32px;
  color: var(--color-secondary);
  text-align: left;
}

.vision-text,
.mission-highlight {
  font-size: var(--font-size-lg);
  line-height: 1.4;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-light);
  text-align: left;
  max-width: 100%;
  margin-left: 0;
  margin-right: 0;
}

.start-button-container {
  display: flex;
  justify-content: center;
  /*margin-top: 32px;*/
}
/* Ready Section */
.ready-section {
  background-color: var(--color-background);
  padding: var(--spacing-xl) var(--spacing-md);
  width: 100%;
}

.ready-container {
  max-width: var(--max-content-width, 1200px);
  width: 80%;
  margin: 0 auto;
  text-align: left;
}

.ready-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xxl);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-md);
}

.ready-heading {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  font-weight: 450;
  line-height: 1.3;
}

.ready-cta {
  font-size: var(--font-size-lg);
  line-height: 1.6;
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  font-weight: 450;
  line-height: 1.3;
}

.ready-description {
  font-size: var(--font-size-md);
  line-height: 1.6;
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
}

/* Modified mobile styles */
@media (max-width: var(--breakpoint-tablet)) {
  body,
  .landing-page {
    font-size: var(--font-size-sm);
  }
  /* General mobile styles */
  .how-it-works {
    padding-left: 0;
    padding-right: 0;
  }

  .section-subtitle {
    font-size: var(--font-size-md);
    text-align: left;
  }

  /* Steps section */
  .steps-container {
    gap: var(--mobile-element-spacing);
  }

  .step {
    margin-bottom: var(--mobile-element-spacing);
    width: 100%;
    padding: 0 var(--mobile-container-padding);
  }

  .step-number {
    width: 60px;
    height: 60px;
    border-width: 5px;
    font-size: var(--font-size-xl);
    margin: 0 auto var(--spacing-sm);
  }

  .step-title {
    font-size: var(--font-size-md);
    margin-bottom: var(--spacing-sm);
    width: auto;
  }

  .step-description {
    font-size: var(--font-size-sm);
    max-width: none;
    width: 100%;
  }

  .title {
    font-size: var(--font-size-xl);
    /*text-align: center;*/
  }

  .subtitle {
    font-size: var(--font-size-md);
    /*text-align: center;*/
  }

  /* .secondary-heading {
    text-align: center;
  }

  .cta-text {
    text-align: center;
  } */

  .workplace-title {
    font-size: var(--font-size-xl);
    padding: 0 var(--spacing-xs);
    margin: 0 auto var(--spacing-md);
    width: var(--mobile-content-width);
    text-align: center;
  }

  .workplace-content {
    /*text-align: center;*/
    padding: 0 var(--spacing-sm);
  }

  .workplace-text,
  .workplace-highlight {
    font-size: var(--font-size-md);
    /*text-align: center;*/
  }

  .why-title {
    font-size: var(--font-size-xl);
    padding: 0 var(--spacing-sm);
  }

  .why-intro {
    font-size: var(--font-size-md);
    padding: 0 var(--spacing-sm);
  }

  .features-container {
    flex-direction: column;
    width: var(--mobile-content-width);
    gap: var(--spacing-lg);
    /*align-items: center;*/
  }

  .feature {
    width: 100%;
    max-width: var(--mobile-element-max-width);
    margin: 0 auto var(--spacing-md);
    /*text-align: center;*/
  }

  .feature-icon {
    /*text-align: center;*/
    display: flex;
    justify-content: center;
    padding-bottom: var(--spacing-md);
    padding-top: var(--spacing-xl);
  }

  .faq-title {
    font-size: var(--font-size-xl);
    color: var(--color-primary) !important;
  }

  .faq-container {
    padding: 0 var(--spacing-sm);
  }

  .faq-question {
    font-size: var(--font-size-md);
  }

  .faq-answer {
    font-size: var(--font-size-sm);
  }

  .team-members {
    flex-direction: column;
    width: var(--mobile-content-width);
    margin: var(--spacing-md) auto 0;
    gap: var(--spacing-lg);
    /*align-items: center;*/
  }

  .team-member {
    width: 100%;
    max-width: var(--mobile-element-max-width);
    margin: 0 auto var(--spacing-lg);
  }

  .team-title,
  .team-subtitle {
    font-size: var(--font-size-xl);
  }

  .team-description,
  .team-story {
    font-size: var(--font-size-md);
    padding: 0 var(--spacing-sm);
  }

  .ready-title {
    font-size: var(--font-size-xl);
    /*text-align: center;*/
  }

  .ready-heading {
    font-size: var(--font-size-lg);
    /*text-align: center;*/
    padding: 0 var(--spacing-sm);
  }

  .ready-cta {
    font-size: var(--font-size-md);
    /*text-align: center;*/
    padding: 0 var(--spacing-sm);
  }

  /*  .ready-description {
    text-align: center;
  }*/

  .ready-section .start-button {
    margin: var(--spacing-md) auto;
    display: block;
  }
}

/* Add this at the end of your styles */
@media (max-width: 768px) {
  .circle-fix {
    width: 60px !important;
    height: 60px !important;
    min-width: 60px !important;
    min-height: 60px !important;
    max-width: 60px !important;
    max-height: 60px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    padding: 0 !important;
    margin: 0 auto !important;
    overflow: hidden !important;
  }
  .testimonials-container {
    max-width: 100%;
    width: 100%;
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
    margin: 0;
    box-sizing: border-box;
  }
  .testimonial {
    max-width: 100%;
    width: 100%;
    margin: 0 0 var(--spacing-md) 0;
    box-sizing: border-box;
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }

  .vision-container {
    width: 100% !important;
  }

  .main-heading {
    font-family: var(--font-family-heading);
    margin-block-end: 0;
    /*font-size: var(--font-size-xxxl);*/
    font-size: 10vw;
    color: var(--color-secondary);
    /*margin-bottom: var(--spacing-lg);*/
    line-height: 1.2;
    font-weight: 600;
  }

  .content {
    width: 100%;
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
    box-sizing: border-box;
  }

  .hamburger {
    left: 1rem !important;
  }

  .content,
  .vision-container,
  .ready-container,
  .faq-container {
    width: 100% !important;
    max-width: 600px; /* adjust as needed for your design */
    margin: 0 auto;
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
    box-sizing: border-box;
  }

  .logo-link {
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    height: 100%;
    display: flex;
    align-items: center;
    z-index: 5;
    display: contents !important;
  }

  .chat-header {
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }
}

a,
a:visited,
a:active {
  text-decoration: none !important;
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 20;
  margin-left: 0;
  position: absolute;
  left: calc((100vw - 80vw) / 2 + var(--spacing-md));

  /*left: 1rem;*/
}
.hamburger .bar {
  display: block;
  height: 4px;
  width: 100%;
  background: #fff !important;
  margin: 4px 0;
  border-radius: 2px;
  transition: 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}
.hamburger-menu {
  position: absolute;
  top: 72px; /* match header height */
  left: 1rem;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-width: 150px;
  z-index: 15;
  max-width: calc(100vw - 2rem);
  box-sizing: border-box;
  overflow-x: auto;
}
.hamburger-menu a {
  padding: 1rem;
  color: var(--color-primary);
  text-decoration: none;
  border-bottom: 1px solid #eee;
  font-weight: 400;
  font-family: inherit;
  letter-spacing: 0.01em;
}
.hamburger-menu a:last-child {
  border-bottom: none;
}

.close-menu {
  background: none;
  border: none;
  color: #333;
  font-size: 2rem;
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  cursor: pointer;
  z-index: 100;
}

.menu-action {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  text-decoration: none;
}

.menu-action-btn {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-primary, #18364a);
  background: #fff;
  border: 2px solid var(--color-primary, #18364a);
  border-radius: 8px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.menu-action-btn:hover {
  background: var(--color-primary, #18364a);
  color: #fff;
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
</style>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const fullText = "Hi, I'm Bina.\nYour AI-powered coach.";
const displayedText = ref("");
const typingSpeed = 60; // ms per character
const menuOpen = ref(false);

const route = useRoute();
const router = useRouter();

onMounted(() => {
  let i = 0;
  function type() {
    if (i < fullText.length) {
      displayedText.value += fullText[i] === "\n" ? "<br />" : fullText[i];
      i++;
      setTimeout(type, typingSpeed);
    }
  }
  type();
});

function handleLogoClick() {
  if (route.path === "/") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    router.push("/");
  }
}
</script>
