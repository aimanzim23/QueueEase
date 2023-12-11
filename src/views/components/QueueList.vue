<template>
  <div class="col-lg-12">
    <div class="row">
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">
                Total Queue <fa icon="user" />
              </h5>
              <p class="card-text">{{ totalQueues }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">
                Awaiting Visits
              </h5>
              <p class="card-text">{{ awaitingQueuesCount }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">
                Completed Visits
              </h5>
              <p class="card-text">{{ completedQueuesCount }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">
                Avg Waiting Time
              </h5>
              <p class="card-text">12 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header pb-0">
      <h6>Queue List</h6>
    </div>

    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table align-items-center mb-0">
          <thead>
            <tr>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                style="width: 80px"
              >
                Queue No.
              </th>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Name
              </th>

              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Notes
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
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Actions
              </th>
            </tr>
          </thead>
          <!-- <tr>
            <td>
              <div class="d-flex px-2 py-1">
                <div>
                  <img
                    src="../../assets/img/team-2.jpg"
                    class="avatar avatar-sm me-3"
                    alt="user1"
                  />
                </div>
                <div class="d-flex flex-column justify-content-center">
                  <h6 class="mb-0 text-sm">Ahmad Abdul</h6>
                  <p class="text-xs text-secondary mb-0">Staff</p>
                </div>
              </div>
            </td>
            <td>
              <p class="text-xs font-weight-bold mb-0">0161293921</p>
              <p class="text-xs text-secondary mb-0">Serving Counter1</p>
            </td>
            <td class="align-middle text-center text-sm">
              <span class="badge badge-sm bg-gradient-success">Online</span>
            </td>
            <td class="align-middle text-center">
              <span class="text-secondary text-xs font-weight-bold"
                >23/04/18</span
              >
            </td>
            <td class="align-middle">
              <a
                href="javascript:;"
                class="text-secondary font-weight-bold text-xs"
                data-toggle="tooltip"
                data-original-title="Edit user"
                >Edit</a
              >
            </td>
          </tr> -->

          <tbody>
            <tr v-for="(queue, index) in queues" :key="index">
              <td class="mb-0 text-sm">#{{ queue.queueNo }}</td>
              <td>
                <h6 class="mb-0 text-sm">{{ queue.userName }}</h6>
                <p class="text-xs text-secondary mb-0">
                  {{ queue.phoneNumber }}
                </p>
              </td>

              <td class="mb-0 text-sm">{{ queue.notes }}</td>
              <td class="mb-0 text-sm">
                {{ formattedArrivalTime(queue.date) }}
              </td>
              <td class="mb-0 text-sm">
                <span
                  v-if="queue.status === 'Ongoing'"
                  class="badge text-bg-primary"
                  >Ongoing</span
                >
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
              </td>
              <td>
                <div class="circular-buttons-container">
                  <button
                    class="circular-button tick-button"
                    @click="completeQueue(queue.id)"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button
                    class="circular-button call-button"
                    @click="ongoingQueue(queue.id)"
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
          </tbody>
        </table>

        <!-- Button trigger modal -->
        <button
          type="button"
          class="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
          style="margin-left: 10px"
        >
          Add Queue
        </button>
        <button
          type="button"
          class="btn btn-primary"
          style="margin-left: 10px; background-color: orange"
        >
          Call Next
        </button>

        <!-- Bootstrap Modal Structure -->
        <div
          class="modal fade"
          id="exampleModalCenter"
          tabindex="-1"
          aria-labelledby="addForm"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="addForm">Add Users To Queue</h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <!-- Vue.js Form -->
                <form>
                  <div class="mb-3">
                    <label for="userName" class="form-label">User Name</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="newQueue.userName"
                      placeholder="Enter user name"
                    />
                  </div>
                  <div class="mb-3">
                    <label for="phoneNumber" class="form-label"
                      >Phone Number</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      v-model="newQueue.phoneNumber"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div class="mb-3">
                    <label for="notes" class="form-label">Notes</label>
                    <textarea
                      class="form-control"
                      v-model="newQueue.notes"
                      rows="3"
                      placeholder="Enter notes"
                    ></textarea>
                  </div>
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click="addNewQueue"
                  >
                    Add
                  </button>
                </form>
                <!-- End of Vue.js Form -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
  query,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@/main";
import { auth } from "@/main";

export default {
  name: "queue-list",
  components: {},
  data() {
    return {
      newQueue: {
        userName: "",
        phoneNumber: "",
        notes: "",
      },
    };
  },
  methods: {
    getCurrentUser() {
      const currentUser = auth.currentUser;

      if (currentUser) {
        console.log("Current user:", currentUser);
      } else {
        console.log("No user signed in");
      }
    },

    addNewQueue: function () {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;

        const userDocRef = doc(db, "users", userId);
        const queuesCollectionRef = collection(userDocRef, "queues");

        // Fetch the existing queues to determine the last queue number
        const latestQuery = query(
          queuesCollectionRef,
          orderBy("queueNo", "desc"),
          limit(1)
        );

        getDocs(latestQuery)
          .then((snapshot) => {
            let lastQueueNo = 0;
            if (!snapshot.empty) {
              // If there are existing queues, get the last queue number
              lastQueueNo = snapshot.docs[0].data().queueNo || 0;
            }

            // Increment the queue number for the new queue
            const newQueueNo = lastQueueNo + 1;

            const initialStatus = "Waiting";

            addDoc(queuesCollectionRef, {
              userName: this.newQueue.userName,
              phoneNumber: this.newQueue.phoneNumber,
              notes: this.newQueue.notes,
              date: Date.now(),
              queueNo: newQueueNo,
              status: initialStatus,
            })
              .then(() => {
                // Reset the form fields after adding the queue
                this.newQueue = {
                  userName: "",
                  phoneNumber: "",
                  notes: "",
                };
              })
              .catch((error) => {
                console.error(
                  "Error adding queue to user's collection: ",
                  error
                );
              });
          })
          .catch((error) => {
            console.error("Error fetching queues: ", error);
          });
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
          const startTimestamp = Date.now(); // Store the start time

          // Update the queue status to 'Ongoing'
          await updateDoc(queueDocRef, {
            status: "Ongoing",
            startTime: startTimestamp, // Add a field to store the start time
          });

          console.log("Queue set to Ongoing status.");

          // Return the startTimestamp to use for calculating service time in completeQueue
          return startTimestamp;
        } catch (error) {
          console.error("Error setting queue to Ongoing:", error);
        }
      } else {
        console.error("User not authenticated.");
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

    async completeQueue(id) {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queueDocRef = doc(userDocRef, "queues", id);

        try {
          const completedTimestamp = Date.now(); // Store the completion time

          // Get the queue document to retrieve the start time
          const queueDocSnapshot = await getDoc(queueDocRef);
          const queueData = queueDocSnapshot.data();

          // Calculate the service time in milliseconds
          const serviceTime = completedTimestamp - queueData.startTime;
          const formattedServiceTime = this.formatServiceTime(serviceTime);

          // Update the queue status to 'Completed' and store the service time
          await updateDoc(queueDocRef, {
            status: "Completed",
            completedTime: completedTimestamp, // Add a field to store the completion time
            serviceTime: formattedServiceTime, // Store the service time
          });

          console.log(
            "Queue marked as Completed with service time:",
            serviceTime
          );
        } catch (error) {
          console.error("Error marking queue as Completed:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },
  },

  mounted() {
    const storedData = localStorage.getItem("queueData");
    const user = auth.currentUser;

    if (storedData) {
      // If there's data in localStorage, load it directly into the Vuex store
      const parsedData = JSON.parse(storedData);
      this.$store.commit("setQueues", parsedData);
    }

    if (user) {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);
      const queuesCollectionRef = collection(userDocRef, "queues");
      const latestQuery = query(queuesCollectionRef, orderBy("date"));

      onSnapshot(latestQuery, (snapshot) => {
        const queues = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            queueNo: data.queueNo,
            userName: data.userName,
            phoneNumber: data.phoneNumber,
            notes: data.notes,
            date: data.date,
            status: data.status,
          };
        });

        this.$store.commit("setQueues", queues); // Update Vuex store

        // Store data in local storage after fetching
        localStorage.setItem("queueData", JSON.stringify(queues));
      });
    } else {
      console.error("User not authenticated.");
    }
  },

  computed: {
    formattedArrivalTime() {
      return (date) => {
        const formatted = new Date(date).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });
        return formatted;
      };
    },
    queues() {
      return this.$store.getters.getQueues;
    },
    totalQueues() {
      return this.queues.length;
    },
    awaitingQueuesCount() {
      return this.$store.getters.getAwaitingQueuesCount;
    },
    completedQueuesCount() {
      return this.$store.getters.getCompletedQueuesCount;
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
</style>
