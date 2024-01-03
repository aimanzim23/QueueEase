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
            placeholder="Enter user name"
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
            <!-- Populate options from fetched services -->
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
          <button
            type="button"
            class="btn btn-primary"
            @click="enableNotifications"
          >
            Enable Notification
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { db, auth } from "@/main";
import {
  collection,
  addDoc,
  orderBy,
  doc,
  query,
  getDocs,
  limit,
} from "firebase/firestore";

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
    async fetchServices() {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const servicesCollectionRef = collection(userDocRef, "services");

        try {
          const querySnapshot = await getDocs(servicesCollectionRef);
          this.services = [];
          querySnapshot.forEach((doc) => {
            this.services.push(doc.data());
          });
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      } else {
        console.error("User not authenticated.");
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
              service: this.newQueue.service,
              date: Date.now(),
              queueNo: newQueueNo,
              status: initialStatus,
            })
              .then(() => {
                // Reset the form fields after adding the queue
                this.newQueue = {
                  userName: "",
                  phoneNumber: "",
                  service: "",
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
  },
  mounted() {
    // Fetch services when the component is mounted
    this.fetchServices();
  },
};
</script>
