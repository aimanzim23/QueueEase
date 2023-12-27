<template>
  <div class="col card mb-3">
    <div class="card-header border-1">
      <h6 class="mb-3">Waiting List</h6>
    </div>
    <div class="card-body pt-0" :style="{ minHeight: '500px' }">
      <ul class="list-group list-group-flush">
        <template v-for="(queue, index) in paginatedQueues" :key="index">
          <li
            class="list-group-item d-flex justify-content-between align-items-center border-bottom"
          >
            <!-- Display filtered queue details -->
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
      </ul>

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
            @click="goToPage(pageNumber)"
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
  // Other component options
};
</script>
