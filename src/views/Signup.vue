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
        background-image: url('https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signup-cover.jpg');
        background-position: top;
      "
    >
      <span class="mask bg-gradient-dark opacity-6"></span>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 text-center mx-auto">
            <h1 class="text-white mb-2 mt-5">Welcome!</h1>
            <p class="text-lead text-white">
              Use these awesome forms to login or create new account in your
              project for free.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row mt-lg-n10 mt-md-n11 mt-n10 justify-content-center">
        <div class="col-xl-4 col-lg-5 col-md-7 mx-auto">
          <div class="card z-index-0">
            <div class="card-header text-center pt-4">
              <h5>Register with</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
                <input
                  type="name"
                  placeholder="Name"
                  aria-label="Name"
                  v-model="name"
                />
                <input
                  type="companyName"
                  placeholder="Company Name"
                  aria-label="Company Name"
                  v-model="companyName"
                />
                <input
                  type="email"
                  placeholder="Email"
                  aria-label="Email"
                  v-model="email"
                />
                <input
                  type="password"
                  placeholder="Password"
                  aria-label="Password"
                  v-model="password"
                />

                <div class="text-center">
                  <button
                    type="submit"
                    fullWidth
                    color="dark"
                    variant="gradient"
                    class="my-4 mb-2"
                  >
                    Sign up
                  </button>
                  <div v-if="error">{{ error }}</div>
                </div>
                <p class="text-sm mt-3 mb-0">
                  Already have an account?
                  <a href="javascript:;" class="text-dark font-weight-bolder"
                    >Sign in</a
                  >
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
  name: "signin",
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

    const store = useStore();
    const router = useRouter();
    const error = ref(null);

    const handleSubmit = async () => {
      try {
        await store.dispatch("signup", {
          email: email.value,
          password: password.value,
        });
        router.push("/dashboard-default");
      } catch (err) {
        error.value = err.message;
      }
    };

    return { handleSubmit, email, password };
  },
};
</script>
