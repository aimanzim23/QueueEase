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
                  <h6 class="mb-0 text-sm">John Michael</h6>
                  <p class="text-xs text-secondary mb-0">
                    john@creative-tim.com
                  </p>
                </div>
              </div>
            </td>
            <td>
              <p class="text-xs font-weight-bold mb-0">Manager</p>
              <p class="text-xs text-secondary mb-0">Organization</p>
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
            <tr v-for="(message, index) in messages" :key="index">
              <td>{{ message.userName }}</td>
              <td>{{ message.phoneNumber }}</td>
              <td>{{ message.notes }}</td>
              <td>
                <button @click="deleteMessage(message.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <input
            v-model="newMessage.userName"
            type="text"
            placeholder="User Name"
          />
          <input
            v-model="newMessage.phoneNumber"
            type="text"
            placeholder="Phone Number"
          />
          <input v-model="newMessage.notes" type="text" placeholder="Notes" />
          <button @click="addNewMessage">Add</button>
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
import { onUnmounted, ref } from "vue";

export default {
  name: "queue-list",
  components: {},
  methods: {
    addNewMessage: function () {
      addDoc(collection(db, "messages"), {
        userName: this.newMessage.userName,
        phoneNumber: this.newMessage.phoneNumber,
        notes: this.newMessage.notes,
        date: Date.now(),
      });
      // Reset the form fields after adding the message
      this.newMessage = {
        userName: "",
        phoneNumber: "",
        notes: "",
      };
    },
    updateMessage: function (message) {
      setDoc(doc(db, "messages", message.id), {
        userName: message.userName,
        phoneNumber: message.phoneNumber,
        notes: message.notes,
        date: message.date,
      });
    },
    deleteMessage: function (id) {
      deleteDoc(doc(db, "messages", id));
    },
  },
  data() {
    return {
      messages: ref([]),
      newMessage: {
        userName: "",
        phoneNumber: "",
        notes: "",
      },
    };
  },
  mounted() {
    const latestQuery = query(collection(db, "messages"), orderBy("date"));
    const livemessage = onSnapshot(latestQuery, (snapshot) => {
      this.messages = snapshot.docs.map((doc) => {
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
    onUnmounted(livemessage);
  },
};
</script>
