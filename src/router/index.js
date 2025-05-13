import { createRouter, createWebHistory } from "vue-router";
import ChatView from "../views/ChatView.vue";
import LandingPage from "../components/LandingPage.vue";
import ContactUs from "../components/ContactUs.vue";

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
    {
      path: "/contact",
      name: "contact",
      component: ContactUs,
    },
  ],
});

export default router;
