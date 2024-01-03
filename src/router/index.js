import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Tables from "../views/Tables.vue";
import Billing from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import MonitorQueue from "../views/MonitorQueue.vue";
import Signin from "../views/Signin.vue";
import ControlQueue from "../views/ControlQueue.vue";
import Join from "../views/Join.vue";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/signin",
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/join",
    name: "Join Queue",
    component: Join,
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
    path: "/billing",
    name: "Billing",
    component: Billing,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,
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
