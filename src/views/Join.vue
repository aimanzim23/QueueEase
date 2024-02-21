<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div
      class="card p-4"
      style="width: 90vw; max-width: 400px; position: absolute; top: 18%"
    >
      <div class="text-center mb-4">
        <h3 class="display-6 fw-bold">Queue Ease</h3>
        <p class="lead">Queue with ease!</p>
      </div>
      <form @submit.prevent="addNewQueue">
        <div class="mb-3">
          <label for="userName" class="form-label">User Name</label>
          <input
            type="text"
            class="form-control"
            v-model="newQueue.userName"
            placeholder="Enter name"
          />
        </div>
        <div class="mb-3">
          <label for="phoneNumber" class="form-label">Phone Number</label>
          <input
            type="text"
            class="form-control"
            v-model="newQueue.phoneNumber"
            placeholder="Enter phone number"
          />
        </div>
        <div class="mb-3">
          <label for="service" class="form-label">Service</label>
          <select
            class="form-select"
            v-model="newQueue.service"
            placeholder="Choose service"
          >
            <option disabled value="">Please select a service</option>
            <option
              v-for="(service, index) in services"
              :key="index"
              :value="service.serviceName"
            >
              {{ service.serviceName }}
            </option>
          </select>
        </div>
        <div class="text-center mt-4">
          <button type="submit" class="btn btn-primary mx-1">Join</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { db } from "@/main";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export default {
  name: "join",
  data() {
    return {
      newQueue: {
        userName: "",
        phoneNumber: "",
        service: "",
      },
      availableServices: [],
    };
  },
  methods: {
    // async fetchServices() {
    //   const user = auth.currentUser;
    //   if (user) {
    //     const userDocRef = doc(db, "users", user.uid);
    //     const servicesCollectionRef = collection(userDocRef, "services");

    //     try {
    //       const querySnapshot = await getDocs(servicesCollectionRef);
    //       this.services = [];
    //       querySnapshot.forEach((doc) => {
    //         this.services.push(doc.data());
    //       });
    //     } catch (error) {
    //       console.error("Error fetching services:", error);
    //     }
    //   } else {
    //     console.error("User not authenticated.");
    //   }
    // },
    async fetchServices() {
      try {
        const userId = this.$route.params.userId;
        const servicesCollectionRef = collection(
          db,
          "users",
          userId,
          "services"
        );

        const querySnapshot = await getDocs(servicesCollectionRef);
        this.services = [];
        querySnapshot.forEach((doc) => {
          this.services.push(doc.data());
        });
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },
    async addNewQueue() {
      try {
        const userId = this.$route.params.userId;
        const queuesCollectionRef = collection(db, "users", userId, "queues");

        const latestQuery = query(
          queuesCollectionRef,
          orderBy("queueNo", "desc"),
          limit(1)
        );

        const snapshot = await getDocs(latestQuery);
        let lastQueueNo = 0;

        if (!snapshot.empty) {
          lastQueueNo = parseInt(snapshot.docs[0].data().queueNo, 10) || 0;
        }

        const newQueueNo = lastQueueNo + 1;
        const formattedQueueNo = String(newQueueNo).padStart(3, "0");
        const initialStatus = "Waiting";

        const queueId = uuidv4();

        const queueData = {
          userId: userId,
          queueId,
          userName: this.newQueue.userName,
          service: this.newQueue.service,
          status: initialStatus,
          phoneNumber: this.newQueue.phoneNumber,
          date: Date.now(),
          queueNo: formattedQueueNo,
        };

        await addDoc(queuesCollectionRef, queueData);
        console.log("Queue added to user's queues:", queueData);

        this.$router.push({
          name: "QueueTicket",
          params: {
            userId: userId,
            queueId: queueId,
          },
        });

        this.newQueue = {
          userName: "",
          phoneNumber: "",
        };
      } catch (error) {
        console.error("Error adding queue:", error);
      }
    },
  },
  mounted() {
    this.fetchServices();

    const savedFormData = this.$store.getters.getSavedUserData;

    if (savedFormData) {
      this.newQueue.userName = savedFormData.userName || "";
      this.newQueue.phoneNumber = savedFormData.phoneNumber || "";
      this.newQueue.service = savedFormData.service || "";
    }
  },
};
</script>
