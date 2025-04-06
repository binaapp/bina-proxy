import { createRouter, createWebHistory } from "vue-router";
import ChatView from "../views/ChatView.vue";
import LandingPage from "../components/LandingPage.vue";

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    {
      path: "/",
      name: "landing",
      component: LandingPage,
    },
    {
      path: "/chat",
      name: "chat",
      component: ChatView,
    },
  ],
});

export default router;
