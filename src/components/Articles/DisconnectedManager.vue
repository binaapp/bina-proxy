<template>
  <ArticleLayout
    title="You built the career you wanted. So why do you feel so disconnected?"
    :additionalArticles="otherArticles"
    buttonUrl="/chat"
  >
    <h2>When the dream job stops feeling right</h2>
    <p>
      You got the job. You have the title. You're at that glittery company. If
      you ask the people around you, you're supposed to be proud.
    </p>
    <p>
      So why does it feel like you're dragging yourself to work every morning?
      Why do you find yourself hoping meetings will get canceled? Why does
      everything suddenly annoy you, and nothing feels meaningful anymore?
    </p>
    <p>
      It started exciting but something is slowly changing, a shift in
      engagement, a somber mod, and it's becoming harder to avoid noticing. At
      first you try to shake it off, push through, tell yourself it's just a
      phase. But eventually, you can't ignore the truth. What you thought was
      the dream job, the perfect role, the goal you worked so hard to reach—just
      doesn't feel right anymore.
    </p>

    <h2>I've been there.</h2>
    <p>
      A few years ago, I was offered the opportunity to manage a larger team.
      "Maia, come do your magic with the big group," they told me. I was
      thrilled. It felt like recognition, like I was being seen and appreciated.
      I said yes with excitement and pride.
    </p>
    <p>
      But when I stepped into the new role, something was off. I wasn't the only
      one brought in. Suddenly, instead of being part of a tight leadership
      team, I was one of seven managers in a row, each holding a narrower piece
      of the puzzle. I had less ownership than before. I wasn't leading. I was
      trying to figure out how to stay relevant.
    </p>
    <p>
      For someone who thrives on responsibility, challenge, and creating impact,
      that was hard. And to stand out in this new setup, I would have had to
      start competing, fighting for space, pushing others aside. That's not me.
      I don't work like that. I help others grow. In fact, one of the managers
      on that team had been someone I myself helped promote.
    </p>
    <p>
      I tried to stay engaged. I mentored others. I supported where I could. But
      inside, I felt bored. Frustrated. Disconnected. I was still showing up,
      still doing the work, but I knew I wasn't doing what I was meant to be
      doing anymore.
    </p>

    <h2>Turning inward</h2>
    <p>
      That discomfort pushed me to look inward. I started asking myself hard
      questions. What do I actually enjoy? Where do I make the biggest
      difference? What kind of work gives me energy?
    </p>
    <p>
      The answer was obvious. What I love most is working with people. Managing,
      mentoring, coaching, helping others grow into who they are meant to be.
      That's when I made the decision to become a leadership coach and mentor.
    </p>

    <h2>Letting go of titles, reclaiming meaning</h2>
    <p>
      It wasn't easy. I had fears. I had doubts. But I also had a coach. And
      through that process, I realized something that changed everything: I
      didn't need the 'title' to feel valuable. I didn't need to keep doing what
      I already know and what I'd always done. I was allowed to want something
      else. I was allowed to grow.
    </p>
    <p>
      Coaching helped me find my voice again. It gave me clarity. It gave me the
      courage to speak up about what I really wanted, even when it was scary.
      Especially when it was scary.
    </p>

    <h2>Waking up excited again</h2>
    <p>
      Today, I wake up at five in the morning with ideas running through my
      head. I'm excited to meet the people I coach. Excited to hear their
      stories. Excited to walk with them as they figure things out and step into
      who they are becoming. The challenges haven't disappeared, but now they
      make sense to me. Now they feel like part of the path, not like something
      I have to endure just to get through the day.
    </p>
    <p>
      And now, this is the work I do with others. I coach leaders who are
      feeling stuck, disconnected, misaligned. Sometimes it's politics.
      Sometimes the culture shifts. Sometimes it's a co-founder who's impossible
      to work with. In some cases, the right move is to leave. In others, it's
      about seeing clearly, regaining focus, and learning to move through it
      with intention.
    </p>
    <p>
      And for some people, the job is still a good fit but they've stopped being
      good to themselves in the process. They've deprioritized their values,
      their energy, their joy. So we work on bringing that back.
    </p>

    <h2>You don't have to stay stuck</h2>
    <p>
      Wherever you are in your journey, here's what I want you to know: you
      don't have to stay stuck. And you don't have to figure it out alone.
    </p>

    <h2>A few questions to get you started</h2>
    <p>So let's begin here with these questions:</p>
    <ul>
      <li>When in the past week did you feel depleted or frustrated?</li>
      <li>What was happening right before that moment?</li>
      <li>What are you tolerating that no longer fits?</li>
    </ul>
    <p>
      Bring that with you. That's the beginning of your next step. Start your
      free coaching session. Just 15 minutes.
    </p>
  </ArticleLayout>
</template>

<script setup>
import { ref } from "vue";
import ArticleLayout from "../../components/ArticleLayout.vue";

// Dummy data for the "Additional Articles" sidebar
const otherArticles = ref([
  {
    title: "It's not just business when it feels personal",
    excerpt:
      "How to handle work situations that trigger a personal response and navigate them with grace.",
  },
  {
    title: "The Art of Saying No",
    excerpt:
      "Reclaim your time and energy by learning how to set boundaries without guilt.",
  },
]);
</script>
