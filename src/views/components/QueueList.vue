<template>
  <div class="col-lg-12">
    <div class="row">
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">
                Total Queue <fa icon="user" />
              </h5>
              <p class="card-text">{{ totalQueues }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">
                Awaiting Visits
              </h5>
              <p class="card-text">{{ awaitingQueuesCount }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">
                Completed Visits
              </h5>
              <p class="card-text">{{ completedQueuesCount }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">
                Avg Waiting Time
              </h5>
              <p class="card-text">12 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-md-6">
      <div class="card mb-4">
        <div class="card-header text-center border-0 pt-0 pt-lg-2 pb-4 pb-lg-3">
          Test
        </div>
        <div class="card-body pt-0" :style="{ minHeight: '518px' }">
          <div class="text-center mt-4">
            <div class="h6 font-weight-300">
              There are {{ awaitingQueuesCount }} visitors waiting
            </div>
            <h2>Queue Number</h2>
            <div
              class="mt-4 mb-5 py-2 mx-8 text-center"
              style="background-color: #e8e8e8; border-radius: 15px"
            >
              <div class="display-1">
                {{ ongoingQueueNo ? ongoingQueueNo : "" }}
              </div>
            </div>
            <div>{{ formatElapsedTime(elapsedTime) }}</div>
            <div class="text-center">
              <button
                type="button"
                class="btn btn-primary btn-lg"
                style="background-color: rgb(0, 136, 255)"
              >
                Invite next visitor
              </button>
              <button
                type="button"
                class="btn btn-primary btn-lg"
                style="background-color: rgb(0, 136, 255)"
              >
                Invite by number
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card mb-4">
        <div class="p-3 pb-0 card-header">
          <h6 class="mb-0">Waiting List</h6>
        </div>
        <div class="p-3 card-body" :style="{ minHeight: '500px' }">
          <ul class="list-group list-group-flush">
            <li
              v-for="(queue, index) in paginatedQueues"
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-center border-bottom"
            >
              <div>
                <h6 class="mb-1">#{{ queue.queueNo }}</h6>
                <p class="mb-1 text-sm">{{ queue.userName }}</p>
                <p class="text-xs text-secondary mb-0">
                  {{ queue.phoneNumber }}
                </p>
                <p class="mb-0 text-sm">{{ queue.service }}</p>
                <p class="mb-0 text-sm">
                  {{ formattedArrivalTime(queue.date) }}
                </p>
              </div>
              <div>
                <span v-if="queue.status === 'Ongoing'" class="badge bg-primary"
                  >Ongoing</span
                >
                <span
                  v-else-if="queue.status === 'Waiting'"
                  class="badge bg-secondary"
                  >Waiting</span
                >
                <span
                  v-else-if="queue.status === 'Completed'"
                  class="badge bg-success"
                  >Completed</span
                >
              </div>
            </li>
          </ul>

          <!-- Pagination controls -->
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
                @click="goToPage(pageNumber)"
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
      </div>
    </div>
  </div>

  <div class="card">
    <div
      class="card-header pb-0 d-flex justify-content-between align-items-center"
    >
      <h6 class="mb-0">Queue List</h6>
      <queue-modal />
    </div>

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
  </div>
</template>

<script>
import {
  collection,
  deleteDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
  query,
} from "firebase/firestore";
import { db, auth } from "@/main";
import QueueModal from "./QueueModal.vue";

export default {
  name: "queue-list",
  components: { QueueModal },
  data() {
    return {
      newQueue: {
        userName: "",
        phoneNumber: "",
        service: "",
      },
      timerInterval: null,
      elapsedTime: 0, // Initialize the elapsed time
      pagination: {
        currentPage: 1,
        perPage: 3,
        totalPages: 1,
      },
    };
  },
  watch: {
    waitingQueues() {
      // Recalculate total pages when the waitingQueues data changes
      this.pagination.totalPages = Math.ceil(
        this.waitingQueues.length / this.pagination.perPage
      );
    },
  },
  methods: {
    prevPage() {
      if (this.pagination.currentPage > 1) {
        this.pagination.currentPage--;
      }
    },
    nextPage() {
      if (this.pagination.currentPage < this.pagination.totalPages) {
        this.pagination.currentPage++;
      }
    },
    goToPage(pageNumber) {
      this.pagination.currentPage = pageNumber;
      // Add logic to update the displayed content
    },
    getCurrentUser() {
      const currentUser = auth.currentUser;

      if (currentUser) {
        console.log("Current user:", currentUser);
      } else {
        console.log("No user signed in");
      }
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
          // Return the startTimestamp to use for calculating service time in completeQueue
          return startTimestamp;
        } catch (error) {
          console.error("Error setting queue to Ongoing:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
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
    startTimer() {
      this.timerInterval = setInterval(() => {
        this.elapsedTime += 1000; // Increment by 1 second (1000ms)
      }, 1000);
    },
    stopTimer() {
      clearInterval(this.timerInterval); // Clear the interval to stop the timer

      this.elapsedTime = 0;
    },
    formatElapsedTime(milliseconds) {
      // Convert milliseconds to seconds, minutes, and hours
      let seconds = Math.floor(milliseconds / 1000);
      let hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      let minutes = Math.floor(seconds / 60);
      seconds %= 60;

      // Add leading zeros if needed for single-digit values
      const formattedHours = String(hours).padStart(2, "0");
      const formattedMinutes = String(minutes).padStart(2, "0");
      const formattedSeconds = String(seconds).padStart(2, "0");

      // Return the formatted time as HH:MM:SS
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
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

  mounted() {
    const storedData = localStorage.getItem("queueData");
    const user = auth.currentUser;

    if (storedData) {
      // If there's data in localStorage, load it directly into the Vuex store
      const parsedData = JSON.parse(storedData);
      this.$store.commit("setQueues", parsedData);
    }

    if (user) {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);
      const queuesCollectionRef = collection(userDocRef, "queues");
      const latestQuery = query(queuesCollectionRef, orderBy("date"));

      onSnapshot(latestQuery, (snapshot) => {
        const queues = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            queueNo: data.queueNo,
            userName: data.userName,
            phoneNumber: data.phoneNumber,
            service: data.service,
            date: data.date,
            status: data.status,
          };
        });

        this.$store.commit("setQueues", queues); // Update Vuex store

        // Store data in local storage after fetching
        localStorage.setItem("queueData", JSON.stringify(queues));
      });
    } else {
      console.error("User not authenticated.");
    }
  },
  computed: {
    waitingQueues() {
      return this.queues.filter((queue) => queue.status === "Waiting");
    },
    formattedArrivalTime() {
      return (date) => {
        const formatted = new Date(date).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });
        return formatted;
      };
    },
    queues() {
      return this.$store.getters.getQueues;
    },
    totalQueues() {
      return this.queues.length;
    },
    awaitingQueuesCount() {
      return this.$store.getters.getAwaitingQueuesCount;
    },
    completedQueuesCount() {
      return this.$store.getters.getCompletedQueuesCount;
    },
    ongoingQueueNo() {
      const ongoingQueue = this.queues.find(
        (queue) => queue.status === "Ongoing"
      );
      return ongoingQueue ? ongoingQueue.queueNo : null;
    },
    paginatedQueues() {
      const start = (this.pagination.currentPage - 1) * this.pagination.perPage;
      const end = start + this.pagination.perPage;
      return this.waitingQueues.slice(start, end);
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
