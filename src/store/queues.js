import {
  doc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  updateDoc,
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
  updateQueueTimer(
    state,
    { queueId, startTime, endTime, elapsedTime, timerRunning }
  ) {
    const queueToUpdate = state.queues.find((queue) => queue.id === queueId);
    if (queueToUpdate) {
      queueToUpdate.startTime = startTime;
      queueToUpdate.endTime = endTime;
      queueToUpdate.elapsedTime = elapsedTime;
      queueToUpdate.timerRunning = timerRunning;
    }
  },
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
              queueNo: data.queueNo,
              userName: data.userName,
              phoneNumber: data.phoneNumber,
              notes: data.notes,
              date: data.date,
              status: data.status,
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
  async startQueueTimer({ commit }, queueId) {
    try {
      const queueDocRef = doc(db, "queues", queueId);
      const queueDocSnapshot = await getDoc(queueDocRef);

      if (queueDocSnapshot.exists()) {
        const startTime = Date.now();
        commit("updateQueueTimer", { queueId, startTime, timerRunning: true });

        await updateDoc(queueDocRef, { startTime });

        // ... other logic
      } else {
        console.error("Queue not found.");
      }
    } catch (error) {
      console.error("Error starting queue timer:", error);
      // Handle error
    }
  },

  async stopQueueTimer({ commit }, queueId) {
    try {
      const queueDocRef = doc(db, "queues", queueId);
      const queueDocSnapshot = await getDoc(queueDocRef);

      if (queueDocSnapshot.exists()) {
        const queueToUpdate = queueDocSnapshot.data();

        const endTime = Date.now();
        const elapsedTime = endTime - queueToUpdate.startTime;
        commit("updateQueueTimer", {
          queueId,
          endTime,
          elapsedTime,
          timerRunning: false,
        });

        await updateDoc(queueDocRef, { endTime, elapsedTime });

        // ... other logic
      } else {
        console.error("Queue not found.");
      }
    } catch (error) {
      console.error("Error stopping queue timer:", error);
      // Handle error
    }
  },

  async resetQueueTimer({ commit }, queueId) {
    try {
      const queueDocRef = doc(db, "queues", queueId);
      const queueDocSnapshot = await getDoc(queueDocRef);

      if (queueDocSnapshot.exists()) {
        commit("updateQueueTimer", {
          queueId,
          startTime: null,
          endTime: null,
          elapsedTime: 0,
          timerRunning: false,
        });

        await updateDoc(queueDocRef, {
          startTime: null,
          endTime: null,
          elapsedTime: 0,
        });

        // ... other logic
      } else {
        console.error("Queue not found.");
      }
    } catch (error) {
      console.error("Error resetting queue timer:", error);
      // Handle error
    }
  },
};

const getters = {
  getQueues: (state) => state.queues,
  // other getters related to queues
  getAwaitingQueuesCount: (state) =>
    state.queues.filter((queue) => queue.status === "Waiting").length,
  getCompletedQueuesCount: (state) =>
    state.queues.filter((queue) => queue.status === "Completed").length,
};

export default {
  state,
  mutations,
  actions,
  getters,
};
