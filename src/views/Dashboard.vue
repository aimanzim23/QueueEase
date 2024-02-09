<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-lg-12">
        <div class="row">
          <div class="col-lg-3 col-md-6 col-12">
            <card
              title="Today's Users"
              :value="16"
              :percentage="stats.money.percentage"
              iconClass="ni ni-world"
              :iconBackground="stats.money.iconBackground"
              :detail="stats.money.detail"
              directionReverse
            ></card>
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <card
              title="Cancelled Visits"
              value="3"
              :percentage="stats.users.percentage"
              :iconClass="stats.users.iconClass"
              :iconBackground="stats.users.iconBackground"
              :detail="stats.users.detail"
              directionReverse
            ></card>
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <card
              title="Completed Visits"
              value="11"
              :percentage="stats.clients.percentage"
              :iconClass="stats.clients.iconClass"
              :iconBackground="stats.clients.iconBackground"
              :percentageColor="stats.clients.percentageColor"
              :detail="stats.clients.detail"
              directionReverse
            ></card>
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <card
              title="Today's Service Time"
              value="120 min"
              :percentage="stats.sales.percentage"
              :iconClass="stats.sales.iconClass"
              :iconBackground="stats.sales.iconBackground"
              :detail="stats.sales.detail"
              directionReverse
            ></card>
          </div>
        </div>
        <!-- <div class="row"> -->
        <div class="mb-lg">
          <!-- line chart -->
          <div class="card z-index-2">
            <gradient-line-chart />
          </div>
        </div>
        <!-- <div class="col-lg-5">
            <carousel />
          </div> -->
        <!-- </div> -->
        <div class="row mt-4">
          <div class="col-lg-7 mb-lg-0 mb-4">
            <div class="card">
              <div class="p-3 pb-0 card-header">
                <div class="d-flex justify-content-between">
                  <h6 class="mb-2">History</h6>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table align-items-center">
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
              </div>
            </div>
          </div>
          <div class="col-lg-5">
            <notification-card />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Card from "@/examples/Cards/Card.vue";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";

import NotificationCard from "./components/NotificationCard.vue";

export default {
  name: "dashboard-default",
  data() {
    return {
      stats: {
        money: {
          title: "Today's Money",
          value: "$53,000",
          percentage: "+55%",
          iconClass: "ni ni-money-coins",
          detail: "since yesterday",
          iconBackground: "bg-gradient-primary",
        },
        users: {
          title: "Today's Users",
          value: "2,300",
          percentage: "+3%",
          iconClass: "ni ni-world",
          iconBackground: "bg-gradient-danger",
          detail: "since last week",
        },
        clients: {
          title: "New Clients",
          value: "+3,462",
          percentage: "-2%",
          iconClass: "ni ni-paper-diploma",
          percentageColor: "text-danger",
          iconBackground: "bg-gradient-success",
          detail: "since last quarter",
        },
        sales: {
          title: "Sales",
          value: "$103,430",
          percentage: "+5%",
          iconClass: "ni ni-cart",
          iconBackground: "bg-gradient-warning",
          detail: "than last month",
        },
      },
    };
  },
  components: {
    Card,
    GradientLineChart,
    NotificationCard,
  },

  computed: {
    firstFourQueues() {
      // Filter the first four queues from formattedArchivedQueues
      return this.formattedArchivedQueues.slice(0, 4);
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
        const dateKey = new Date(queue.date).toLocaleDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: new Date(dateKey).toLocaleString(),
            queues: [],
            totalServiceTime: 0,
            cancelledVisits: 0,
            totalVisits: 0, // Initialize totalVisits
          };
        }
        acc[dateKey].queues.push(queue);
        acc[dateKey].totalVisits += 1; // Increment totalVisits for each queue
        if (queue.status === "Completed") {
          acc[dateKey].totalServiceTime += queue.serviceTime || 0;
        } else if (queue.status === "Cancelled") {
          acc[dateKey].cancelledVisits += 1;
        }
        return acc;
      }, {});

      return Object.values(groupedQueues);
    },
  },

  methods: {
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
      // Get the date components
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
    getDayOfWeek(timestamp) {
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const date = new Date(timestamp);
      const dayIndex = date.getDay();
      return daysOfWeek[dayIndex];
    },
    formatDuration(totalServiceTime) {
      // Implement a function to format duration as needed
      // You can convert milliseconds to a human-readable format
      const seconds = Math.floor(totalServiceTime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    },
    calculateTotalServiceTime(queues) {
      return queues
        .filter((queue) => queue.status === "Completed")
        .reduce((total, queue) => total + (queue.serviceTime || 0), 0);
    },
  },
  async created() {
    try {
      // Call the fetchArchivedQueues action when the component is created
      await this.$store.dispatch("fetchArchivedQueues");
      // Action completed, now you can access the archived queues
      console.log("Archived queues:", this.$store.getters.getArchivedQueues);
    } catch (error) {
      console.error("Error fetching archived queues:", error);
    }
  },
};
</script>
