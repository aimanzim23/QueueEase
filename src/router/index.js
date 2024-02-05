import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Tables from "../views/Tables.vue";
import QR from "../views/QR.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import MonitorQueue from "../views/MonitorQueue.vue";
import Signin from "../views/Signin.vue";
import ControlQueue from "../views/ControlQueue.vue";
import Join from "../views/Join.vue";
import QueueTicket from "../views/QueueTicket.vue";
import LiveQueue from "../views/LiveQueue.vue";
import announcement from "../views/Announcement.vue";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/dashboard-default",
  },
  {
    path: "/join/:userId/:queueId",
    name: "Join Queue",
    component: Join,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/queue-ticket/:userId/:queueId",
    name: "QueueTicket",
    component: QueueTicket,
    props: true,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/live-queue",
    name: "Live Queue",
    component: LiveQueue,
    props: true,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/dashboard-default",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/monitorqueue",
    name: "MonitorQueue",
    component: MonitorQueue,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/qr",
    name: "QR Code",
    component: QR,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/announcement",
    name: "Announcement",
    component: announcement,
    meta: {
      authRequired: true,
    },
  },

  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/controlqueue",
    name: "ControlQueue",
    component: ControlQueue,
    meta: {
      authRequired: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;
