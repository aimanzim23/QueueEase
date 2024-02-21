import { doc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/main";

const state = {
  availableServices: [],
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
        const availableServices = [];

        querySnapshot.forEach((doc) => {
          const serviceData = doc.data();
          availableServices.push({
            id: doc.id,
            serviceName: serviceData.serviceName,
          });
        });

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
