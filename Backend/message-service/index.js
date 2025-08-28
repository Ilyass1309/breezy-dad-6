const express = require("express");
const mongoose = require("mongoose");
const http = require("http"); // pour créer le serveur HTTP
const { Server } = require("socket.io"); // import de socket.io
const messageRoutes = require("./src/routes/message.routes");
require("dotenv").config();

const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app); //serveur HTTP à partir de Express
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin, // à restreindre en prod
    methods: ["GET", "POST"],
  },
});

// Middleware pour autoriser les CORS normaux
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// Health routes
app.use('/', require('./src/routes/health.routes'));

// Injecte l'objet io dans la requête (pour usage dans les contrôleurs)
app.set("io", io);

// Routes REST
app.use("/api/messages", messageRoutes);

// Connexion WebSocket
io.on("connection", (socket) => {
  // log removed

  // Le client envoie son userId une fois connecté
  socket.on("join", (userId) => {
    socket.join(userId); // Le client rejoint une room privée
  // log removed
  });

  socket.on("disconnect", () => {
  // log removed
  });
});

const port = 3002;

// Démarrage du serveur
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
  // log removed

    server.listen(port, () => {
      // pas app.listen, mais server.listen
  // log removed
    });
  })
  .catch((err) => {
  // log removed
  });
