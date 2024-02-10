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
          title="Avg Service Time"
          :value="formattedAverageServiceTime"
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
                      : "---"
                  }}
                </div>
                <div v-else class="display-1" style="color: grey">---</div>
              </div>
              <div>
                <timer
                  :startTimer="startTimer"
                  :stopTimer="stopTimer"
                  :elapsedTime="elapsedTime"
                />
              </div>

              <div class="text-center mt-5">
                <div class="d-flex justify-content-center">
                  <button
                    type="button"
                    class="btn btn-primary btn-md mx-2"
                    style="background-color: primary"
                    @click="inviteNextVisitor"
                    :disabled="!selectedService || isOngoingForSelectedService"
                  >
                    <i class="fas fa-bell"></i> Call Next
                  </button>
                  <button
                    type="button"
                    class="btn btn-warning btn-md mx-2"
                    @click="noShow"
                  >
                    <i class="fas fa-ban"></i> No Show
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary btn-md mx-2"
                    style="background-color: red"
                    @click="endVisit"
                    :disabled="!selectedService"
                  >
                    😊 End Visit
                  </button>
                </div>
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

    <queue-table :queues="queues" :selectedService="selectedService" />
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
  where,
} from "firebase/firestore";
import { db, auth } from "@/main";
import QueueModal from "./QueueModal.vue";
import Timer from "./Timer.vue";
import WaitingList from "./WaitingList.vue";
import Card from "@/examples/Cards/Card.vue";
import QueueTable from "./QueueTable.vue";

export default {
  name: "queue-list",
  components: { QueueModal, Timer, WaitingList, Card, QueueTable },
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
      formattedAverageServiceTime: "N/A",
      unsubscribeAverageServiceTime: null,
      formattedAverageWaitingTime: "N/A",
      unsubscribeAverageWaitingTime: null,
    };
  },
  methods: {
    async noShow() {
      const filteredOngoing = this.filteredOngoing;
      const selectedService = this.selectedService;

      const ongoingVisit = filteredOngoing.find(
        (queue) =>
          queue.status === "Ongoing" && queue.service === selectedService
      );

      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated.");
        return;
      }

      const userId = user.uid;

      if (ongoingVisit) {
        const queueDocRef = doc(db, "users", userId, "queues", ongoingVisit.id);

        try {
          // Update the queue status to 'No Show'
          await updateDoc(queueDocRef, {
            status: "No Show",
          });

          console.log("Status updated successfully to 'No Show'.");
          this.stopTimer();
        } catch (error) {
          console.error("Error updating status:", error);
        }
      } else {
        console.log(
          "No ongoing visit found in the selected service within filtered queues."
        );
      }
    },
    isSameDate(dateTime, today) {
      // Assuming 'date' is a property in your queue object
      const queueDate = new Date(dateTime).toLocaleDateString();
      return queueDate === today;
    },
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

    async calculateAverageServiceTime() {
      console.log("Service selected:", this.selectedService);
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queuesCollectionRef = collection(userDocRef, "queues");

        try {
          // Query completed queues based on the selected service
          let completedQueuesQuery;

          if (this.selectedService) {
            completedQueuesQuery = query(
              queuesCollectionRef,
              where("status", "==", "Completed"),
              where("service", "==", this.selectedService)
            );
          } else {
            // If no service is selected, query all completed queues
            completedQueuesQuery = query(
              queuesCollectionRef,
              where("status", "==", "Completed")
            );
          }

          // Listen for real-time updates using onSnapshot
          const unsubscribe = onSnapshot(completedQueuesQuery, (snapshot) => {
            let totalServiceTime = 0;
            let numberOfCompletedQueues = 0;

            // Iterate through completed queues
            snapshot.forEach((queueDoc) => {
              const queueData = queueDoc.data();

              // Ensure the queue has a valid numeric service time
              if (
                typeof queueData.serviceTime === "number" &&
                !isNaN(queueData.serviceTime)
              ) {
                // Accumulate the total service time and increment the count
                totalServiceTime += queueData.serviceTime;
                numberOfCompletedQueues++;
              }
            });

            // Calculate average service time
            const averageServiceTime =
              numberOfCompletedQueues > 0
                ? totalServiceTime / numberOfCompletedQueues
                : 0;

            console.log(
              "Total service time of completed queues (numeric):",
              totalServiceTime
            );

            // Log the total service time in a formatted manner
            const formattedTotalServiceTime = this.formatServiceTime(
              totalServiceTime
            );

            console.log(
              "Total service time of completed queues (formatted):",
              formattedTotalServiceTime
            );

            console.log("Number of Completed Queues:", numberOfCompletedQueues);
            console.log(
              "Average service time of completed queues:",
              averageServiceTime
            );

            // Update the formattedAverageServiceTime property
            this.formattedAverageServiceTime = isNaN(averageServiceTime)
              ? "N/A"
              : this.formatServiceTime(averageServiceTime);

            console.log(
              "Formatted Average Service Time:",
              this.formattedAverageServiceTime
            );
          });

          // Save the unsubscribe function in a component data property to be used later
          this.unsubscribeAverageServiceTime = unsubscribe;
        } catch (error) {
          console.error("Error calculating average service time:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },

    async calculateAverageWaitingTime() {
      console.log("Service selected:", this.selectedService);
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queuesCollectionRef = collection(userDocRef, "queues");

        try {
          // Query completed queues based on the selected service
          let completedQueuesQuery;

          if (this.selectedService) {
            completedQueuesQuery = query(
              queuesCollectionRef,
              where("status", "==", "Completed"),
              where("service", "==", this.selectedService)
            );
          } else {
            // If no service is selected, query all completed queues
            completedQueuesQuery = query(
              queuesCollectionRef,
              where("status", "==", "Completed")
            );
          }

          // Listen for real-time updates using onSnapshot
          const unsubscribe = onSnapshot(completedQueuesQuery, (snapshot) => {
            let totalWaitingTime = 0;
            let numberOfCompletedQueues = 0;

            // Iterate through completed queues
            snapshot.forEach((queueDoc) => {
              const queueData = queueDoc.data();

              // Ensure the queue has a valid numeric waiting time
              if (
                typeof queueData.waitingTime === "number" &&
                !isNaN(queueData.waitingTime)
              ) {
                // Accumulate the total waiting time and increment the count
                totalWaitingTime += queueData.waitingTime;
                numberOfCompletedQueues++;
              }
            });

            // Calculate average waiting time
            const averageWaitingTime =
              numberOfCompletedQueues > 0
                ? totalWaitingTime / numberOfCompletedQueues
                : 0;

            console.log(
              "Total waiting time of completed queues (numeric):",
              totalWaitingTime
            );

            // Log the total waiting time in a formatted manner
            const formattedTotalWaitingTime = this.formatServiceTime(
              totalWaitingTime
            );

            console.log(
              "Total waiting time of completed queues (formatted):",
              formattedTotalWaitingTime
            );

            console.log("Number of Completed Queues:", numberOfCompletedQueues);
            console.log(
              "Average waiting time of completed queues:",
              averageWaitingTime
            );

            // Update the formattedAverageWaitingTime property
            this.formattedAverageWaitingTime = isNaN(averageWaitingTime)
              ? "N/A"
              : this.formatServiceTime(averageWaitingTime);

            console.log(
              "Formatted Average Waiting Time:",
              this.formattedAverageWaitingTime
            );
          });

          // Save the unsubscribe function in a component data property to be used later
          this.unsubscribeAverageWaitingTime = unsubscribe;
        } catch (error) {
          console.error("Error calculating average waiting time:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },

    beforeDestroy() {
      if (this.unsubscribeAverageServiceTime) {
        this.unsubscribeAverageServiceTime();
      }

      if (this.unsubscribeAverageWaitingTime) {
        this.unsubscribeAverageWaitingTime();
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
          if (queueData.status === "Waiting") {
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
  created() {
    this.calculateAverageServiceTime();
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
    selectedService: [
      "calculateAverageServiceTime",
      (newValue) => {
        // Update local storage when the selected service changes
        localStorage.setItem("selectedService", newValue);
      },
    ],
    filteredQueues() {
      // Recalculate total pages when the filteredQueues data changes
      this.pagination.totalPages = Math.ceil(
        this.filteredQueues.length / this.pagination.perPage
      );
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
      // const today = new Date().toLocaleDateString(); // Get the current date in string format

      let filtered = this.queues;

      if (this.selectedService) {
        filtered = filtered.filter(
          (queue) => queue.service === this.selectedService
        );
      }

      filtered = filtered.filter(
        (queue) => queue.status === "Waiting" || queue.status === "No Show"
      );
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
