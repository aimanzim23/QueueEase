<template>
  <div>
    <!-- Button to trigger modal -->
    <button
      type="button"
      class="btn btn-primary btn-sm"
      @click="showModal = true"
    >
      Add Queue
    </button>

    <!-- Vue Modal -->
    <div
      class="modal"
      tabindex="-1"
      role="dialog"
      style="display: block"
      v-if="showModal"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add User to Queue</h5>
            <button
              type="button"
              class="btn-close"
              @click="showModal = false"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label for="userName" class="form-label">Visitor's Name</label>
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
                <select class="form-select" v-model="newQueue.service">
                  <option disabled value="">Please select a service</option>

                  <option
                    v-for="(service, index) in availableServices"
                    :key="index"
                    :value="service.serviceName"
                  >
                    {{ service.serviceName }}
                  </option>
                </select>
              </div>
              <div class="d-flex justify-content-end">
                <button
                  type="button"
                  class="btn btn-danger mx-2"
                  @click="showModal = false"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="addNewQueue"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- Backdrop -->
    <div
      class="modal-backdrop"
      style="background-color: rgba(0, 0, 0, 0.5)"
      v-if="showModal"
      @click="showModal = false"
    ></div>
  </div>
</template>

<script>
import { db, auth } from "@/main";
import {
  collection,
  addDoc,
  orderBy,
  query,
  getDocs,
  limit,
  doc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export default {
  name: "queue-modal",
  data() {
    return {
      newQueue: {
        userName: "",
        phoneNumber: "",
        service: "",
      },
      availableServices: [],
      showModal: false,
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
          this.availableServices = [];
          querySnapshot.forEach((doc) => {
            this.availableServices.push(doc.data());
          });
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },
    addNewQueue() {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const queuesCollectionRef = collection(userDocRef, "queues");

        const queueId = uuidv4();

        const latestQuery = query(
          queuesCollectionRef,
          orderBy("queueNo", "desc"),
          limit(1)
        );

        getDocs(latestQuery)
          .then((snapshot) => {
            let lastQueueNo = 0;
            if (!snapshot.empty) {
              lastQueueNo = parseInt(snapshot.docs[0].data().queueNo, 10) || 0;
            }

            const newQueueNo = lastQueueNo + 1;
            const formattedQueueNo = String(newQueueNo).padStart(3, "0");

            const initialStatus = "Waiting";

            addDoc(queuesCollectionRef, {
              queueId,
              userName: this.newQueue.userName,
              phoneNumber: this.newQueue.phoneNumber,
              service: this.newQueue.service,
              date: Date.now(),
              queueNo: formattedQueueNo,
              status: initialStatus,
            })
              .then(() => {
                this.newQueue = {
                  userName: "",
                  phoneNumber: "",
                  service: "",
                };
                this.showModal = false;
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
    this.fetchServices();
  },
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
