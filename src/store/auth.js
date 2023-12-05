import { auth } from "@/main";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import router from "@/router";

const state = {
  user: null,
  authIsReady: false,
  // other auth-related state properties
};

const mutations = {
  setUser(state, payload) {
    state.user = payload;
    console.log("user state changed:", state.user);
  },
  setAuthIsReady(state, payload) {
    state.authIsReady = payload;
  },
  clearUserData(state) {
    state.user = null;
  },
  // other mutations related to auth
};

const actions = {
  async signup(context, { email, password }) {
    console.log("signup action");
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      context.commit("setUser", res.user);
    } catch (error) {
      throw new Error("The signup was unsuccessful");
    }
  },
  async signin(context, { email, password }) {
    console.log("login action");
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      context.commit("setUser", res.user);
      return res.user; // Return the user for verification in the component
    } catch (error) {
      throw new Error("The login was unsuccessful");
    }
  },
  async logout({ commit }) {
    try {
      // Perform the logout operation from Firebase
      await signOut(auth);

      // Reset user-related data in your Vuex store
      commit("clearUserData"); // Adjust this mutation to clear user-specific data

      // Redirect the user to the signin page or any other relevant page
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      throw new Error("Logout failed");
    }
  },
  async initializeAuth({ commit }) {
    const unsub = onAuthStateChanged(auth, (user) => {
      commit("setAuthIsReady", true);
      commit("setUser", user);
      if (!user) {
        console.log("User not authenticated. Redirecting to signin...");
        router.push("/signin"); // Redirect to signin if the user is not logged in
      } else {
        console.log("User authenticated. Redirecting to dashboard...");
        router.push("/dashboard-default"); // Redirect to dashboard if the user is logged in
      }

      unsub();
    });
  },
};

const getters = {
  getUser: (state) => state.user,
  // other auth-related getters
};

export default {
  state,
  mutations,
  actions,
  getters,
};
