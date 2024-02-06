<template>
  <div class="card">
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
            </tr>
          </thead>
          <tbody class="text-center">
            <tr v-for="(queue, index) in formattedArchivedQueues" :key="index">
              <td class="text-center text-secondary text-xs font-weight-bold">
                {{ queue.date }}
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
          acc[dateKey] = [];
        }
        acc[dateKey].push(queue);
        return acc;
      }, {});

      // Calculate totals for each date
      const result = Object.entries(groupedQueues).map(([date, queues]) => {
        return {
          date: new Date(date).toLocaleString(),
          totalServiceTime: this.calculateTotalServiceTime(queues),
          cancelledVisits: this.countCancelledVisits(queues),
        };
      });

      return result;
    },
  },
  methods: {
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString(); // Adjust the formatting as needed
    },
    getDayOfWeek(timestamp) {
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
