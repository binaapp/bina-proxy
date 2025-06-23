<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-section">
        <div class="footer-title">Bina</div>
        <div class="footer-description">
          AI-powered coaching for professionals who want to grow from the inside
          out.<br />
          Private. Insightful. Always available.
        </div>
      </div>
      <div class="footer-section">
        <a href="/chat" class="footer-link">Start a Session</a><br />
        <a href="/#faq" class="footer-link">FAQs</a><br />
        <a href="/#vision" class="footer-link">Vision & Mission</a><br />
        <a href="/#team" class="footer-link">Meet the Founders</a><br />
        <a href="/contact" class="footer-link">Contact Us</a><br />
        <a href="/privacy" class="footer-link">Privacy Policy</a>
      </div>
      <div class="footer-section">
        <div>
          Email:
          <a href="mailto:bina@binaapp.com" class="footer-link"
            >bina@binaapp.com</a
          >
        </div>
        <div>
          Follow us on
          <a
            href="https://www.facebook.com/BinaCoach"
            target="_blank"
            class="footer-link"
            >Facebook</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #234259;
  color: #fff;
  padding: 40px 0 20px 0;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
}
.footer-inner {
  display: flex;
  justify-content: space-between;
  width: 70vw;
  min-width: 600px;
  max-width: 1100px;
  margin-left: 11%;
  padding-right: 11%;
}
.footer-section {
  flex: 1 1 0;
  min-width: 180px;
  max-width: 350px;
  text-align: left;
}
.footer-title {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 10px;
}
.footer-link {
  color: #fff;
  text-decoration: underline;
  cursor: pointer;
}
.footer-link:hover {
  color: #b3e0ff;
}
.footer-description {
  max-width: 75%;
  margin-right: auto;
}
@media (max-width: 900px) {
  .footer-inner {
    flex-direction: column;
    width: 100vw;
    min-width: 0;
    max-width: 100vw;
    margin-left: 0;
    padding: 0 16px;
  }
  .footer-section {
    margin-bottom: 20px;
    max-width: none;
  }
}
</style>
