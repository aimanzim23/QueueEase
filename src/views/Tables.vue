<template>
  <div class="card">
    <div
      class="card-header pb-0 d-flex justify-content-between align-items-center"
    >
      <h6 class="mb-0">History</h6>
      <input type="date" v-model="selectedDate" id="selectedDate" />
    </div>

    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table align-items-center mb-0">
          <thead>
            <tr>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Name
              </th>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                style="width: 80px"
              >
                Queue No.
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Date
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Service
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Status
              </th>
              <!-- Add more headers as needed -->
            </tr>
          </thead>
          <tbody class="text-center">
            <tr
              v-for="(archivedQueue, index) in paginatedArchivedQueues"
              :key="index"
            >
              <td>
                <h6 class="mb-0 text-sm">{{ archivedQueue.userName }}</h6>
                <p class="text-xs text-secondary mb-0">
                  {{ archivedQueue.phoneNumber }}
                </p>
              </td>
              <td class="text-secondary text-xs font-weight-bold">
                #{{ archivedQueue.queueNo }}
              </td>
              <td class="text-secondary text-xs font-weight-bold">
                {{ formatDate(archivedQueue.date) }}
              </td>
              <td class="text-secondary text-xs font-weight-bold">
                {{ archivedQueue.service }}
              </td>
              <td class="mb-0 text-sm">
                <span
                  v-if="archivedQueue.status === 'Ongoing'"
                  class="badge text-bg-primary"
                  >Ongoing</span
                >
                <span
                  v-else-if="archivedQueue.status === 'Waiting'"
                  class="badge text-bg-secondary"
                  >Waiting</span
                >
                <span
                  v-else-if="archivedQueue.status === 'Completed'"
                  class="badge text-bg-success"
                  >Completed</span
                >
              </td>
              <!-- Add more columns as needed -->
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <div class="circular-buttons-container">
            <button
              class="circular-button tick-button"
              @click="prevPage"
              :disabled="currentPage === 1"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="current-page"
              >{{ currentPage }} / {{ totalPages }}</span
            >
            <button
              class="circular-button tick-button"
              @click="nextPage"
              :disabled="currentPage === totalPages"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
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
      selectedDate: null,
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  created() {
    // Call the fetchArchivedQueues action when the component is created
    this.$store.dispatch("fetchArchivedQueues");
  },
  computed: {
    archivedQueues() {
      // Access archived queues from the Vuex store state
      return this.$store.getters.getArchivedQueues;
    },
    filteredArchivedQueues() {
      // Access archived queues from the Vuex store state
      const allArchivedQueues = this.$store.getters.getArchivedQueues;

      // Filter queues based on the selected date
      return allArchivedQueues.filter((archivedQueue) => {
        const queueDate = new Date(archivedQueue.date);
        return (
          !this.selectedDate ||
          queueDate.toISOString().split("T")[0] === this.selectedDate
        );
      });
    },
    paginatedArchivedQueues() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredArchivedQueues.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredArchivedQueues.length / this.itemsPerPage);
    },
  },
  methods: {
    formatDate(timestamp) {
      // Implement a function to format the date as needed
      const date = new Date(timestamp);
      return date.toLocaleString(); // Adjust the formatting as needed
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
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
.fixed-card-size {
  height: 100%;
  max-height: 600px; /* Set your preferred max height */
  overflow-y: auto;
}

.current-page {
  margin: 0 10px;
}
.circular-buttons-container {
  display: flex;
  align-items: center;
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

.circular-button i {
  font-size: 16px;
}
</style>
