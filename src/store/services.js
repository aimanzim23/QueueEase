import { doc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/main";

const state = {
  availableServices: [], // Initial state for available services
};

const mutations = {
  setAvailableServices(state, services) {
    state.availableServices = services;
  },
};

const actions = {
  async fetchServices({ commit }) {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const servicesCollectionRef = collection(userDocRef, "services");

      try {
        const querySnapshot = await getDocs(servicesCollectionRef);
        const availableServices = []; // Array to store fetched services

        querySnapshot.forEach((doc) => {
          const serviceData = doc.data();
          availableServices.push({
            id: doc.id,
            serviceName: serviceData.serviceName,
            // Other service properties if needed
          });
        });

        // Commit the mutation to update the store state
        commit("setAvailableServices", availableServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    } else {
      console.error("User not authenticated.");
    }
  },
};

const getters = {
  getAvailableServices(state) {
    return state.availableServices;
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
