<template>
  <div class="card p-3 m-3">
    <div
      class="card-header pb-0 d-flex justify-content-between align-items-center"
    >
      <h6 class="mb-0 mr-3">History</h6>
      <div class="date-filter d-flex align-items-center">
        <div class="form-group mb-0 mr-2 d-flex align-items-center">
          <label for="startDate" class="mx-3 mt-2">Start:</label>
          <input
            type="date"
            class="form-control form-control-sm"
            v-model="startDate"
            id="startDate"
          />
        </div>
        <div class="form-group mb-0 mr-2 d-flex align-items-center">
          <label for="startDate" class="mx-3 mt-2">End:</label>
          <input
            type="date"
            class="form-control form-control-sm"
            v-model="endDate"
            id="endDate"
          />
        </div>
      </div>
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
                Total Visits
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
            <tr v-for="(queue, index) in filteredHistory" :key="index">
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
                {{ countTotalVisits(queue.queues) }}
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
      <div v-for="(queue, index) in filteredHistory" :key="'expand-' + index">
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
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center mt-4">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a
            class="page-link"
            href="#"
            aria-label="Previous"
            @click.prevent="prevPage"
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li
          v-for="pageNumber in totalPages"
          :key="pageNumber"
          class="page-item"
          :class="{ active: pageNumber === currentPage }"
        >
          <a class="page-link" href="#" @click.prevent="goToPage(pageNumber)">{{
            pageNumber
          }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
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
</template>

<script>
export default {
  data() {
    return {
      expandedIndex: null,

      currentPage: 1,
      perPage: 10,
      startDate: null,
      endDate: null,
    };
  },
  computed: {
    filteredHistory() {
      let filtered = this.sortedFormattedArchivedQueues;

      if (this.startDate && this.endDate) {
        filtered = filtered.filter((queue) => {
          const queueDate = new Date(queue.date);
          const startDate = new Date(this.startDate);
          const endDate = new Date(this.endDate);

          const queueDateWithoutTime = new Date(
            queueDate.getFullYear(),
            queueDate.getMonth(),
            queueDate.getDate()
          );
          const startDateWithoutTime = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          );
          const endDateWithoutTime = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          );

          return (
            queueDateWithoutTime >= startDateWithoutTime &&
            queueDateWithoutTime <= endDateWithoutTime
          );
        });
      }

      return filtered;
    },
    paginatedHistory() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      return this.sortedFormattedArchivedQueues.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(
        this.sortedFormattedArchivedQueues.length / this.perPage
      );
    },
    sortedFormattedArchivedQueues() {
      const formattedArchivedQueues = this.formattedArchivedQueues;
      return formattedArchivedQueues.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    },
    formattedArchivedQueues() {
      const archivedQueues = this.$store.getters.getArchivedQueues;

      const allQueues = Object.values(archivedQueues).reduce(
        (acc, queue) => acc.concat(queue),
        []
      );

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

      // Convert total service time to minutes with two decimal places and log
      Object.values(groupedQueues).forEach((group) => {
        group.totalServiceTimeMinutes = +(
          group.totalServiceTime /
          (1000 * 60)
        ).toFixed(2);
      });

      return Object.values(groupedQueues);
    },
  },
  methods: {
    applyDateFilter() {
      this.currentPage = 1;

      this.currentPage = 1;
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
    goToPage(pageNumber) {
      this.currentPage = pageNumber;
    },
    getDayOfWeek(date) {
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayIndex = new Date(date).getDay();
      return daysOfWeek[dayIndex];
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
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
      const seconds = Math.floor(totalServiceTime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    },
    countTotalVisits(queues) {
      return queues ? queues.length : 0;
    },
    toggleCollapse(index) {
      this.expandedIndex = this.expandedIndex === index ? null : index;
    },
    isExpanded(index) {
      return this.expandedIndex === index;
    },
  },
  async created() {
    try {
      await this.$store.dispatch("fetchArchivedQueues");
    } catch (error) {
      console.error("Error fetching archived queues:", error);
    }
  },
};
</script>

<style scoped>
.icon-container {
  cursor: pointer;
  font-size: 1.5rem;
  color: grey;
}

.icon-container:hover {
  color: grey;
}
</style>
