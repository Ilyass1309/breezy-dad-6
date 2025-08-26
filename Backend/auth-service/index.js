const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const swaggerDocs = require("./utils/swagger");
const { logger } = require("./src/middlewares/logger");

const cors = require("cors");
const corsOptions = require('./config/corsOptions');

const port = 3000;

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(cookieParser());

app.use(cors(corsOptions));

// --- Routes ---
const authRoutes = require("./src/routes/auth.routes");
app.use("/api/auth", authRoutes);

// Health simple
app.get("/api/health", (req, res) => res.status(200).send("OK"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  swaggerDocs(app, port);
});
