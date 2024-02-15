<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar
          isBlur="blur border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow"
          v-bind:darkMode="true"
          isBtn="bg-gradient-success"
        />
      </div>
    </div>
  </div>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <div
              class="mx-auto col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0"
            >
              <div class="card card-plain">
                <div class="pb-0 card-header text-start">
                  <h4 class="font-weight-bolder">Sign In</h4>
                  <p class="mb-0">Enter your email and password to sign in</p>
                </div>
                <div class="card-body">
                  <!-- Display error message if it exists -->
                  <div
                    v-if="error"
                    class="alert alert-danger alert-dismissible fade show rounded-0"
                    role="alert"
                  >
                    <strong>Error:</strong> {{ error }}
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="alert"
                      aria-label="Close"
                    ></button>
                  </div>
                  <form @submit.prevent="handleSubmit">
                    <div class="mb-3">
                      <label for="email" class="form-label visually-hidden"
                        >Email</label
                      >
                      <input
                        type="email"
                        class="form-control"
                        id="email"
                        placeholder="Email"
                        name="email"
                        size="lg"
                        v-model="email"
                        required
                      />
                    </div>
                    <div class="mb-3">
                      <label for="password" class="form-label visually-hidden"
                        >Password</label
                      >
                      <input
                        type="password"
                        class="form-control"
                        id="password"
                        placeholder="Password"
                        name="password"
                        size="lg"
                        v-model="password"
                        required
                      />
                    </div>
                    <div class="text-center">
                      <button
                        type="submit"
                        class="btn btn-success btn-lg mt-4"
                        fullWidth
                      >
                        Sign in
                      </button>
                    </div>
                  </form>
                </div>
                <div class="px-1 pt-0 text-center card-footer px-lg-2">
                  <p class="mx-auto mb-4 text-sm">
                    Don't have an account?
                    <a
                      href="javascript:;"
                      class="text-success text-gradient font-weight-bold"
                      >Sign up</a
                    >
                  </p>
                </div>
              </div>
            </div>
            <div
              class="top-0 my-auto text-center col-6 d-lg-flex d-none h-100 pe-0 position-absolute end-0 justify-content-center flex-column"
            >
              <div
                class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
                style="
                  background-image: url('https://images.unsplash.com/photo-1471110338536-858caa3dbe45?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
                  background-size: cover;
                "
              >
                <span class="mask bg-gradient-success opacity-6"></span>
                <h4
                  class="mt-5 text-white font-weight-bolder position-relative"
                >
                  QueueEase where queueing is made easy!
                </h4>
                <p class="text-white position-relative">
                  A Modern Queue Management System for your business
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import Navbar from "@/examples/PageLayout/Navbar.vue";
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const body = document.getElementsByTagName("body")[0];

export default {
  name: "signin",
  components: {
    Navbar,
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

  setup() {
    const email = ref("");
    const password = ref("");
    const error = ref(null);

    const store = useStore();
    const router = useRouter();

    const handleSubmit = async () => {
      try {
        await store.dispatch("signin", {
          email: email.value,
          password: password.value,
        });
        // Fetch the user information after successful signin
        const user = await store.dispatch("getUserInfo");

        // Commit the user information to the Vuex store
        store.commit("setUser", user);

        // Access the user state after committing the mutation
        router.push("/dashboard-default");
      } catch (err) {
        error.value = err.message;
      }
    };
    return { email, password, handleSubmit, error };
  },
};
// methods: {
//   login() {
//     const auth = getAuth();

//     signInWithEmailAndPassword(auth, this.email, this.password)
//       .then((userCredential) => {
//         // Signed in
//         const user = userCredential.user;
//         console.log(user.uid); // Example of accessing user data (UID)

//         alert("Welcome bossku lets fucking go baby!!!");
//         this.$router.push("/dashboard-default");
//         // ...
//       })
//       .catch((error) => {
//         alert(error.message);
//         // Handle errors
//       });
//   },
// },
</script>
