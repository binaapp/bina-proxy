<template>
  <div>
    <AppHeader />
    <main class="blog-main">
      <h1 class="blog-title">Leadership Development</h1>
      <section v-for="post in posts" :key="post.id" class="blog-card">
        <h2 class="blog-card-title">{{ post.title }}</h2>
        <a :href="post.link" class="blog-date">{{ post.date }}</a>
        <div v-if="post.subtitle" class="blog-subtitle">
          <strong>{{ post.subtitle }}</strong>
        </div>
        <p class="blog-snippet" v-html="post.snippet"></p>
        <a :href="post.link" class="read-more-link">Read more</a>
      </section>
    </main>
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader.vue";

export default {
  name: "BlogView",
  components: { AppHeader },
  data() {
    return {
      posts: [
        {
          id: 1,
          title:
            "You built the career you wanted. So why do you feel so disconnected?",
          date: "MAY 22 2025",
          link: "/articles/disconnected-manager",
          subtitle: "When the dream job stops feeling right",
          snippet: `You got the job. You have the title. You're at that glittery company. If you ask the people around you, you're supposed to be proud.<br>
          So why does it feel like you're dragging yourself to work every morning? Why do you find yourself hoping meetings will get canceled? Why does everything suddenly annoy you, and nothing feels meaningful anymore?...`,
        },
        {
          id: 2,
          title: "Why Proving Yourself is the Wrong Mindset for Career Success",
          date: "JUNE 12 2025",
          link: "/articles/value-based-mindset",
          subtitle: "",
          snippet: `Have you ever felt that sinking feeling in your stomach when starting a new role, walking into a crucial meeting, or facing an interview? It's the dreadful thought, "I have to prove myself." A whisper of doubt and insecurity creeps in, instilling fear of failure.<br>
          For many years in the corporate world, I fell victim to this debilitating "prove myself" mindset. During role transitions, when inheriting a new team and many times expressing myself as the only woman in an all-male management team, the pressure to validate my worth was immense....`,
        },
        {
          id: 3,
          title: "Mastering Office Politics with Integrity",
          date: "JUNE 25 2025",
          link: "/articles/mastering-office-politics",
          subtitle: "Office Politics Are Unavoidable",
          snippet: `Over two decades of work in the corporate and high-tech industry taught me a crucial lesson about office politics that I wish someone would have thought me while I was still onboarding: Work doesn't speak for itself. In fact, work can't speak at all – only people can.<br>
          Early in my career, I clung to the belief that hard work and excellent results were enough. "I don't need politics," I'd tell myself. "My work should speak for itself." This mindset, I realized, was a holdover from my academic days...`,
        },
      ],
    };
  },
};
</script>

<style scoped>
.blog-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem 1rem;
}
.blog-title {
  text-align: center;
  font-size: var(--font-size-xxl);
  font-family: "Georgia", serif;
  font-weight: bold;
  margin-bottom: 2rem;
  color: var(--color-primary);
}
.blog-card {
  background: #f8f0e7;
  border-radius: 16px;
  box-shadow: 8px 8px 0 #e0dedb;
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  margin-bottom: 2.5rem;
}
.blog-card-title,
.blog-date,
.blog-subtitle,
.blog-snippet {
  margin-bottom: 0;
}

.blog-card > *:not(:last-child) {
  margin-bottom: 0.7rem;
}

.blog-card-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
  text-align: left;
}
.blog-date {
  display: block;
  text-align: left;
  color: #1a0dab;
  font-size: 1.1rem;
  text-decoration: underline;
  cursor: pointer;
}

.blog-date:visited {
  color: #551a8b; /* Classic visited link purple */
}

.blog-date:hover {
  color: #0056b3; /* Slightly darker blue on hover */
}
.blog-subtitle {
  font-size: var(--font-size-md);
  text-align: left;
}
.blog-snippet {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  text-align: left;
  margin-top: 0;
}
.read-more-link {
  display: inline-block;
  color: #1a0dab;
  text-decoration: underline;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  cursor: pointer;
}

.read-more-link:visited {
  color: #551a8b;
}

.read-more-link:hover {
  color: #0056b3;
}
</style>
