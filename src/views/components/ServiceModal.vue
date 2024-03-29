<template>
  <div class="pt-0 card-body pt-sm-3">
    <div>
      <!-- Add loading spinner -->
      <div v-if="addingService" class="text-center">
        <i class="fas fa-spinner fa-spin"></i> Adding Service...
      </div>

      <div class="d-flex align-items-center justify-content-between">
        <h6 class="mb-2">Services</h6>
        <div class="d-flex align-items-center">
          <i class="fas fa-plus-circle me-2" @click="showAddForm = true"></i>
          <i class="fas fa-edit"></i>
        </div>
      </div>

      <div v-if="showAddForm">
        <h6 class="mb-0">Add new service</h6>
        <form @submit.prevent="addNewService">
          <div class="mb-3">
            <label for="serviceName" class="form-label">Service Name:</label>
            <input
              type="text"
              class="form-control"
              id="serviceName"
              v-model="newService.serviceName"
              required
            />
          </div>
          <div class="mb-3">
            <label for="description" class="form-label">Description:</label>
            <input
              type="text"
              class="form-control"
              id="description"
              v-model="newService.description"
            />
          </div>
          <!-- Add more fields for other service details -->

          <button type="submit" class="btn btn-primary">Add Service</button>
          <button
            type="button"
            class="btn btn-secondary ms-2"
            @click="showAddForm = false"
          >
            Cancel
          </button>
        </form>
      </div>

      <div>
        <ul v-if="services.length" class="service-list">
          <li
            v-for="(service, index) in services"
            :key="index"
            class="service-item d-flex justify-content-between align-items-center"
          >
            <div>
              <p>Service Name: {{ service.serviceName }}</p>
              <p>Description: {{ service.description }}</p>
            </div>

            <i
              @click="removeService(index)"
              class="fas fa-trash text-danger"
            ></i>
          </li>
        </ul>
        <p v-else>No services available.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from "@/main";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
export default {
  name: "service-modal",
  data() {
    return {
      showAddForm: false,
      newService: {
        serviceName: "",
        description: "",
      },
      services: [],
      addingService: false,
    };
  },

  methods: {
    async removeService(index) {
      const user = auth.currentUser;
      if (user) {
        const service = this.services[index];
        const servicesCollectionRef = collection(
          db,
          "users",
          user.uid,
          "services"
        );
        const serviceDocRef = doc(servicesCollectionRef, service.id);

        try {
          await deleteDoc(serviceDocRef);

          this.services.splice(index, 1);
          console.log("Service removed successfully!");
        } catch (error) {
          console.error("Error removing service:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },
    async addNewService() {
      const user = auth.currentUser;
      if (user) {
        this.addingService = true;
        const servicesCollectionRef = collection(
          db,
          "users",
          user.uid,
          "services"
        );

        const serviceData = {
          serviceName: this.newService.serviceName,
          description: this.newService.description,
        };

        addDoc(servicesCollectionRef, serviceData)
          .then(() => {
            this.newService = {
              serviceName: "",
              description: "",
            };
            console.log("Service added successfully!");
          })
          .catch((error) => {
            console.error("Error adding service: ", error);
          })
          .finally(() => {
            this.addingService = false;
          });
      } else {
        console.error("User not authenticated.");
      }
    },
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
            this.services.push({ id: doc.id, ...doc.data() });
          });
        } catch (error) {
          console.error("Error fetching services:", error);
        }
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

<style>
.service-list {
  list-style: none;
  padding: 0;
}

.service-item {
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.service-item p {
  margin: 5px 0;
}
</style>
