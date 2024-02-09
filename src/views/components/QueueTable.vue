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
          <template v-if="paginatedQueues.length > 0">
            <tr v-for="(queue, index) in filteredPaginatedQueues" :key="index">
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
                <span
                  v-else-if="queue.status === 'Cancelled'"
                  class="badge text-bg-danger"
                  >Cancelled</span
                >
                <span
                  v-else-if="queue.status === 'No Show'"
                  class="badge text-bg-warning"
                  >No Show</span
                >
              </td>
              <td>
                <div class="circular-buttons-container">
                  <button
                    class="circular-button tick-button"
                    @click="completeQueue(queue.id)"
                    :disabled="
                      queue.status === 'Completed' || queue.status === 'Waiting'
                    "
                    :class="{
                      'disabled-button':
                        queue.status === 'Completed' ||
                        queue.status === 'Waiting',
                    }"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button
                    class="circular-button call-button"
                    @click="ongoingQueue(queue.id, queue.service)"
                    :disabled="isOngoingDisabled(queue.service)"
                    :title="isOngoingDisabled(queue.service) ? 'Disabled' : ''"
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
          </template>
          <template v-else>
            <tr>
              <td colspan="6" class="text-center">No current queues.</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center mt-4">
        <li
          class="page-item"
          :class="{ disabled: pagination.currentPage === 1 }"
        >
          <a
            class="page-link"
            href="#"
            aria-label="Previous"
            @click.prevent="prevPage"
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <!-- Display page numbers -->
        <li
          class="page-item"
          v-for="pageNumber in pagination.totalPages"
          :key="pageNumber"
          :class="{ active: pageNumber === pagination.currentPage }"
          @click.prevent="goToPage(pageNumber)"
        >
          <a class="page-link" href="#">{{ pageNumber }}</a>
        </li>
        <li
          class="page-item"
          :class="{
            disabled: pagination.currentPage === pagination.totalPages,
          }"
        >
          <a
            class="page-link"
            href="#"
            aria-label="Next"
            @click.prevent="nextPage"
          >
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
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
    selectedService: {
      type: String,
      required: true,
    },
    // Add other props as needed
  },
  data() {
    return {
      // Define pagination properties
      pagination: {
        currentPage: 1,
        perPage: 10, // Set your preferred number of items per page
        totalPages: 1,
      },
    };
  },
  computed: {
    // Calculate paginated queues based on current page
    paginatedQueues() {
      const start = (this.pagination.currentPage - 1) * this.pagination.perPage;
      const end = start + this.pagination.perPage;
      return this.queues.slice(start, end);
    },
    // Calculate paginated queues based on current page and selected service
    filteredPaginatedQueues() {
      // Filter the paginated queues based on the selected service
      return this.paginatedQueues.filter(
        (queue) =>
          !this.selectedService || queue.service === this.selectedService
      );
    },
  },
  watch: {
    queues() {
      this.updateTotalPages();
    },
    "pagination.perPage"() {
      this.updateTotalPages();
    },
  },
  methods: {
    isOngoingDisabled(service) {
      // Check if there is an ongoing queue for the current service
      return this.paginatedQueues.some(
        (q) => q.service === service && q.status === "Ongoing"
      );
    },
    updateTotalPages() {
      this.pagination.totalPages = Math.ceil(
        this.queues.length / this.pagination.perPage
      );
    },
    prevPage() {
      if (this.pagination.currentPage > 1) {
        this.pagination.currentPage--;
      }
    },
    // Update current page to next page
    nextPage() {
      if (this.pagination.currentPage < this.pagination.totalPages) {
        this.pagination.currentPage++;
      }
    },
    // Update current page to a specific page
    goToPage(pageNumber) {
      this.pagination.currentPage = pageNumber;
    },
    formatServiceTime(milliseconds) {
      const seconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return `${hours
        .toString()
        .padStart(2, "0")}h ${minutes
        .toString()
        .padStart(2, "0")}m ${remainingSeconds.toString().padStart(2, "0")}s`;
    },
    formattedArrivalTime(date) {
      const formatted = new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });
      return formatted;
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

          // Update the queue status to 'Completed' and store the service time as a number
          await updateDoc(queueDocRef, {
            status: "Completed",
            completedTime: completedTimestamp, // Add a field to store the completion time
            serviceTime: serviceTime, // Store the service time as a number
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
          // Fetch the queue data before updating
          const queueDocSnapshot = await getDoc(queueDocRef);
          const queueData = queueDocSnapshot.data();

          // Check if the queue was in a waiting state before becoming ongoing
          if (
            queueData.status === "Waiting" ||
            queueData.status === "No Show"
          ) {
            // Calculate waiting time by subtracting the queue's date from the current time
            const waitingTime = Date.now() - queueData.date;

            // Update the queue status to 'Ongoing' and store the start time and waiting time
            await updateDoc(queueDocRef, {
              status: "Ongoing",
              startTime: Date.now(), // Add a field to store the start time
              waitingTime: waitingTime, // Add a field to store the waiting time
            });

            console.log("Queue set to Ongoing status.");
            console.log("Waiting Time:", waitingTime);
            this.startTimer();
            this.isOngoingQueueForService = false;

            // Return the startTimestamp to use for calculating service time in completeQueue
            return Date.now();
          } else {
            console.log("Queue is not in a waiting state.");
          }
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
.text-bg-danger {
  background-color: #dc3545; /* Set your danger color */
}
.text-bg-warning {
  background-color: #f16131; /* Set your warning color */
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
