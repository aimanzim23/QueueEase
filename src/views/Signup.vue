<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar isBtn="bg-gradient-light" />
      </div>
    </div>
  </div>
  <main class="main-content mt-0">
    <div
      class="page-header align-items-start min-vh-50 pt-5 pb-11 m-3 border-radius-lg"
      style="
        background-image: url('https://images.unsplash.com/photo-1628557960762-0d884fd31ea0?q=80&w=2833&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
        background-position: top;
      "
    >
      <span class="mask bg-gradient-dark opacity-6"></span>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 text-center mx-auto">
            <h1 class="text-white mb-2 mt-5">Welcome!</h1>
            <p class="text-lead text-white">
              Sign up to the best queue management system in town!
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row mt-lg-n10 mt-md-n11 mt-n10 justify-content-center">
        <div class="col-xl-4 col-lg-5 col-md-7 mx-auto">
          <div class="card z-index-0">
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label for="firstName" class="form-label">First Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="firstName"
                    placeholder="Enter your first name"
                    v-model="firstName"
                  />
                </div>
                <div class="mb-3">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="lastName"
                    placeholder="Enter your last name"
                    v-model="lastName"
                  />
                </div>
                <div class="mb-3">
                  <label for="companyName" class="form-label"
                    >Company Name</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="companyName"
                    placeholder="Enter your company name"
                    v-model="companyName"
                  />
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email address</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    placeholder="Enter your email"
                    v-model="email"
                  />
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    placeholder="Enter your password"
                    v-model="password"
                  />
                </div>

                <div class="text-center">
                  <button
                    type="submit"
                    class="btn btn-dark btn-gradient my-4 mb-2"
                  >
                    Sign up
                  </button>
                  <div v-if="error" class="text-danger">{{ error }}</div>
                </div>
                <p class="text-sm mt-3 mb-0">
                  Already have an account?
                  <a href="javascript:;" class="text-dark font-weight-bolder">
                    Sign in
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <app-footer />
</template>

<script>
import Navbar from "@/examples/PageLayout/Navbar.vue";
import AppFooter from "@/examples/PageLayout/Footer.vue";
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import { db } from "@/main";
// import { collection, setDoc, doc } from "firebase/firestore";
import { useStore } from "vuex";
import { ref } from "vue";
import { useRouter } from "vue-router";

const body = document.getElementsByTagName("body")[0];

export default {
  name: "signup",
  components: {
    Navbar,
    AppFooter,
  },
  created() {
    this.$store.state.hideConfigButton = true;
    this.$store.state.showNavbar = false;
    this.$store.state.showSidenav = false;
    this.$store.state.showFooter = false;
    body.classList.remove("bg-gray-100");
  },
  beforeUnmount() {
    this.$store.state.hideConfigButton = false;
    this.$store.state.showNavbar = true;
    this.$store.state.showSidenav = true;
    this.$store.state.showFooter = true;
    body.classList.add("bg-gray-100");
  },
  // data() {
  //   return {
  //     email: "",
  //     password: "",
  //     name: "",
  //     companyName: "",
  //   };
  // },

  setup() {
    const email = ref("");
    const password = ref("");
    const firstName = ref("");
    const lastName = ref("");
    const companyName = ref("");
    const error = ref(null);

    const store = useStore();
    const router = useRouter();

    const handleSubmit = async () => {
      await store.dispatch("signup", {
        email: email.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value,
        companyName: companyName.value,
      });
      router.push("/dashboard-default");
    };

    return {
      handleSubmit,
      email,
      password,
      firstName,
      lastName,
      companyName,
      error,
    };
  },
};
</script>
