<!-- QueueTable.vue -->
<template>
  <div class="card-body px-0 pt-0 pb-2">
    <div class="table-responsive p-0">
      <table class="table align-items-center mb-0">
        <thead>
          <tr>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              style="width: 80px"
            >
              Queue No #
            </th>
            <th
              class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Name
            </th>

            <th
              class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Services
            </th>
            <th
              class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Arrival Time
            </th>
            <th
              class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Status
            </th>
            <th
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="text-center">
          <template v-if="paginatedQueues.length > 0">
            <tr v-for="(queue, index) in filteredPaginatedQueues" :key="index">
              <td class="mb-0 text-sm">{{ queue.queueNo }}</td>
              <td>
                <h6 class="mb-0 text-sm">{{ queue.userName }}</h6>
                <p class="text-xs text-secondary mb-0">
                  {{ queue.phoneNumber }}
                </p>
              </td>

              <td class="mb-0 text-sm">{{ queue.service }}</td>
              <td class="mb-0 text-sm">
                {{ formattedArrivalTime(queue.date) }}
              </td>
              <td class="mb-0 text-sm">
                <span
                  v-if="queue.status === 'Ongoing'"
                  class="badge text-bg-primary"
                  >Ongoing
                </span>
                <span
                  v-else-if="queue.status === 'Waiting'"
                  class="badge text-bg-secondary"
                  >Waiting</span
                >
                <span
                  v-else-if="queue.status === 'Completed'"
                  class="badge text-bg-success"
                  >Completed</span
                >
                <span
                  v-else-if="queue.status === 'Cancelled'"
                  class="badge text-bg-danger"
                  >Cancelled</span
                >
                <span
                  v-else-if="queue.status === 'No Show'"
                  class="badge text-bg-warning"
                  >No Show</span
                >
              </td>
              <td>
                <div class="circular-buttons-container">
                  <button
                    class="circular-button tick-button"
                    @click="completeQueue(queue.id)"
                    :disabled="
                      queue.status === 'Completed' || queue.status === 'Waiting'
                    "
                    :class="{
                      'disabled-button':
                        queue.status === 'Completed' ||
                        queue.status === 'Waiting',
                    }"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button
                    class="circular-button call-button"
                    @click="ongoingQueue(queue.id, queue.service)"
                    :disabled="isOngoingDisabled(queue.service)"
                    :title="isOngoingDisabled(queue.service) ? 'Disabled' : ''"
                  >
                    <i class="fas fa-phone-alt"></i>
                  </button>
                  <button
                    class="circular-button trash-button"
                    @click="deleteQueue(queue.id)"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="6" class="text-center">No current queues.</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
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
</template>

<script>
import { deleteDoc, updateDoc, getDoc, doc } from "firebase/firestore";
import { db, auth } from "@/main";
import axios from "axios";
export default {
  name: "queue-table",
  props: {
    queues: {
      type: Array,
      required: true,
    },
    selectedService: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      pagination: {
        currentPage: 1,
        perPage: window.innerWidth < 697 ? 3 : 10,
        totalPages: 1,
      },
    };
  },
  computed: {
    paginatedQueues() {
      const start = (this.pagination.currentPage - 1) * this.pagination.perPage;
      const end = start + this.pagination.perPage;
      return this.queues.slice(start, end);
    },
    filteredPaginatedQueues() {
      return this.paginatedQueues.filter(
        (queue) =>
          !this.selectedService || queue.service === this.selectedService
      );
    },
  },
  watch: {
    queues() {
      this.updateTotalPages();
    },
    "pagination.perPage"() {
      this.updateTotalPages();
    },
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
    isOngoingDisabled(service) {
      return this.paginatedQueues.some(
        (q) => q.service === service && q.status === "Ongoing"
      );
    },
    updateTotalPages() {
      this.pagination.totalPages = Math.ceil(
        this.queues.length / this.pagination.perPage
      );
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
    formattedArrivalTime(date) {
      const formatted = new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });
      return formatted;
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
    async ongoingQueue(id) {
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queueDocRef = doc(userDocRef, "queues", id);

        try {
          const queueDocSnapshot = await getDoc(queueDocRef);
          const queueData = queueDocSnapshot.data();

          if (
            queueData.status === "Waiting" ||
            queueData.status === "No Show"
          ) {
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
          }
        } catch (error) {
          console.error("Error setting queue to Ongoing:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
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
    updatePerPage() {
      this.pagination.perPage = window.innerWidth < 697 ? 3 : 10;
    },
  },
  mounted() {
    this.updatePerPage();

    window.addEventListener("resize", this.updatePerPage);
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
.text-bg-danger {
  background-color: #dc3545;
}
.text-bg-warning {
  background-color: #f16131;
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
@media (max-width: 697px) {
  .table-responsive {
    overflow-x: auto;
  }

  .table {
    width: 100%;
  }

  .table thead {
    display: none;
  }

  .table tbody tr {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  .table tbody td {
    display: block;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
    padding-left: 10px;
    border: none;
  }

  .mobile-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .mobile-cell-status,
  .mobile-cell-action {
    margin-left: auto;
  }

  .circular-buttons-container {
    text-align: center;
  }

  .circular-button {
    display: inline-block;
    margin: 0 5px;
  }
}
</style>
