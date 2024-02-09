<template>
  <div class="col card mb-3">
    <div class="card-header border-1">
      <!-- Tabs -->
      <ul class="nav nav-pills nav-fill">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'waitingList' }"
            @click="changeTab('waitingList')"
          >
            Waiting List
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'noShow' }"
            @click="changeTab('noShow')"
          >
            No Show
          </a>
        </li>
      </ul>
    </div>
    <div class="card-body pt-0" :style="{ minHeight: '500px' }">
      <!-- Content based on the selected tab -->
      <div v-if="activeTab === 'waitingList'">
        <!-- Waiting List content -->
        <ul class="list-group list-group-flush">
          <template v-if="filteredPaginatedQueues.length > 0">
            <li
              class="list-group-item d-flex justify-content-between align-items-center border-bottom"
              v-for="(queue, index) in filteredPaginatedQueues"
              :key="index"
            >
              <!-- Display waiting list details -->
              <div>
                <h6 class="mb-1">#{{ queue.queueNo }}</h6>
                <p class="mb-1 text-sm">{{ queue.userName }}</p>
                <p class="text-xs text-secondary mb-0">
                  {{ queue.phoneNumber }}
                </p>
                <p class="mb-0 text-sm">{{ queue.service }}</p>
                <p class="mb-0 text-sm">
                  {{ formattedArrivalTime(queue.date) }}
                </p>
              </div>
              <div>
                <span v-if="queue.status === 'Ongoing'" class="badge bg-primary"
                  >Ongoing</span
                >
                <span
                  v-else-if="queue.status === 'Waiting'"
                  class="badge bg-secondary"
                  >Waiting</span
                >
                <span
                  v-else-if="queue.status === 'Completed'"
                  class="badge bg-success"
                  >Completed</span
                >
              </div>
            </li>
          </template>
          <template v-else>
            <li class="list-group-item text-center">
              No waiting queues. You can take a break for now!
            </li>
          </template>
        </ul>
      </div>
      <div v-else-if="activeTab === 'noShow'">
        <!-- No Show content -->
        <ul class="list-group list-group-flush">
          <template v-if="filteredPaginatedQueues.length > 0">
            <li
              class="list-group-item d-flex justify-content-between align-items-center border-bottom"
              v-for="(queue, index) in filteredPaginatedQueues"
              :key="index"
            >
              <!-- Display No Show queue details -->
              <div>
                <h6 class="mb-1">#{{ queue.queueNo }}</h6>
                <p class="mb-1 text-sm">{{ queue.userName }}</p>
                <p class="text-xs text-secondary mb-0">
                  {{ queue.phoneNumber }}
                </p>
                <p class="mb-0 text-sm">{{ queue.service }}</p>
                <p class="mb-0 text-sm">
                  {{ formattedArrivalTime(queue.date) }}
                </p>
              </div>
              <div>
                <span v-if="queue.status === 'No Show'" class="badge bg-warning"
                  >No Show</span
                >
              </div>
            </li>
          </template>
          <template v-else>
            <li class="list-group-item text-center">
              No queues marked as 'No Show.'
            </li>
          </template>
        </ul>
      </div>

      <!-- Pagination controls -->
      <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-center mt-4">
          <li
            class="page-item"
            :class="{ disabled: pagination.currentPage === 1 }"
          >
            <a
              class="page-link"
              href="#"
              aria-label="Previous"
              @click.prevent="prevPage"
            >
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          <!-- Display page numbers -->
          <li
            class="page-item"
            v-for="pageNumber in pagination.totalPages"
            :key="pageNumber"
            :class="{ active: pageNumber === pagination.currentPage }"
            @click.prevent="goToPage(pageNumber)"
          >
            <a class="page-link" href="#">{{ pageNumber }}</a>
          </li>
          <li
            class="page-item"
            :class="{
              disabled: pagination.currentPage === pagination.totalPages,
            }"
          >
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
  </div>
</template>

<script>
export default {
  props: {
    paginatedQueues: {
      type: Array,
      default: () => [],
    },

    pagination: {
      type: Object,
      default: () => ({
        currentPage: 1,
        perPage: 3,
        totalPages: 1,
      }),
    },
    prevPage: {
      type: Function,
      required: true,
    },
    nextPage: {
      type: Function,
      required: true,
    },
    goToPage: {
      type: Function,
      required: true,
    },
    formattedArrivalTime: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      activeTab: "waitingList", // Default to 'Waiting List' tab
    };
  },
  computed: {
    filteredPaginatedQueues() {
      return this.paginatedQueues.filter((queue) =>
        this.activeTab === "waitingList"
          ? queue.status === "Waiting"
          : this.activeTab === "noShow"
          ? queue.status === "No Show"
          : false
      );
    },
  },
  methods: {
    changeTab(tab) {
      this.activeTab = tab;
    },
  },
};
</script>

<style scoped>
/* Add your custom styles here */
.nav-pills .nav-item .nav-link.active {
  background-color: #f1f1f1; /* Bootstrap's primary color for active tab */
  color: #000; /* White text for better visibility on active tab */
}

.nav-pills .nav-item .nav-link {
  background-color: #fff; /* White background for inactive tabs */
  color: #000; /* Black text for better visibility on inactive tabs */
}
</style>
