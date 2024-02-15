const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("./admin.js");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.options("*", cors()); // Enable preflight for all routes

// Your existing API endpoint
app.post("/send-notification", (req, res) => {
  const { registrationToken, title, body } = req.body;

  const message = {
    notification: {
      title,
      body,
    },
    token: registrationToken,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
      res.status(200).json({ success: true, response });
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      res.status(500).json({ success: false, error });
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
