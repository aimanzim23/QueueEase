<!-- QueueTable.vue -->
<template>
  <div class="card-body px-0 pt-0 pb-2">
    <div class="table-responsive p-0">
      <table class="table align-items-center mb-0">
        <thead>
          <tr>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              style="width: 80px"
            >
              Queue No.
            </th>
            <th
              class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Name
            </th>

            <th
              class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Services
            </th>
            <th
              class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Arrival Time
            </th>
            <th
              class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Status
            </th>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="text-center">
          <tr v-for="(queue, index) in queues" :key="index">
            <td class="mb-0 text-sm">#{{ queue.queueNo }}</td>
            <td>
              <h6 class="mb-0 text-sm">{{ queue.userName }}</h6>
              <p class="text-xs text-secondary mb-0">
                {{ queue.phoneNumber }}
              </p>
            </td>

            <td class="mb-0 text-sm">{{ queue.service }}</td>
            <td class="mb-0 text-sm">
              {{ formattedArrivalTime(queue.date) }}
            </td>
            <td class="mb-0 text-sm">
              <span
                v-if="queue.status === 'Ongoing'"
                class="badge text-bg-primary"
                >Ongoing
              </span>
              <span
                v-else-if="queue.status === 'Waiting'"
                class="badge text-bg-secondary"
                >Waiting</span
              >
              <span
                v-else-if="queue.status === 'Completed'"
                class="badge text-bg-success"
                >Completed</span
              >
            </td>
            <td>
              <div class="circular-buttons-container">
                <button
                  class="circular-button tick-button"
                  @click="completeQueue(queue.id)"
                  :disabled="queue.status === 'Completed'"
                  :class="{ 'disabled-button': queue.status === 'Completed' }"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button
                  class="circular-button call-button"
                  @click="ongoingQueue(queue.id)"
                  :disabled="queue.status === 'Completed'"
                  :title="queue.status === 'Completed' ? 'Disabled' : ''"
                >
                  <i class="fas fa-phone-alt"></i>
                </button>
                <button
                  class="circular-button trash-button"
                  @click="deleteQueue(queue.id)"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { deleteDoc, updateDoc, getDoc, doc } from "firebase/firestore";
import { db, auth } from "@/main";
export default {
  name: "queue-table",
  props: {
    queues: {
      type: Array,
      required: true,
    },
    // Add other props as needed
  },
  methods: {
    formattedArrivalTime(date) {
      const formatted = new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });
      return formatted;
    },
    formatServiceTime(serviceTime) {
      // You can implement your logic to format service time here
      // For example, converting milliseconds to a readable format
      const seconds = Math.floor(serviceTime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    },
    async completeQueue(id) {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queueDocRef = doc(userDocRef, "queues", id);

        try {
          const completedTimestamp = Date.now(); // Store the completion time

          // Get the queue document to retrieve the start time
          const queueDocSnapshot = await getDoc(queueDocRef);
          const queueData = queueDocSnapshot.data();

          // Calculate the service time in milliseconds
          const serviceTime = completedTimestamp - queueData.startTime;
          const formattedServiceTime = this.formatServiceTime(serviceTime);

          // Update the queue status to 'Completed' and store the service time
          await updateDoc(queueDocRef, {
            status: "Completed",
            completedTime: completedTimestamp, // Add a field to store the completion time
            serviceTime: formattedServiceTime, // Store the service time
          });

          console.log(
            "Queue marked as Completed with service time:",
            serviceTime
          );
          console.log("Timer stopped");
          this.stopTimer();
        } catch (error) {
          console.error("Error marking queue as Completed:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },
    async ongoingQueue(id) {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queueDocRef = doc(userDocRef, "queues", id);

        try {
          const startTimestamp = Date.now(); // Store the start time

          // Update the queue status to 'Ongoing'
          await updateDoc(queueDocRef, {
            status: "Ongoing",
            startTime: startTimestamp, // Add a field to store the start time
          });

          console.log("Queue set to Ongoing status.");
          this.startTimer();
          this.isOngoingQueueForService = false;
          // Return the startTimestamp to use for calculating service time in completeQueue
          return startTimestamp;
        } catch (error) {
          console.error("Error setting queue to Ongoing:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },
    async deleteQueue(id) {
      const user = auth.currentUser;
      if (user) {
        try {
          const userId = user.uid;
          const userDocRef = doc(db, "users", userId);
          const queueDocRef = doc(userDocRef, "queues", id);

          await deleteDoc(queueDocRef);
          console.log("Queue deleted successfully.");
        } catch (error) {
          console.error("Error deleting queue:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },
  },
};
</script>

<style scoped>
/* Add appropriate styles for the badges and text */
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  color: white; /* Set the text color */
  /* Add other necessary styles */
}

.text-bg-primary {
  background-color: #007bff; /* Set your primary color */
}

.text-bg-secondary {
  background-color: #6c757d; /* Set your secondary color */
}

.text-bg-success {
  background-color: #28a745; /* Set your success color */
}
.circular-buttons-container {
  display: flex;
}

.circular-button {
  border: none;
  border-radius: 50%;
  width: 28px; /* Set your preferred width */
  height: 28px; /* Set your preferred height */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-right: 10px; /* Set any margin as needed */
  transition: background-color 0.3s; /* Add a transition effect */
}

/* Specific styles for different buttons */
.tick-button {
  background-color: #28a745; /* Green color for tick button */
  color: white;
}

.tick-button:hover {
  background-color: #218838; /* Darker green color on hover */
}

.call-button {
  background-color: #007bff; /* Blue color for call button */
  color: white;
}

.call-button:hover {
  background-color: #0056b3; /* Darker blue color on hover */
}

.trash-button {
  background-color: #dc3545; /* Red color for trash button */
  color: white;
}

.trash-button:hover {
  background-color: #c82333; /* Darker red color on hover */
}

.circular-button i {
  font-size: 16px; /* Set your preferred icon size */
}
.circular-button:disabled,
.circular-button[disabled] {
  /* Your disabled button styles here */
  opacity: 0.5; /* Example: Reducing opacity */
  cursor: not-allowed; /* Example: Change cursor */
}
</style>
