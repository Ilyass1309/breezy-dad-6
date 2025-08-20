require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const notificationRoutes = require("./src/routes/notification.routes");

const app = express();
const cors = require("cors");
const corsOptions = require('./config/corsOptions');
app.use(cors(corsOptions));
const port = 3004;

app.use(express.json());
app.use("/api/notifications", notificationRoutes);

mongoose
  .connect("mongodb://mongo-notification:27017/notificationdb")
  .then(() => {
    console.log("Connected to MongoDB for notification Service");

    app.listen(port, () => {
      console.log("Notification Service is running on port", port);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB for Notification Service:", err);
  });
