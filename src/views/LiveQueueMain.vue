<template>
  <div class="card p-4 m-4">
    <div v-if="isLiveQueuesLoaded">
      <h2 class="mt-4">Ongoing Queues</h2>
      <div class="container text-center">
        <div v-if="ongoingQueues.length > 0">
          <div class="row">
            <div
              v-for="queue in ongoingQueues"
              :key="queue.queueId"
              class="col-lg-4 col-md-6 mb-3"
            >
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">{{ queue.service }}</h5>
                  <p class="card-text">Name: {{ queue.userName }}</p>
                  <p class="card-text">Queue No: {{ queue.queueNo }}</p>
                  <p class="card-text">Status: {{ queue.status }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No ongoing queues.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/main";

export default {
  name: "live-queue-main",
  data() {
    return {
      ongoingQueues: [],
      waitingQueues: [],
      isLiveQueuesLoaded: false,
      queueData: [],
    };
  },
  methods: {
    async fetchLiveQueues() {
      console.log("Fetching live queues...");
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const queuesCollectionRef = collection(userDocRef, "queues");

          onSnapshot(queuesCollectionRef, (querySnapshot) => {
            this.queueData = querySnapshot.docs.map((doc) => doc.data());
            this.ongoingQueues = this.queueData.filter(
              (queue) => queue.status === "Ongoing"
            );
            this.waitingQueues = this.queueData.filter(
              (queue) => queue.status === "Waiting"
            );
            this.isLiveQueuesLoaded = true;
          });
        }
      } catch (error) {
        console.error("Error fetching live queues:", error);
      }
    },

    async fetchServices() {
      // Your logic for fetching services goes here
    },
  },
  mounted() {
    this.fetchLiveQueues();
    this.fetchServices();
  },
};
</script>

<style scoped>
.live-queue-board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.queue-card {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease-in-out;
  margin-bottom: 20px; /* Added margin to separate cards */
}

.queue-card:hover {
  transform: scale(1.05);
}

.larger-card {
  grid-row: span 2;
  /* Add visual style for larger-card */
  background-color: lightblue;
}

.smaller-card {
  /* Add visual style for smaller-card */
  background-color: lightgreen;
}
</style>
