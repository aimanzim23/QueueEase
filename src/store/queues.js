import {
  doc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  setDoc,
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
  async endQueuesForToday({ commit }) {
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

        // Get all documents from the "queues" collection
        const queuesCollectionRef = collection(userDocRef, "queues");
        const queueDocs = await getDocs(queuesCollectionRef);

        // Prepare an array to store all queues
        const allQueues = [];

        // Iterate through each document in "queues" collection using for...of
        for (const doc of queueDocs.docs) {
          const queueData = doc.data();

          // Change the status to "Cancelled" for queues with status "Waiting"
          if (
            queueData.status === "Waiting" ||
            queueData.status === "No Show"
          ) {
            queueData.status = "Cancelled";
          }

          // Add the queue to the "allQueues" document
          await setDoc(
            archiveDocumentRef,
            { [doc.id]: queueData },
            { merge: true }
          );

          // Store the queue data in the array for further processing if needed
          allQueues.push(queueData);

          // Delete the document from the "queues" collection
          await deleteDoc(doc.ref);
        }

        // Update Vuex store
        commit("setQueues", []);

        // Clear local storage
        localStorage.removeItem("queueData");

        console.log("All Queues for Today:", allQueues);

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

        // Reference to the "allQueues" document in the "archives" subcollection
        const archiveDocumentRef = doc(
          collection(userDocRef, "archives"),
          "allQueues"
        );

        // Get the data from the "allQueues" document
        const archiveData = (await getDoc(archiveDocumentRef)).data();

        // Commit the archived queues to the Vuex store
        commit("setArchivedQueues", archiveData);

        // Log or handle the data as needed
        console.log("Archived Queues:", archiveData);
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
