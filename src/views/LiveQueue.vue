<template>
  <div>
    <h1>Live Queue</h1>
    <ul>
      <li v-for="queue in queues" :key="queue.queueId">
        {{ queue.queueNo }} - {{ queue.userName }} - {{ queue.status }}
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from "@/main";
import { collection, onSnapshot } from "firebase/firestore";

export default {
  name: "LiveQueue",
  data() {
    return {
      queues: [],
    };
  },
  mounted() {
    try {
      const userId = this.$route.params.userId;
      const queuesCollectionRef = collection(db, "users", userId, "queues");

      // Use onSnapshot to listen for real-time updates
      onSnapshot(queuesCollectionRef, (querySnapshot) => {
        // Directly assign a new array
        this.queueData = querySnapshot.docs.map((doc) => doc.data());
        console.log("Queue data:", this.queueData);
      });
    } catch (error) {
      console.error("Error fetching queues:", error);
    }
  },
};
</script>

<style scoped>
/* Add your styling here */
</style>
