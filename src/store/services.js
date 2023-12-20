// store/services.js

import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "@/main";

const state = {
  services: [],
  // other service-related state properties
};

const mutations = {
  setServices(state, services) {
    state.services = services;
  },
  addService(state, newService) {
    state.services.push(newService);
  },
  // other mutations related to services
};

const actions = {
  async addNewService({ commit }, serviceData) {
    try {
      const user = auth.currentUser;
      if (user) {
        const servicesCollectionRef = collection(
          db,
          "users",
          user.uid,
          "services"
        );

        // Add service to Firestore
        const docRef = await addDoc(servicesCollectionRef, serviceData);

        // Get the ID of the newly added document
        const newService = {
          id: docRef.id,
          ...serviceData,
        };

        // Commit mutation to update Vuex store
        commit("addService", newService);

        // Handle local storage if needed
        // Example: localStorage.setItem('services', JSON.stringify(state.services));
      } else {
        console.error("User not authenticated.");
      }
    } catch (error) {
      console.error("Error adding service:", error);
      // Handle error
    }
  },
  // other actions related to services
};

const getters = {
  getServices: (state) => state.services,
  // other getters related to services
};

export default {
  state,
  mutations,
  actions,
  getters,
};
