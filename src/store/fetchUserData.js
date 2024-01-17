const state = {
  savedUserData: {}, // Initial state for saved user data
  queues: [], // Initial state for queues
};

const mutations = {
  setSavedUserData(state, userData) {
    state.savedUserData = userData;
  },
  setQueues(state, queues) {
    state.queues = queues;
  },
};

const actions = {
  async saveUserData({ commit }, userData) {
    try {
      commit("setSavedUserData", userData); // Update state with the saved user data
      localStorage.setItem("savedUserData", JSON.stringify(userData));

      // Fetch queues based on the user ID and update state
      await this.dispatch("fetchQueues", userData.userId);
    } catch (error) {
      console.error("Error saving user data:", error);
      throw new Error("Failed to save user data");
    }
  },
};

const getters = {
  getSavedUserData: (state) => state.savedUserData,
};

export default {
  state,
  mutations,
  actions,
  getters,
};
