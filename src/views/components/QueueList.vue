<template>
  <div class="col-lg-12">
    <div class="row">
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">Awaiting Visit</h5>
              <p class="card-text">1</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">Awaiting Visit</h5>
              <p class="card-text">1</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">Awaiting Visit</h5>
              <p class="card-text">1</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 col-12">
        <div class="col">
          <div class="card" style="width: 15rem; margin-bottom: 2rem">
            <div class="card-body" style="font-size: 0.8rem">
              <h5 class="card-title" style="font-size: 1rem">Awaiting Visit</h5>
              <p class="card-text">1</p>
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
              >
                Name
              </th>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2"
              >
                Phone No.
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Status
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Waiting Time
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Actions
              </th>
              <th class="text-secondary opacity-7"></th>
            </tr>
          </thead>
          <tr>
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
          </tr>
          <tbody>
            <tr v-for="(queue, index) in queues" :key="index">
              <td class="mb-0 text-sm">{{ queue.userName }}</td>
              <td class="text-xs font-weight-bold mb-0">
                {{ queue.phoneNumber }}
              </td>
              <td class="mb-0 text-sm">{{ queue.notes }}</td>
              <td class="mb-0 text-sm">4 min</td>
              <td class="mb-0 text-sm">{{ formattedDate(queue.date) }}</td>
              <td>
                <button @click="deleteQueue(queue.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- <div>
          <input
            v-model="newQueue.userName"
            type="text"
            placeholder="User Name"
          />
          <input
            v-model="newQueue.phoneNumber"
            type="text"
            placeholder="Phone Number"
          />
          <input v-model="newQueue.notes" type="text" placeholder="Notes" />
          <button @click="addNewQueue">Add</button>
        </div> -->
        <!-- Button trigger modal -->
        <button
          type="button"
          class="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
          Add Queue
        </button>

        <!-- Bootstrap Modal Structure -->
        <div
          class="modal fade"
          id="exampleModal"
          tabindex="-1"
          aria-labelledby="addForm"
          aria-hidden="true"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="addForm">Add Users To Queue</h5>
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
  deleteDoc,
  onSnapshot,
  orderBy,
  doc,
  query,
} from "firebase/firestore";
import { db } from "@/main";
import { auth } from "@/main";
import { onUnmounted, ref } from "vue";

export default {
  name: "queue-list",
  components: {},
  data() {
    return {
      queues: ref([]),
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

        addDoc(queuesCollectionRef, {
          userName: this.newQueue.userName,
          phoneNumber: this.newQueue.phoneNumber,
          notes: this.newQueue.notes,
          date: Date.now(),
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
            console.error("Error adding queue to user's collection: ", error);
          });
      } else {
        console.error("User not authenticated.");
      }
    },
    // updateQueue: function (queue) {
    //   const user = auth.currentUser;
    //   if (user) {
    //     const userId = user.uid;
    //     const userDocRef = doc(db, "users", userId);
    //     const queueDocRef = doc(userDocRef, "queues", queue.id);

    //     updateDoc(queueDocRef, {
    //       userName: queue.userName,
    //       phoneNumber: queue.phoneNumber,
    //       notes: queue.notes,
    //       date: queue.date,
    //     })
    //       .then(() => {
    //         console.log("Queue updated successfully.");
    //       })
    //       .catch((error) => {
    //         console.error("Error updating queue:", error);
    //       });
    //   } else {
    //     console.error("User not authenticated.");
    //   }
    // },

    deleteQueue: function (id) {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queueDocRef = doc(userDocRef, "queues", id);

        deleteDoc(queueDocRef)
          .then(() => {
            console.log("Queue deleted successfully.");
          })
          .catch((error) => {
            console.error("Error deleting queue:", error);
          });
      } else {
        console.error("User not authenticated.");
      }
    },
  },

  mounted() {
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);
      const queuesCollectionRef = collection(userDocRef, "queues");

      const latestQuery = query(queuesCollectionRef, orderBy("date"));
      const livequeue = onSnapshot(latestQuery, (snapshot) => {
        this.queues = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userName: data.userName,
            phoneNumber: data.phoneNumber,
            notes: data.notes,
            date: data.date,
          };
        });
      });

      onUnmounted(livequeue);
    } else {
      console.error("User not authenticated.");
    }
  },
  computed: {
    formattedDate() {
      return (date) => {
        const formatted = new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });
        return formatted;
      };
    },
  },
};
</script>
