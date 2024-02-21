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
import axios from "axios";

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
      elapsedTime: 0,
      pagination: {
        currentPage: 1,
        perPage: 3,
        totalPages: 1,
      },
      selectedService: null,
      availableServices: [],
      formattedAverageServiceTime: "N/A",
      unsubscribeAverageServiceTime: null,
      formattedAverageWaitingTime: "N/A",
      unsubscribeAverageWaitingTime: null,
    };
  },
  methods: {
    sendNotification(queueNo) {
      const registrationToken =
        "dmwxwKquN70eFuMiTAI7DA:APA91bFQalUlyuqjxccDkW-ju7VwoFLBDRN66IDZoaINr3L_CHHoskU6ngM63JQiCKQ5ZXgOXxmHmZbOV_Z6iVO5SBikaKAIzJZOJK2R07z8ap_UR1-NMb0gg3aqi4g3zY0ZVB5Irbsv";
      const title = "QueueEase";
      const body = `Your queue number ${queueNo} is ready. Come here to get served!`;

      axios
        .post("http://localhost:3000/send-notification", {
          registrationToken,
          title,
          body,
        })
        .then((response) => {
          console.log("Notification sent successfully:", response.data);

          // Display a notification on the client side
          if (Notification.permission === "granted") {
            new Notification(title, { body });
          } else {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification(title, { body });
              }
            });
          }
        })
        .catch((error) => {
          console.error("Error sending notification:", error);
        });
    },
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
      const queueDate = new Date(dateTime).toLocaleDateString();
      return queueDate === today;
    },

    async inviteNextVisitor() {
      const filteredQueues = this.filteredQueues;
      if (filteredQueues.length > 0) {
        const nextQueue = filteredQueues.find(
          (queue) => queue.status === "Waiting"
        );

        if (nextQueue) {
          try {
            await this.ongoingQueue(nextQueue.id);
          } catch (error) {
            console.error("Error inviting next visitor:", error);
          }
        } else {
          console.log("No visitors in the waiting queue.");
        }
      } else {
        console.log("No visitors in the waiting queue.");
      }
    },

    async endVisit() {
      const filteredOngoing = this.filteredOngoing;
      const selectedService = this.selectedService;

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
      } else {
        console.log(
          "No ongoing visit found in the selected service within filtered queues."
        );
      }
    },

    async fetchServices() {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const servicesCollectionRef = collection(userDocRef, "services");

        try {
          const querySnapshot = await getDocs(servicesCollectionRef);
          this.availableServices = [];
          querySnapshot.forEach((doc) => {
            const serviceData = doc.data();

            this.availableServices.push({
              id: doc.id,
              serviceName: serviceData.serviceName,
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
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queuesCollectionRef = collection(userDocRef, "queues");

        try {
          let completedQueuesQuery;

          if (this.selectedService) {
            completedQueuesQuery = query(
              queuesCollectionRef,
              where("status", "==", "Completed"),
              where("service", "==", this.selectedService)
            );
          } else {
            completedQueuesQuery = query(
              queuesCollectionRef,
              where("status", "==", "Completed")
            );
          }

          const unsubscribe = onSnapshot(completedQueuesQuery, (snapshot) => {
            let totalServiceTime = 0;
            let numberOfCompletedQueues = 0;

            snapshot.forEach((queueDoc) => {
              const queueData = queueDoc.data();

              if (
                typeof queueData.serviceTime === "number" &&
                !isNaN(queueData.serviceTime)
              ) {
                totalServiceTime += queueData.serviceTime;
                numberOfCompletedQueues++;
              }
            });

            const averageServiceTime =
              numberOfCompletedQueues > 0
                ? totalServiceTime / numberOfCompletedQueues
                : 0;

            this.formattedAverageServiceTime = isNaN(averageServiceTime)
              ? "N/A"
              : this.formatServiceTime(averageServiceTime);
          });

          this.unsubscribeAverageServiceTime = unsubscribe;
        } catch (error) {
          console.error("Error calculating average service time:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },

    async calculateAverageWaitingTime() {
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queuesCollectionRef = collection(userDocRef, "queues");

        try {
          let completedQueuesQuery;

          if (this.selectedService) {
            completedQueuesQuery = query(
              queuesCollectionRef,
              where("status", "==", "Completed"),
              where("service", "==", this.selectedService)
            );
          } else {
            completedQueuesQuery = query(
              queuesCollectionRef,
              where("status", "==", "Completed")
            );
          }

          const unsubscribe = onSnapshot(completedQueuesQuery, (snapshot) => {
            let totalWaitingTime = 0;
            let numberOfCompletedQueues = 0;

            snapshot.forEach((queueDoc) => {
              const queueData = queueDoc.data();

              if (
                typeof queueData.waitingTime === "number" &&
                !isNaN(queueData.waitingTime)
              ) {
                totalWaitingTime += queueData.waitingTime;
                numberOfCompletedQueues++;
              }
            });

            const averageWaitingTime =
              numberOfCompletedQueues > 0
                ? totalWaitingTime / numberOfCompletedQueues
                : 0;

            this.formattedAverageWaitingTime = isNaN(averageWaitingTime)
              ? "N/A"
              : this.formatServiceTime(averageWaitingTime);
          });

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
          const queueDocSnapshot = await getDoc(queueDocRef);
          const queueData = queueDocSnapshot.data();

          if (queueData.status === "Waiting") {
            const waitingTime = Date.now() - queueData.date;

            await updateDoc(queueDocRef, {
              status: "Ongoing",
              startTime: Date.now(),
              waitingTime: waitingTime,
            });
            this.sendNotification(queueData.queueNo);

            this.startTimer();
            this.isOngoingQueueForService = false;

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
          const completedTimestamp = Date.now();

          const queueDocSnapshot = await getDoc(queueDocRef);
          const queueData = queueDocSnapshot.data();

          const serviceTime = completedTimestamp - queueData.startTime;

          await updateDoc(queueDocRef, {
            status: "Completed",
            completedTime: completedTimestamp,
            serviceTime: serviceTime,
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
        this.elapsedTime += 1000;
      }, 1000);
    },
    stopTimer() {
      clearInterval(this.timerInterval);

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

        this.$store.commit("setQueues", queues);

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
        localStorage.setItem("selectedService", newValue);
      },
    ],
    filteredQueues() {
      this.pagination.totalPages = Math.ceil(
        this.filteredQueues.length / this.pagination.perPage
      );
    },
  },
  computed: {
    isOngoingForSelectedService() {
      if (!this.selectedService) {
        return false;
      }

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
        : this.queues;

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
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
}

.text-bg-primary {
  background-color: #007bff;
}

.text-bg-secondary {
  background-color: #6c757d;
}

.text-bg-success {
  background-color: #28a745;
}
.circular-buttons-container {
  display: flex;
}

.circular-button {
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-right: 10px;
  transition: background-color 0.3s;
}

.tick-button {
  background-color: #28a745;
  color: white;
}

.tick-button:hover {
  background-color: #218838;
}

.call-button {
  background-color: #007bff;
  color: white;
}

.call-button:hover {
  background-color: #0056b3;
}

.trash-button {
  background-color: #dc3545;
  color: white;
}

.trash-button:hover {
  background-color: #c82333;
}

.circular-button i {
  font-size: 16px;
}
.circular-button:disabled,
.circular-button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
