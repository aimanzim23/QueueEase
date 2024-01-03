<template>
  <div class="row">
    <div class="row">
      <div class="col-lg-3 col-md-6 col-12">
        <card
          title="Total Queues"
          :value="filteredTotalQueues"
          iconClass="fas fa-users"
          iconBackground="bg-gradient-primary"
          directionReverse
        ></card>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <card
          title="Awaiting Visits"
          :value="filteredAwaitingQueuesCount"
          iconClass="fas fa-clock"
          iconBackground="bg-gradient-danger"
          directionReverse
        ></card>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <card
          title="Completed Visits"
          :value="filteredCompletedQueuesCount"
          iconClass="fas fa-check-square"
          iconBackground="bg-gradient-success"
          directionReverse
        ></card>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <card
          title="Avg Waiting Time"
          value="10 min"
          iconClass="fas fa-hourglass-half"
          iconBackground="bg-gradient-warning"
          directionReverse
        ></card>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header text-center border-0">
            <select
              id="serviceSelection"
              v-model="selectedService"
              class="form-select"
            >
              <option value="">Show All</option>
              <option
                v-for="service in availableServices"
                :key="service.id"
                :value="service.serviceName"
              >
                {{ service.serviceName }}
              </option>
            </select>
          </div>
          <div class="card-body pt-0" :style="{ minHeight: '500px' }">
            <div class="text-center mt-4">
              <div class="h6 font-weight-300">
                There are {{ filteredAwaitingQueuesCount }} visitors waiting
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
                <div
                  v-if="selectedService"
                  class="display-1"
                  style="color: grey"
                >
                  {{
                    ongoingQueueNo !== null && ongoingQueueNo !== undefined
                      ? ongoingQueueNo
                      : "0"
                  }}
                </div>
                <div v-else class="display-1" style="color: grey">0</div>
              </div>
              <div>
                <timer
                  :startTimer="startTimer"
                  :stopTimer="stopTimer"
                  :elapsedTime="elapsedTime"
                />
              </div>
              <div class="text-center mt-4">
                <button
                  type="button"
                  class="btn btn-primary btn-lg mx-2"
                  style="background-color: primary"
                  @click="inviteNextVisitor"
                  :disabled="!selectedService || isOngoingForSelectedService"
                >
                  Invite Next Visitor
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-lg mx-2"
                  style="background-color: red"
                  @click="endVisit"
                  :disabled="!selectedService"
                >
                  End Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <waiting-list
          :paginatedQueues="paginatedQueues"
          :pagination="pagination"
          :prevPage="prevPage"
          :nextPage="nextPage"
          :goToPage="goToPage"
          :formattedArrivalTime="formattedArrivalTime"
        />
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
  getDocs,
  doc,
  query,
} from "firebase/firestore";
import { db, auth } from "@/main";
import QueueModal from "./QueueModal.vue";
import Timer from "./Timer.vue";
import WaitingList from "./WaitingList.vue";
import Card from "@/examples/Cards/Card.vue";

export default {
  name: "queue-list",
  components: { QueueModal, Timer, WaitingList, Card },
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
      selectedService: null, // To store the selected service ID
      availableServices: [],
    };
  },
  methods: {
    async inviteNextVisitor() {
      const filteredQueues = this.filteredQueues;
      if (filteredQueues.length > 0) {
        const nextQueue = filteredQueues[0]; // Assuming you want to invite the first one in the filtered list
        await this.ongoingQueue(nextQueue.id);
        // Update any necessary UI changes or state after inviting the next visitor
      } else {
        console.log("No visitors in the waiting queue.");
        // Handle the case when there are no visitors in the waiting queue
      }
    },
    async endVisit() {
      const filteredOngoing = this.filteredOngoing;
      const selectedService = this.selectedService; // Assuming you have a selectedService property

      const ongoingVisit = filteredOngoing.find(
        (queue) =>
          queue.status === "Ongoing" && queue.service === selectedService
      );

      console.log("Ongoing Visit in Selected Service:", ongoingVisit);

      if (ongoingVisit) {
        console.log(
          "Attempting to complete the ongoing visit from filtered queues..."
        );
        await this.completeQueue(ongoingVisit.id);
        // Perform any UI updates or state changes after ending the visit
      } else {
        console.log(
          "No ongoing visit found in the selected service within filtered queues."
        );
        // Handle the case when there is no ongoing visit in the selected service within filtered queues
      }
    },

    async fetchServices() {
      // Assume `auth.currentUser` is available for the authenticated user
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
        const servicesCollectionRef = collection(userDocRef, "services"); // Reference to the services collection

        try {
          const querySnapshot = await getDocs(servicesCollectionRef);
          this.availableServices = []; // Clear existing services
          querySnapshot.forEach((doc) => {
            const serviceData = doc.data();
            // Push each service into the availableServices array
            this.availableServices.push({
              id: doc.id,
              serviceName: serviceData.serviceName, // Adjust based on your service data structure
              // Other service properties if needed
            });
          });
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },
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
    this.fetchServices();
    const storedSelectedService = localStorage.getItem("selectedService");
    if (storedSelectedService) {
      this.selectedService = storedSelectedService;
    }
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
  watch: {
    filteredQueues() {
      // Recalculate total pages when the filteredQueues data changes
      this.pagination.totalPages = Math.ceil(
        this.filteredQueues.length / this.pagination.perPage
      );
    },
    selectedService(newValue) {
      // Update local storage when the selected service changes
      localStorage.setItem("selectedService", newValue);
    },
  },
  computed: {
    isOngoingForSelectedService() {
      if (!this.selectedService) {
        return false; // No service selected, hence no ongoing queue
      }

      // Logic to identify if there's an ongoing queue for the selected service
      return this.queues.some(
        (queue) =>
          queue.service === this.selectedService && queue.status === "Ongoing"
      );
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
    filteredSelectedServiceQueues() {
      const filteredQueues = this.selectedService
        ? this.queues.filter((queue) => queue.service === this.selectedService)
        : this.queues;

      return filteredQueues;
    },
    filteredTotalQueues() {
      return this.filteredSelectedServiceQueues.length;
    },
    filteredAwaitingQueuesCount() {
      return this.filteredSelectedServiceQueues.filter(
        (queue) => queue.status === "Waiting"
      ).length;
    },
    filteredCompletedQueuesCount() {
      return this.filteredSelectedServiceQueues.filter(
        (queue) => queue.status === "Completed"
      ).length;
    },

    ongoingQueueNo() {
      const filteredQueues = this.selectedService
        ? this.queues.filter((queue) => queue.service === this.selectedService)
        : this.queues; // Use all queues if no service is selected

      const ongoingQueue = filteredQueues.find(
        (queue) => queue.status === "Ongoing"
      );
      return ongoingQueue ? ongoingQueue.queueNo : null;
    },

    filteredQueues() {
      let filtered = this.queues;

      if (this.selectedService) {
        filtered = filtered.filter(
          (queue) => queue.service === this.selectedService
        );
      }

      filtered = filtered.filter((queue) => queue.status === "Waiting");

      return filtered;
    },
    filteredOngoing() {
      let filtered = this.queues;

      if (this.selectedService) {
        filtered = filtered.filter(
          (queue) => queue.service === this.selectedService
        );
      }

      filtered = filtered.filter((queue) => queue.status === "Ongoing");

      return filtered;
    },
    paginatedQueues() {
      const start = (this.pagination.currentPage - 1) * this.pagination.perPage;
      const end = start + this.pagination.perPage;
      return this.filteredQueues.slice(start, end);
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
