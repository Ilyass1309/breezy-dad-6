require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const notificationRoutes = require("./src/routes/notification.routes");
const cookieParser = require('cookie-parser');

const app = express();
const cors = require("cors");
const corsOptions = require('./config/corsOptions');
app.use(cors(corsOptions));
const port = 3004;

app.use(express.json());
app.use(cookieParser());
// Health routes
app.use('/', require('./src/routes/health.routes'));
app.use("/api/notifications", notificationRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
  // log removed

    app.listen(port, () => {
  // log removed
    });
  })
  .catch((err) => {
  // log removed
  });
