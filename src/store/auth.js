import { auth } from "@/main";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

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
    } catch (error) {
      throw new Error("The login was unsuccessful");
    }
  },
  async logout({ commit }) {
    console.log("logout action");
    try {
      await signOut(auth);
      commit("setUser", null);
    } catch (error) {
      throw new Error("Logout failed");
    }
  },
  async initializeAuth({ commit }) {
    const unsub = onAuthStateChanged(auth, (user) => {
      commit("setAuthIsReady", true);
      commit("setUser", user);
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
