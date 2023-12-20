<template>
  <div>
    <!-- Button trigger modal -->
    <button
      type="button"
      class="btn btn-primary btn-sm"
      data-bs-toggle="modal"
      data-bs-target="#exampleModalCenter"
      style="margin-left: 10px"
    >
      Add Queue
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
              <button
                type="button"
                class="btn btn-primary"
                @click="addNewQueue"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
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
  name: "queue-modal",
  data() {
    return {
      newQueue: {
        userName: "",
        phoneNumber: "",
        service: "",
      },
      newService: {
        serviceName: "",
        serviceNumber: "",
        // Other properties related to services
      },
      availableServices: [],
    };
  },
  methods: {
    async fetchServices() {
      const user = auth.currentUser;
      if (user) {
        const servicesCollectionRef = collection(
          db,
          "users",
          user.uid,
          "services"
        );

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

<style>
/* Optional styles for the modal */
</style>
