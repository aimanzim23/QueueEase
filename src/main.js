import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
import ArgonDashboard from "./argon-dashboard";
//firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyek_KYCR0FVSvcj_q1G8TA_Wjc3wWlog",
  authDomain: "queue-ease-58c8d.firebaseapp.com",
  projectId: "queue-ease-58c8d",
  storageBucket: "queue-ease-58c8d.appspot.com",
  messagingSenderId: "939207601352",
  appId: "1:939207601352:web:efb6939135f082c6e209fd",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Auth persistence set to session");
  })
  .catch((error) => {
    console.error("Persistence error:", error);
  });

auth.onAuthStateChanged((user) => {
  const appInstance = createApp(App);
  appInstance.use(store);
  appInstance.use(router);
  appInstance.use(ArgonDashboard);
  library.add(fas);
  appInstance.component("fa", FontAwesomeIcon);

  router.beforeEach((to, from, next) => {
    const authRequired = to.matched.some((route) => route.meta.authRequired);
    if (!user && authRequired) {
      next("/signin");
    } else {
      next();
    }
  });

  appInstance.mount("#app");
});

export { app, db, auth };
