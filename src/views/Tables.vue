<template>
  <div class="card p-4 m-4">
    <div
      class="card-header pb-0 d-flex justify-content-between align-items-center"
    >
      <h6 class="mb-0">History</h6>
    </div>

    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table align-items-center mb-0">
          <thead>
            <tr>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Date
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Day
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Duration (Total Service Time)
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Cancelled Visits
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody class="text-center">
            <tr v-for="(queue, index) in formattedArchivedQueues" :key="index">
              <td class="text-center text-secondary text-xs font-weight-bold">
                {{ formatDate(queue.date) }}
              </td>
              <td class="text-center text-secondary text-xs font-weight-bold">
                {{ getDayOfWeek(queue.date) }}
              </td>
              <td class="text-center text-secondary text-xs font-weight-bold">
                {{ formatDuration(queue.totalServiceTime) }}
              </td>
              <td class="text-center text-secondary text-xs font-weight-bold">
                {{ queue.cancelledVisits }}
              </td>
              <td>
                <div @click="toggleCollapse(index)" class="icon-container">
                  <i
                    class="fas"
                    :class="
                      isExpanded(index)
                        ? 'fa-chevron-up fa-xs'
                        : 'fa-chevron-down fa-xs'
                    "
                  ></i>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-for="(queue, index) in formattedArchivedQueues"
        :key="'expand-' + index"
      >
        <div v-if="isExpanded(index)">
          <div class="table-responsive p-0">
            <table class="table">
              <thead>
                <tr>
                  <th
                    class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                  >
                    # & Service
                  </th>
                  <th
                    class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                  >
                    Name
                  </th>
                  <th
                    class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                  >
                    Service Time
                  </th>
                  <th
                    class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                  >
                    Time
                  </th>
                  <th
                    class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                  >
                    Status
                  </th>
                  <!-- Add more columns if needed -->
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(queueItem, itemIndex) in queue.queues"
                  :key="'sub-' + itemIndex"
                >
                  <td>
                    <h6 class="text-center mb-0 text-xs">
                      {{ queueItem.queueNo }}
                    </h6>
                    <p
                      class="text-center text-secondary text-xs font-weight-bold"
                    >
                      {{ queueItem.service }}
                    </p>
                  </td>
                  <td>
                    <h6 class="text-center mb-0 text-xs">
                      {{ queueItem.userName }}
                    </h6>
                    <p
                      class="text-center text-secondary text-xs font-weight-bold"
                    >
                      {{ queueItem.phoneNumber }}
                    </p>
                  </td>
                  <td
                    class="text-center text-secondary text-xs font-weight-bold"
                  >
                    {{ formatServiceTime(queueItem.serviceTime) }}
                  </td>
                  <td
                    class="text-center text-secondary text-xs font-weight-bold"
                  >
                    {{ formatTime(queueItem.date) }}
                  </td>
                  <td
                    class="text-center text-secondary text-xs font-weight-bold"
                  >
                    {{ queueItem.status }}
                  </td>
                  <!-- Add more columns if needed -->
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      expandedIndex: null,
    };
  },
  computed: {
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
          };
        }
        acc[dateKey].queues.push(queue);
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
    countCancelledVisits(queues) {
      return (
        (queues &&
          Array.isArray(queues) &&
          queues.filter(
            (queue) => queue && queue.status && queue.status === "Cancelled"
          ).length) ||
        0
      );
    },
    toggleCollapse(index) {
      // Toggle collapse for the selected index
      this.expandedIndex = this.expandedIndex === index ? null : index;
    },
    isExpanded(index) {
      // Check if the table is expanded for a specific index
      return this.expandedIndex === index;
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

<style scoped>
.icon-container {
  cursor: pointer;
  font-size: 1.5rem; /* Adjust the size as needed */
  color: grey; /* Set the default color */
}

.icon-container:hover {
  color: grey; /* Set the hover color */
}
</style>
