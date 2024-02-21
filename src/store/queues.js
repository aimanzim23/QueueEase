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

        const userDocRef = doc(db, "users", userId);

        const archivesCollectionRef = collection(userDocRef, "archives");

        const archiveDocumentRef = doc(archivesCollectionRef, "allQueues");

        const queuesCollectionRef = collection(userDocRef, "queues");
        const queueDocs = await getDocs(queuesCollectionRef);

        const allQueues = [];

        for (const doc of queueDocs.docs) {
          const queueData = doc.data();

          if (
            queueData.status === "Waiting" ||
            queueData.status === "No Show"
          ) {
            queueData.status = "Cancelled";
          }

          await setDoc(
            archiveDocumentRef,
            { [doc.id]: queueData },
            { merge: true }
          );

          allQueues.push(queueData);

          await deleteDoc(doc.ref);
        }

        commit("setQueues", []);

        localStorage.removeItem("queueData");
      } else {
        console.error("User not authenticated.");
      }
    } catch (error) {
      console.error("Error ending queues for today:", error);
    }
  },

  async addQueue({ commit }, queueData) {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queuesCollectionRef = collection(userDocRef, "queues");

        const docRef = await addDoc(queuesCollectionRef, queueData);

        const newQueue = {
          id: docRef.id,
          ...queueData,
        };

        commit("addQueue", newQueue);

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
          commit("setQueues", queues);
          localStorage.setItem("queueData", JSON.stringify(queues));
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

        const userDocRef = doc(db, "users", userId);

        const archiveDocumentRef = doc(
          collection(userDocRef, "archives"),
          "allQueues"
        );

        const archiveData = (await getDoc(archiveDocumentRef)).data();

        commit("setArchivedQueues", archiveData);
      } else {
        console.error("User not authenticated.");
      }
    } catch (error) {
      console.error("Error fetching archived queues:", error);
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
      } else {
        console.error("Queue not found.");
      }
    } catch (error) {
      console.error("Error starting queue timer:", error);
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
      } else {
        console.error("Queue not found.");
      }
    } catch (error) {
      console.error("Error stopping queue timer:", error);
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
      } else {
        console.error("Queue not found.");
      }
    } catch (error) {
      console.error("Error resetting queue timer:", error);
    }
  },
};

const getters = {
  getQueues: (state) => state.queues,
  getArchivedQueues: (state) => state.archivedQueues,

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
