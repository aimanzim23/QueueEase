import {
  doc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/main";

const state = {
  queues: [],
  archivedQueues: [],
};

const mutations = {
  setSessionId(state, sessionId) {
    state.currentSessionId = sessionId;
  },
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
  setArchivedQueues(state, archivedQueues) {
    state.archivedQueues = archivedQueues;
  },
};

const actions = {
  async endQueuesForToday({ state, commit }) {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;

        // Reference to the user's document
        const userDocRef = doc(db, "users", userId);

        // Create a subcollection for storing completed queues under the user
        const archivesCollectionRef = collection(userDocRef, "archives");

        // Create a single document with a fixed ID for all queues
        const archiveDocumentRef = doc(archivesCollectionRef, "allQueues");

        // Get existing queues data from the document
        const existingQueues =
          (await getDoc(archiveDocumentRef)).data()?.queues || [];

        // Combine existing queues with the current queues
        const updatedQueues = [...existingQueues, ...state.queues];

        // Update the document with the combined queues
        await setDoc(archiveDocumentRef, { queues: updatedQueues });

        // Delete/reset the existing queues
        const queuesCollectionRef = collection(userDocRef, "queues");

        // Get all documents from the existing collection
        const queueDocs = await getDocs(queuesCollectionRef);

        // Delete each document individually
        queueDocs.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        // Update Vuex store
        commit("setQueues", []);

        // Clear local storage
        localStorage.removeItem("queueData");

        // ... other logic if needed
      } else {
        console.error("User not authenticated.");
      }
    } catch (error) {
      console.error("Error ending queues for today:", error);
      // Handle error
    }
  },
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
  async fetchArchivedQueues({ commit }) {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;

        // Reference to the user's document
        const userDocRef = doc(db, "users", userId);

        // Reference to the "allQueues" document inside the "archives" collection
        const archiveDocumentRef = doc(
          collection(userDocRef, "archives"),
          "allQueues"
        );

        // Get existing queues data from the document
        const archivedQueuesData = (await getDoc(archiveDocumentRef)).data();

        if (archivedQueuesData) {
          const archivedQueues = archivedQueuesData.queues || [];

          // Update Vuex store with archived queues
          commit("setArchivedQueues", archivedQueues);
        }
      } else {
        console.error("User not authenticated.");
      }
    } catch (error) {
      console.error("Error fetching archived queues:", error);
      // Handle error
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
  getArchivedQueues: (state) => state.archivedQueues,
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
