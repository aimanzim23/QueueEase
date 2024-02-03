<template>
  <div class="card p-4" style="width: 600px; height: 600px">
    <div class="d-flex justify-content-between align-items-center">
      <!-- Center Section -->
      <div style="text-align: center; margin-top: 20px">
        <button
          type="button"
          class="btn btn-primary btn-lg mx-2"
          style="background-color: primary"
          @click="createQueue"
        >
          Create Queue Link
        </button>
      </div>

      <!-- Right Section -->
      <div class="card-icons">
        <i class="fas fa-copy" @click="copyLink" style="margin-right: 10px"></i>
        <i class="fas fa-print" @click="printLink"></i>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/main";
export default {
  name: "QR Code",
  methods: {
    async createQueue() {
      try {
        const user = auth.currentUser;

        if (user) {
          // Generate a unique ID for the queue
          const queueId = uuidv4();

          // Associate the queueId with the current user
          const userData = {
            userId: user.uid,
            queueId: queueId,
          };

          // Dispatch Vuex action to store user data
          await this.$store.dispatch("saveUserData", userData);

          // Create the join link with userId and queueId as parameters
          const joinLink = `http://localhost:8080/join/${user.uid}/${queueId}`;
          console.log("Join Link:", joinLink);

          // Now you can store the queueId in your Vuex store or Firebase
          // For testing purposes, you can log the join link or display it in your UI.

          // Optionally, you can perform additional actions here, such as creating the queue in Firestore.
        } else {
          console.error("User not authenticated.");
        }
      } catch (error) {
        console.error("Error creating queue:", error);
        // Handle errors here
      }
    },
  },
};
</script>
