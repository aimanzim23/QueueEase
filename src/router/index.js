import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Tables from "../views/Tables.vue";
import Billing from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import MonitorQueue from "../views/MonitorQueue.vue";
import Signin from "../views/Signin.vue";
import { auth } from "@/main";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/dashboard-default",
    meta: {
      authRequired: false,
    },
  },
  {
    path: "/dashboard-default",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      authRequired: false,
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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser;
  const requiresAuth = to.matched.some((record) => record.meta.authRequired);

  if (to.name === "Dashboard" && to.path === "/") {
    // Redirect to dashboard-default when trying to access the root path
    next({
      name: "Dashboard",
    });
  } else if (to.name === "MonitorQueue") {
    // Allow access to MonitorQueue without authentication
    next();
  } else if (requiresAuth && !currentUser) {
    // Redirect to signin if authentication is required but the user is not logged in
    alert("You must be logged in to see this page");
    next({
      name: "Signin",
    });
  } else {
    // Continue to the requested route
    next();
  }
});

export default router;
