import {
  doc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/main";

const state = {
  queues: [],
  // other queues-related state properties
};

const mutations = {
  setQueues(state, queues) {
    state.queues = queues;
  },
  addQueue(state, newQueue) {
    state.queues.push(newQueue);
  },
  // other mutations related to queues
};

const actions = {
  async addQueue({ commit }, queueData) {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queuesCollectionRef = collection(userDocRef, "queues");

        // Add data to Firestore
        const docRef = await addDoc(queuesCollectionRef, queueData);

        // Get the ID of the newly added document
        const newQueue = {
          id: docRef.id,
          ...queueData,
        };

        // Update Vuex store
        commit("addQueue", newQueue);

        // Update local storage only if Firestore addition is successful
        const storedData = localStorage.getItem("queueData");
        let queues = [];
        if (storedData) {
          queues = JSON.parse(storedData);
        }
        queues.push(newQueue);
        localStorage.setItem("queueData", JSON.stringify(queues));
      } else {
        console.error("User not authenticated.");
      }
    } catch (error) {
      console.error("Error adding queue:", error);
      throw new Error("Failed to add queue to Firestore");
    }
  },

  async fetchQueues({ commit }) {
    try {
      const queuesSnapshot = await onSnapshot(
        query(collection(db, "queues"), orderBy("date")),
        (snapshot) => {
          const queues = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              userName: data.userName,
              phoneNumber: data.phoneNumber,
              notes: data.notes,
              date: data.date,
            };
          });
          commit("setQueues", queues); // Update state with fetched queues
          localStorage.setItem("queueData", JSON.stringify(queues)); // Store in localStorage
        }
      );
      return queuesSnapshot;
    } catch (error) {
      console.error("Error fetching queues:", error);
      throw new Error("Failed to fetch queues from Firestore");
    }
  },
  // other actions related to queues
};

const getters = {
  getQueues: (state) => state.queues,
  // other getters related to queues
};

export default {
  state,
  mutations,
  actions,
  getters,
};
