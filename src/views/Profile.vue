<template>
  <main>
    <div class="container-fluid">
      <div class="page-header min-height-100">
        <span></span>
      </div>
      <div class="card shadow-lg mt-n6">
        <div class="card-body p-3">
          <div class="row gx-4">
            <div class="col-auto">
              <div class="avatar avatar-xl position-relative">
                <img
                  src="../assets/img/barberlogo.jpg"
                  alt="profile_image"
                  class="shadow-sm w-100 border-radius-lg"
                />
              </div>
            </div>
            <div class="col-auto my-auto">
              <div class="h-100">
                <h5 class="mb-1" v-text="companyName"></h5>
                <p
                  class="mb-0 font-weight-bold text-sm"
                  v-text="`${firstName} ${lastName}`"
                ></p>
              </div>
            </div>
            <div
              class="mx-auto mt-3 col-lg-4 col-md-6 my-sm-auto ms-sm-auto me-sm-0"
            >
              <div class="nav-wrapper position-relative end-0">
                <ul
                  class="p-1 bg-transparent nav nav-pills nav-fill"
                  role="tablist"
                ></ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="py-4 container-fluid">
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header pb-0">
              <div class="d-flex align-items-center">
                <p class="mb-0">Edit Profile</p>
              </div>
            </div>
            <div class="card-body">
              <p class="text-uppercase text-sm">User Information</p>
              <div class="row">
                <div class="col-md-6">
                  <label for="companyName" class="form-control-label"
                    >Company Name</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="companyName"
                    v-model="companyName"
                  />
                </div>
                <div class="col-md-6">
                  <label for="email" class="form-control-label"
                    >Email address</label
                  >
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="email"
                  />
                </div>
                <div class="col-md-6">
                  <label for="firstName" class="form-control-label"
                    >First name</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="firstName"
                    v-model="firstName"
                  />
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-control-label"
                    >Last name</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="lastName"
                    v-model="lastName"
                  />
                </div>
              </div>
              <hr class="horizontal dark" />
              <p class="text-uppercase text-sm">Contact Information</p>
              <div class="row">
                <div class="col-md-12">
                  <label for="address" class="form-control-label"
                    >Address</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="address"
                    v-model="address"
                  />
                </div>
                <div class="col-md-4">
                  <label for="state" class="form-control-label">State</label>
                  <input
                    type="text"
                    class="form-control"
                    id="state"
                    v-model="state"
                  />
                </div>
                <div class="col-md-4">
                  <label for="country" class="form-control-label"
                    >Country</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="country"
                    v-model="country"
                  />
                </div>
                <div class="col-md-4">
                  <label for="postalCode" class="form-control-label"
                    >Postal code</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="postalCode"
                    v-model="postalCode"
                  />
                </div>
              </div>
              <hr class="horizontal dark" />
              <p class="text-uppercase text-sm">About</p>
              <div class="row">
                <div class="col-md-12">
                  <label for="about" class="form-control-label">About</label>
                  <input
                    type="text"
                    class="form-control"
                    id="about"
                    v-model="about"
                  />
                </div>
              </div>
              <div class="card-footer d-flex justify-content-end">
                <button class="btn btn-primary" @click="saveUserInfo">
                  <span v-if="!saving">Save</span>
                  <span v-else>
                    <span
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { auth, db } from "@/main";
import { doc, getDoc, setDoc } from "firebase/firestore";
export default {
  name: "profile",
  data() {
    return {
      email: "",
      firstName: "",
      lastName: "",
      companyName: "",
      address: "",
      state: "",
      country: "",
      postalCode: "",
      about: "",
      saving: false,
    };
  },
  async mounted() {
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);

      try {
        // Retrieve the user document data
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          // Populate the input fields with the user data
          const userData = userDocSnapshot.data();
          this.email = userData.email;
          this.firstName = userData.firstName;
          this.lastName = userData.lastName;
          this.companyName = userData.companyName;
          this.address = userData.address;
          this.state = userData.state;
          this.country = userData.country;
          this.postalCode = userData.postalCode;
          this.about = userData.about;
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    } else {
      console.error("User not authenticated.");
    }
  },
  methods: {
    async saveUserInfo() {
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);

        try {
          // Set saving state to true
          this.saving = true;

          // Set the user document with the new information
          await setDoc(userDocRef, {
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            companyName: this.companyName,
            address: this.address,
            state: this.state,
            country: this.country,
            postalCode: this.postalCode,
            about: this.about,
          });

          this.saving = false;

          alert("User information saved successfully!");

          console.log("User information updated successfully!");
        } catch (error) {
          console.error("Error updating user information:", error);
        }
      } else {
        console.error("User not authenticated.");
      }
    },
  },
};
</script>

<style></style>
