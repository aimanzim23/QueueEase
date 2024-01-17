<template>
  <button @click="navigateToLiveQueue" class="btn btn-primary btn-lg w-100">
    Live Queue
  </button>
  <div class="card">
    <div class="card-body pt-0" :style="{ minHeight: '500px' }">
      <div class="text-center mt-4" v-if="selectedQueue">
        <div class="h6 font-weight-300">
          There are {{ waitingCountForService }} visitors waiting
        </div>
        <h2>Queue Number</h2>
        <div
          class="mt-4 mb-5 py-3 queue-number-card"
          style="
            border: 2px solid grey;
            border-radius: 10px;
            background-color: #f8f9fa;
          "
        >
          <div class="display-1" style="color: grey">
            {{ selectedQueue.queueNo }}
          </div>
        </div>
        <div>
          <p>Service: {{ selectedQueue.service }}</p>
          <p v-if="currentQueue">Current Queue: {{ currentQueue.queueNo }}</p>
          <p v-else>No ongoing queue</p>
          <p>Keep an eye on the ticket calls, {{ selectedQueue.userName }}!</p>
          <p>Estimated Waiting Time: {{ "10min" }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="text-center mt-4">
    <button
      type="button"
      class="btn btn-primary btn-lg mx-2"
      style="background-color: primary"
    >
      Enable Notification
    </button>
    <button
      type="button"
      class="btn btn-primary btn-lg mx-2"
      style="background-color: red"
    >
      Cancel
    </button>
  </div>
</template>

<script>
import { db } from "@/main";
import { collection, onSnapshot } from "firebase/firestore";

export default {
  name: "QueueTicket",
  data() {
    return {
      queueData: null,
      selectedQueueId: this.$route.params.queueId,
      selectedQueue: null,
    };
  },
  computed: {
    waitingCountForService() {
      // Calculate waiting count for the service
      if (this.selectedQueue && this.queueData) {
        return this.queueData.filter(
          (queue) =>
            queue.service === this.selectedQueue.service &&
            queue.status === "Waiting"
        ).length;
      } else {
        return 0;
      }
    },
  },
  methods: {
    async fetchQueueData() {
      try {
        const userId = this.$route.params.userId;
        const queuesCollectionRef = collection(db, "users", userId, "queues");

        // Use onSnapshot to listen for real-time updates
        onSnapshot(queuesCollectionRef, (querySnapshot) => {
          // Directly assign a new array
          this.queueData = querySnapshot.docs.map((doc) => doc.data());

          // Find the selected queue based on the queueId
          this.selectedQueue = this.queueData.find(
            (queue) => queue.queueId === this.selectedQueueId
          );

          if (this.selectedQueue && this.selectedQueue.status === "Completed") {
            // Show an alert
            window.alert(
              "Thank you for using Queue Ease! Visit our website on www.queueease.com."
            );

            // Optionally, you can perform additional actions after the alert
            console.log("Redirecting or performing additional actions...");
          }

          // Find the current queue based on the waitingCountForService and selectedQueue
          this.currentQueue = this.queueData.find(
            (queue) =>
              queue.service === this.selectedQueue.service &&
              queue.status === "Ongoing"
          );

          // If there's no ongoing queue, set currentQueue to null
          if (!this.currentQueue) {
            this.currentQueue = "No ongoing queues";
          }

          // Now, 'selectedQueue' contains the details of the specific queue
          console.log("Selected Queue:", this.selectedQueue);
        });
      } catch (error) {
        console.error("Error fetching queue data:", error);
      }
    },
  },
  mounted() {
    // Fetch queues automatically when the component is mounted
    this.fetchQueueData();
  },
};
</script>
