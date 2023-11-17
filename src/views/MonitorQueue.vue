<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <queue-list />
      </div>
    </div>
    <div class="mt-4 row">
      <div class="col-12">
        <projects-table />
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
import ProjectsTable from "./components/ProjectsTable.vue";
import QueueList from "./components/QueueList.vue";

export default {
  name: "App",
  components: {
    ProjectsTable,
    QueueList,
  },
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
