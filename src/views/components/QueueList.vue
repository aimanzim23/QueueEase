<template>
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
              <td>{{ queue.userName }}</td>
              <td>{{ queue.phoneNumber }}</td>
              <td>{{ queue.notes }}</td>
              <td>
                <button @click="deleteQueue(queue.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
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
  setDoc,
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
            console.log("Queue added to user's collection.");
          })
          .catch((error) => {
            console.error("Error adding queue to user's collection: ", error);
          });
      } else {
        console.error("User not authenticated.");
      }
    },
    updateQueue: function (queue) {
      setDoc(doc(db, "queues", queue.id), {
        userName: queue.userName,
        phoneNumber: queue.phoneNumber,
        notes: queue.notes,
        date: queue.date,
      });
    },
    deleteQueue: function (id) {
      deleteDoc(doc(db, "queues", id));
    },
  },
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
  mounted() {
    const latestQuery = query(collection(db, "queues"), orderBy("date"));
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
  },
};
</script>
