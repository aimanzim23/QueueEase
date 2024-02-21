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
import VueQRCodeComponent from "vue-qrcode-component";
//firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Web app's Firebase configuration
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

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
const messaging = getMessaging();

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  // ...
});
getToken(messaging, {
  vapidKey:
    "BO08Y1tFXwbFlaTRY874_v25c2m4cDuC80M4tEgrwHmBDxg4ohe0QqGHM1Ijlp5sRIpfvb9RDs_l1WMlK2UD0rs",
})
  .then((currentToken) => {
    if (currentToken) {
      console.log("currentToken:", currentToken);
    } else {
      // Show permission request UI
      console.log(
        "No registration token available. Request permission to generate one."
      );
      // ...
    }
  })
  .catch((err) => {
    console.log("An error occurred while retrieving token. ", err);
    // ...
  });

const appInstance = createApp(App);
appInstance.use(store);
appInstance.use(router);
appInstance.use(ArgonDashboard);
library.add(fas);
appInstance.component("fa", FontAwesomeIcon);
appInstance.component("qr-code", VueQRCodeComponent);

router.beforeEach(async (to, from, next) => {
  const authRequired = to.matched.some((route) => route.meta.authRequired);
  const user = auth.currentUser;

  if (user || !authRequired) {
    next();
  } else {
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        store.commit("setUser", user);
        unsubscribe();
        resolve();
      });
    });

    const updatedUser = auth.currentUser;
    if (updatedUser) {
      next();
    } else {
      next("/signin");
    }
  }
});

if (navigator.serviceWorker) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(function (registration) {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch(function (error) {
      console.error("Error registering Service Worker:", error);
    });
}

const unsubscribe = auth.onAuthStateChanged((user) => {
  store.commit("setUser", user);

  appInstance.mount("#app");
  unsubscribe();
});

export { app, db, auth };
