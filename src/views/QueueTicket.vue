<template>
  <div>
    <!-- Tabs Navigation -->
    <ul class="nav nav-underline flex-column flex-sm-row">
      <li class="nav-item flex-fill">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'eTicket' }"
          @click="setActiveTab('eTicket')"
        >
          E-Ticket
        </a>
      </li>
      <li class="nav-item flex-fill">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'liveQueue' }"
          @click="setActiveTab('liveQueue')"
        >
          Live Queue
        </a>
      </li>
      <li class="nav-item flex-fill">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'announcement' }"
          @click="setActiveTab('announcement')"
        >
          Announcement
        </a>
      </li>
    </ul>

    <!-- Tab Content -->
    <div v-show="activeTab === 'eTicket'">
      <div class="card mx-4">
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
              <p v-if="currentQueue">
                Current Queue: {{ currentQueue.queueNo }}
              </p>
              <p v-else>No ongoing queue</p>
              <p>
                Keep an eye on the ticket calls, {{ selectedQueue.userName }}!
              </p>
              <p>Average Waiting Time: {{ averageWaitingTime }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-4">
        <!-- Enable Notification Button -->
        <button
          type="button"
          class="btn btn-primary btn-sm mx-3"
          @click="showNotificationModal = true"
        >
          <i class="fas fa-bell"></i> Notification
        </button>

        <!-- Notification Modal -->
        <div
          class="modal"
          tabindex="-1"
          role="dialog"
          style="display: block"
          v-if="showNotificationModal"
        >
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Notification</h5>
                <button
                  type="button"
                  class="btn-close"
                  @click="closeCancelConfirmation"
                  aria-label="Close"
                ></button>
                <span
                  aria-hidden="true"
                  style="font-size: 1.5rem; cursor: pointer"
                  @click="closeCancelConfirmation"
                  >&times;</span
                >
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-6">
                    <button
                      class="btn btn-primary"
                      style="width: 100%"
                      @click="enableNotifications"
                    >
                      Enable
                    </button>
                  </div>
                  <div class="col-6">
                    <button
                      class="btn btn-secondary"
                      style="width: 100%"
                      @click="closeNotificationModal"
                    >
                      Disable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancel Queue Button -->
        <button
          type="button"
          class="btn btn-danger btn-sm"
          @click="showCancelModal = true"
        >
          Cancel Queue
        </button>

        <!-- Cancel Queue Modal -->
        <div
          class="modal"
          tabindex="-1"
          role="dialog"
          style="display: block"
          v-if="showCancelModal"
        >
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Cancel Queue</h5>
                <button
                  type="button"
                  class="btn-close"
                  @click="showCancelModal = false"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-6">
                    <button
                      class="btn btn-danger"
                      style="width: 100%"
                      @click="cancelQueue"
                    >
                      Yes
                    </button>
                  </div>
                  <div class="col-6">
                    <button
                      class="btn btn-secondary"
                      style="width: 100%"
                      @click="closeCancelConfirmation"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Background overlay -->
        <div
          class="modal-backdrop"
          v-if="showNotificationModal || showCancelModal"
          @click="closeModals"
        ></div>
      </div>
    </div>

    <!-- Tab Content -->
    <div v-show="activeTab === 'liveQueue'">
      <div>
        <div class="row justify-content-center">
          <div class="col-sm-12 col-md-8 col-lg-6">
            <div>
              <div v-if="isLiveQueuesLoaded">
                <!-- Ongoing Queues Card -->
                <div class="card">
                  <div class="mt-1 text-center">
                    <p class="time-info">{{ currentTime }} {{ currentDate }}</p>
                  </div>
                  <div v-if="ongoingQueues.length > 0">
                    <h4 class="card-title">Now Serving</h4>
                    <div class="mx-4">
                      <live-queue-card
                        v-for="queue in ongoingQueues.slice(0, 4)"
                        :key="queue.queueId"
                        :label="'Number'"
                        :value="queue.queueNo"
                        :serviceLabel="'Service:'"
                        :serviceName="queue.service"
                      />
                    </div>
                  </div>
                  <div v-else>
                    <p class="no-queues-msg">No Ongoing Queues</p>
                  </div>

                  <!-- Waiting Queues Card -->
                  <div v-if="waitingQueues.length > 0">
                    <h4 class="card-title">Next</h4>
                    <div class="live-queue-list">
                      <live-queue-card
                        v-for="queue in waitingQueues.slice(0, 4)"
                        :key="queue.queueId"
                        :label="'Number'"
                        :value="queue.queueNo"
                        :serviceLabel="'Service:'"
                        :serviceName="queue.service"
                      />
                    </div>
                  </div>
                  <div v-else>
                    <p class="no-queues-msg">No Waiting Queues</p>
                  </div>
                </div>
              </div>
              <div v-else>
                <p class="loading-msg">Loading live queues...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Tab Content -->
    <div v-show="activeTab === 'announcement'">
      <div class="card p-3 m-3" style="max-height: 600px; overflow-y: auto">
        <template v-if="postedAnnouncements.length > 0">
          <div
            v-for="(announcement, index) in postedAnnouncements"
            :key="index"
            class="mb-4 card"
          >
            <div class="p-3 card-body">
              <div class="d-flex">
                <div>
                  <div class="numbers">
                    <p class="mb-0 text-sm text-uppercase font-weight-bold">
                      {{ announcement.title }}
                    </p>
                    <h5 class="font-weight-bolder">
                      {{ announcement.content }}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <p class="text-center">No announcements available.</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/main";
import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import LiveQueueCard from "./components/LiveQueueCard.vue";

export default {
  name: "QueueTicket",
  components: { LiveQueueCard },
  data() {
    return {
      queueData: null,
      selectedQueueId: this.$route.params.queueId,
      selectedQueue: null,
      currentQueue: null,
      activeTab: "eTicket",
      isDataLoaded: false,
      liveQueues: [],
      isLiveQueuesLoaded: false,
      postedAnnouncements: [],
      averageWaitingTime: "N/A",
      totalQueues: 0,
      showNotificationModal: false,
      showCancelModal: false,
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
    currentDate() {
      const today = new Date();
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return today.toLocaleDateString("en-GB", options);
    },

    currentTime() {
      const now = new Date();
      const options = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
      return now.toLocaleTimeString("en-US", options);
    },
  },
  methods: {
    closeCancelConfirmation() {
      this.showCancelModal = false;
    },
    closeModals() {
      this.showNotificationModal = false;
      this.showCancelModal = false;
    },
    async cancelQueue() {
      try {
        const userId = this.$route.params.userId;
        const routeQueueId = this.$route.params.queueId;

        const queuesCollectionRef = collection(db, "users", userId, "queues");

        const querySnapshot = await getDocs(
          query(queuesCollectionRef, where("queueId", "==", routeQueueId))
        );

        if (!querySnapshot.empty) {
          const queueDoc = querySnapshot.docs[0];
          const queueDocRef = doc(db, "users", userId, "queues", queueDoc.id);

          await updateDoc(queueDocRef, {
            status: "Cancelled",
          });

          // Display an alert to the user
          window.alert("Queue cancelled successfully!");

          // // Route back to the join page
          this.$router.push(`/thankyou`);
        } else {
          console.error("No queue found with the specified queueId.");
        }
      } catch (error) {
        console.error("Error cancelling queue:", error);
      }
    },
    async fetchAnnouncements() {
      try {
        // Extract userId from the URL parameter
        const userId = this.$route.params.userId;

        // Construct the announcements collection reference
        const announcementsCollectionRef = collection(
          db,
          "users",
          userId, // Use the extracted userId here
          "announcements"
        );

        // Fetch documents from Firestore
        const querySnapshot = await getDocs(announcementsCollectionRef);

        // Update the postedAnnouncements array
        this.postedAnnouncements = querySnapshot.docs.map((doc) => {
          const announcementData = doc.data();
          return {
            id: doc.id,
            ...announcementData,
          };
        });
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    },

    async fetchQueueData() {
      try {
        const userId = this.$route.params.userId;
        const queuesCollectionRef = collection(db, "users", userId, "queues");

        onSnapshot(queuesCollectionRef, (querySnapshot) => {
          this.queueData = querySnapshot.docs.map((doc) => doc.data());

          this.selectedQueue = this.queueData.find(
            (queue) => queue.queueId === this.selectedQueueId
          );

          if (this.selectedQueue && this.selectedQueue.status === "Completed") {
            window.alert(
              "Thank you for using Queue Ease! Visit our website on www.queueease.com."
            );

            this.$router.push(`/thankyou`);
          }

          this.currentQueue = this.queueData.find(
            (queue) =>
              queue.service === this.selectedQueue.service &&
              queue.status === "Ongoing"
          );

          if (!this.currentQueue) {
            this.currentQueue = "No ongoing queues";
          }

          this.isDataLoaded = true;
        });
      } catch (error) {
        console.error("Error fetching queue data:", error);
      }
    },
    async calculateAverageWaitingTime() {
      try {
        const userId = this.$route.params.userId;

        const queuesCollectionRef = collection(db, "users", userId, "queues");

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

          console.log(
            "Total waiting time of completed queues:",
            totalWaitingTime
          );
          console.log("Number of Completed Queues:", numberOfCompletedQueues);
          console.log(
            "Average waiting time of completed queues:",
            averageWaitingTime
          );

          this.averageWaitingTime = isNaN(averageWaitingTime)
            ? "N/A"
            : this.formatServiceTime(averageWaitingTime);

          console.log(
            "Formatted Average Waiting Time:",
            this.averageWaitingTime
          );
        });

        this.unsubscribeAverageWaitingTime = unsubscribe;
      } catch (error) {
        console.error("Error calculating average waiting time:", error);
      }
    },
    async fetchLiveQueues() {
      console.log("Fetching live queues...");
      try {
        const userId = this.$route.params.userId;
        const queuesCollectionRef = collection(db, "users", userId, "queues");

        onSnapshot(queuesCollectionRef, (querySnapshot) => {
          this.queueData = querySnapshot.docs.map((doc) => doc.data());

          this.ongoingQueues = this.queueData.filter(
            (queue) => queue.status === "Ongoing"
          );

          this.waitingQueues = this.queueData.filter(
            (queue) => queue.status === "Waiting"
          );

          this.totalQueues =
            this.ongoingQueues.length + this.waitingQueues.length;

          console.log("Ongoing Queues:", this.ongoingQueues);

          console.log("Waiting Queues:", this.waitingQueues);

          this.isLiveQueuesLoaded = true;
        });
      } catch (error) {
        console.error("Error fetching live queues:", error);
      }
    },

    setActiveTab(tab) {
      if (this.isDataLoaded) {
        this.activeTab = tab;

        if (tab === "liveQueue") {
          this.fetchLiveQueues();
        }
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
  },
  async created() {
    try {
      await this.calculateAverageWaitingTime();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },

  mounted() {
    this.fetchQueueData();
    this.fetchAnnouncements();
  },
};
</script>

<style scoped>
.nav-underline {
  display: flex;
  margin-bottom: 1rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  color: white;
  text-decoration: none;
  background-color: transparent;
  border: none;
  width: 100%;
  text-align: center;
}

.nav-link.active {
  border-bottom: 2px solid #474646;
  color: #474646;
}

.nav-link:hover {
  border-bottom: 2px solid #474646;
}

.live-queue-container {
  padding: 20px;
}

.time-info {
  font-size: 18px;
  color: #555;
}

.live-queues-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.live-card {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 20px;
  padding: 16px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-left: 20px;
  color: #555;
}

.live-queue-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.live-queue-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 10px;
  padding: 12px;
  width: 45%;
  box-sizing: border-box;
  text-align: center;
}

.queue-number {
  font-size: 2em;
  font-weight: bold;
  color: #555;
}

.service {
  margin-top: 8px;
  color: #555;
}

.no-queues-msg,
.loading-msg {
  font-size: 18px;
  color: #555;
  margin-top: 20px;
  text-align: center;
}
.modal-backdrop {
  background: rgba(0, 0, 0, 0.5);
}
</style>
