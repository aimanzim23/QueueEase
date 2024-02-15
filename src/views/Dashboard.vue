<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-lg-12">
        <div class="row">
          <div class="col-lg-3 col-md-6 col-12">
            <card
              title="Today's Users"
              :value="totalVisitsToday"
              iconClass="fas fa-users"
              iconBackground="bg-gradient-primary"
              directionReverse
            ></card>
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <card
              title="Completed Queues"
              :value="totalCompletedToday"
              iconClass="fas fa-check-circle"
              iconBackground="bg-gradient-success"
              percentageColor="text-danger"
              directionReverse
            ></card>
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <card
              title="Average Waiting Time"
              :value="formattedAverageWaitingTime"
              iconClass="fas fa-hourglass-half"
              iconBackground="bg-gradient-danger"
              directionReverse
            ></card>
          </div>

          <div class="col-lg-3 col-md-6 col-12">
            <card
              title="Today's Service Time"
              :value="formatServiceTime(totalServiceTimeToday)"
              iconClass="fas fa-clock"
              iconBackground="bg-gradient-warning"
              directionReverse
            ></card>
          </div>
        </div>

        <div class="row">
          <!-- Place both graphs side by side in a single row -->
          <div class="col-lg-6">
            <div class="card z-index-2">
              <gradient-line-chart />
            </div>
          </div>
          <div class="col-lg-6">
            <div class="card z-index-2">
              <graph />
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-lg-7 mb-lg-0 mb-4">
            <div class="card">
              <div class="p-3 pb-0 card-header">
                <div class="d-flex justify-content-between">
                  <h6 class="mb-2">History</h6>
                </div>
              </div>
              <div class="table-responsive">
                <table
                  v-if="firstFourQueues.length > 0"
                  class="table align-items-center"
                >
                  <tbody>
                    <tr v-for="(queue, index) in firstFourQueues" :key="index">
                      <td class="w-30">
                        <div class="px-2 py-1 d-flex align-items-center">
                          <div class="ms-4">
                            <p class="mb-0 text-xs font-weight-bold">Date:</p>
                            <h6 class="mb-0 text-sm">
                              {{ formatDate(queue.date) }}
                            </h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="text-center">
                          <p class="mb-0 text-xs font-weight-bold">Day:</p>
                          <h6 class="mb-0 text-sm">
                            {{ getDayOfWeek(queue.date) }}
                          </h6>
                        </div>
                      </td>
                      <td>
                        <div class="text-center">
                          <p class="mb-0 text-xs font-weight-bold">
                            Total Visit:
                          </p>
                          <h6 class="mb-0 text-sm">{{ queue.totalVisits }}</h6>
                        </div>
                      </td>
                      <td class="text-sm align-middle">
                        <div class="text-center col">
                          <p class="mb-0 text-xs font-weight-bold">Duration:</p>
                          <h6 class="mb-0 text-sm">
                            {{ formatDuration(queue.totalServiceTime) }}
                          </h6>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-center">History is not available.</p>
              </div>
            </div>
          </div>
          <div class="col-lg-5">
            <announcement-card />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "@/examples/Cards/Card.vue";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";
import Graph from "@/views/components/Graph.vue";
import AnnouncementCard from "./components/AnnouncementCard.vue";
import {
  onSnapshot,
  doc,
  collection,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db, auth } from "@/main";

export default {
  name: "dashboard-default",
  data() {
    return {
      allQueues: [],
      totalVisitsToday: 0,
      totalCancelledToday: 0,
      totalCompletedToday: 0,
      totalServiceTimeToday: 0,
      formattedAverageWaitingTime: "N/A",
    };
  },
  components: {
    Card,
    GradientLineChart,
    Graph,
    AnnouncementCard,
  },

  computed: {
    firstFourQueues() {
      // Create a copy of formattedArchivedQueues for sorting
      const sortedQueues = [...this.formattedArchivedQueues];

      // Sort queues by date in descending order
      sortedQueues.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Take the latest four queues
      return sortedQueues.slice(0, 4).map((queue) => ({
        ...queue,
        formattedDate: this.formatDate(queue.date),
      }));
    },
    formattedArchivedQueues() {
      const archivedQueues = this.$store.getters.getArchivedQueues;

      // Flatten the object into an array of queues
      const allQueues = Object.values(archivedQueues).reduce(
        (acc, queue) => acc.concat(queue),
        []
      );

      // Group queues by date
      const groupedQueues = allQueues.reduce((acc, queue) => {
        const timestamp = queue.date;
        if (!timestamp || isNaN(timestamp)) {
          console.log("Invalid timestamp:", timestamp);
          return acc;
        }

        const dateKey = this.formatDate(timestamp);
        if (!dateKey || dateKey === "-") {
          console.log("Invalid date key:", dateKey);
          return acc;
        }

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: this.formatDate(timestamp),
            queues: [],
            totalServiceTime: 0,
            cancelledVisits: 0,
            totalVisits: 0, // Add totalVisits property
          };
        }

        acc[dateKey].queues.push(queue);

        // Increment totalVisits for each queue
        acc[dateKey].totalVisits += 1;

        if (queue.status === "Completed") {
          acc[dateKey].totalServiceTime += queue.serviceTime || 0;
        } else if (queue.status === "Cancelled") {
          acc[dateKey].cancelledVisits += 1;
        }

        return acc;
      }, {});

      console.log("allQueues:", allQueues);
      console.log("groupedQueues:", groupedQueues);
      return Object.values(groupedQueues);
    },
    totalsToday() {
      return this.calculateTotalsToday();
    },
  },

  methods: {
    async calculateAverageWaitingTime() {
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queuesCollectionRef = collection(userDocRef, "queues");

        try {
          const completedQueuesQuery = query(
            queuesCollectionRef,
            where("status", "==", "Completed")
          );

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

            // Update the formattedAverageWaitingTime property
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

    getDayOfWeek(date) {
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayIndex = new Date(date).getDay();
      return daysOfWeek[dayIndex];
    },
    async fetchAllQueues() {
      try {
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;
          const userDocRef = doc(db, "users", userId);
          const queuesCollectionRef = collection(userDocRef, "queues");

          await onSnapshot(
            query(queuesCollectionRef, orderBy("date")),
            (snapshot) => {
              this.allQueues = snapshot.docs.map((doc) => doc.data());

              // Calculate totals for today after fetching queues
              this.calculateTotalsToday();
            }
          );
        }
      } catch (error) {
        console.error("Error fetching queues:", error);
      }
    },

    calculateTotalsToday() {
      const todayKey = new Date().toLocaleDateString();
      const todayQueues = this.allQueues.filter((queue) => {
        const queueDate = new Date(queue.date).toLocaleDateString();
        return queueDate === todayKey;
      });

      this.totalVisitsToday = todayQueues.length;
      this.totalCompletedToday = todayQueues.filter(
        (queue) => queue.status === "Completed"
      ).length;
      this.totalCancelledToday = todayQueues.filter(
        (queue) => queue.status === "Cancelled"
      ).length;
      this.totalServiceTimeToday = this.calculateTotalServiceTime(todayQueues);
    },

    calculateTotalServiceTime(queues) {
      return queues.reduce((total, queue) => {
        return total + (queue.serviceTime || 0);
      }, 0);
    },

    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(); // Adjust the formatting as needed
    },
    formatServiceTime(serviceTime) {
      if (serviceTime === null || isNaN(serviceTime)) {
        return "-";
      }
      const seconds = Math.floor(serviceTime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      const formattedTime = `${String(hours).padStart(2, "0")}h ${String(
        minutes % 60
      ).padStart(2, "0")}m ${String(seconds % 60).padStart(2, "0")}s`;

      return formattedTime;
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);

      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${month}/${day}/${year}`;
    },

    formatDuration(totalServiceTime) {
      // Implement a function to format duration as needed
      // You can convert milliseconds to a human-readable format
      const seconds = Math.floor(totalServiceTime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    },
  },
  async created() {
    try {
      await this.$store.dispatch("fetchArchivedQueues");
      this.fetchAllQueues();
      await this.calculateAverageWaitingTime();
    } catch (error) {
      console.error("Error fetching archived queues:", error);
    }
  },
};
</script>
