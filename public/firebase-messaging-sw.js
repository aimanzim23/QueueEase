import { initializeApp } from "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
import {
  getMessaging,
  onBackgroundMessage,
} from "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js";

// Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyCyek_KYCR0FVSvcj_q1G8TA_Wjc3wWlog",
  authDomain: "queue-ease-58c8d.firebaseapp.com",
  projectId: "queue-ease-58c8d",
  storageBucket: "queue-ease-58c8d.appspot.com",
  messagingSenderId: "939207601352",
  appId: "1:939207601352:web:efb6939135f082c6e209fd",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/apple-icon.png",
  };

  // Display the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
