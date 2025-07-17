import { createRouter, createWebHistory } from "vue-router";
import ChatView from "../views/ChatView.vue";
import LandingPage from "../components/LandingPage.vue";
import ContactUs from "../components/ContactUs.vue";
import LoginUI from "../components/LoginUI.vue";
import ArticleView from "../views/ArticleView.vue";
import LoginPage from "../components/LoginPage.vue";

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    {
      path: "/",
      name: "landing",
      component: LandingPage,
    },
    {
      path: "/chat/:program?",
      name: "chat",
      component: ChatView,
    },
    {
      path: "/contact",
      name: "contact",
      component: ContactUs,
    },
    {
      path: "/signup",
      name: "signup",
      component: LoginUI,
    },
    {
      path: "/login",
      name: "login",
      component: LoginPage,
    },
    {
      path: "/articles/:slug",
      name: "article",
      component: ArticleView,
    },
    {
      path: "/blog",
      name: "Blog",
      component: () => import("@/views/BlogView.vue"),
    },
  ],
});

export default router;
