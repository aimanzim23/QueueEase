var admin = require("firebase-admin");

const path = require("path");
const serviceAccount = require(path.resolve(
  __dirname,
  "queue-ease-58c8d-firebase-adminsdk-askcp-df728f8a8d.json"
));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// This registration token comes from the client FCM SDKs.
const registrationToken =
  "dmwxwKquN70eFuMiTAI7DA:APA91bFQalUlyuqjxccDkW-ju7VwoFLBDRN66IDZoaINr3L_CHHoskU6ngM63JQiCKQ5ZXgOXxmHmZbOV_Z6iVO5SBikaKAIzJZOJK2R07z8ap_UR1-NMb0gg3aqi4g3zY0ZVB5Irbsv";

const message = {
  notification: {
    title: "I Am admin",
    body: "Hi client",
  },
  webpush: {
    fcmOptions: {
      link: "/?breakingnews",
    },
  },
  token: registrationToken,
};

// Send a message to the device corresponding to the provided
// registration token.
admin
  .messaging()
  .send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log("Successfully sent message:", response);
    console.log(__dirname);
  })
  .catch((error) => {
    console.log("Error sending message:", error);
  });

module.exports = admin;
