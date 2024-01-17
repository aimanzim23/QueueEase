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
  isLoggedIn: false,
  // other auth-related state properties
};

const mutations = {
  setLoggedIn(state, payload) {
    state.isLoggedIn = payload;
  },
  setUser(state, payload) {
    state.user = payload;
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
  async signin({ commit }, { email, password }) {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      // Wait for the authentication state to change
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        commit("setUser", user);
        commit("setLoggedIn", true);
        console.log("Signin action executed");
        unsubscribe(); // Unsubscribe after updating the user information
      });

      return res.user;
    } catch (error) {
      console.error("Login failed:", error);
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
      console.log("Auth state changed. User:", user);
      commit("setAuthIsReady", true);

      if (user) {
        commit("setUser", user);
        console.log("User authenticated. Redirecting to dashboard...");
        router.push("/dashboard-default");
      } else {
        // Set the user to a default value when not authenticated
        const defaultUser = { email: null };
        commit("setUser", defaultUser);
        console.log("User not authenticated. Redirecting to signin...");
        router.push("/signin");
      }

      unsub();
    });
  },
};

const getters = {
  getUser: (state) => state.user,
  isLoggedIn: (state) => state.isLoggedIn,
};

export default {
  state,
  mutations,
  actions,
  getters,
};
