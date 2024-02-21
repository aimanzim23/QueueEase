import { auth, db } from "@/main";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import router from "@/router";

const state = {
  user: null,
  authIsReady: false,
  isLoggedIn: false,
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
};

const actions = {
  async signup(
    { commit },
    { email, password, firstName, lastName, companyName }
  ) {
    // Create user with email and password
    const authResult = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = authResult.user;

    // Store additional user information in Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName,
      lastName: lastName,
      companyName: companyName,
      email: email,
    });

    // Commit the user to the Vuex store
    commit("setUser", user);

    return user;
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
      await signOut(auth);

      commit("clearUserData");

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
