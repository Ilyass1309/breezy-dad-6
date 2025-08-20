const express = require("express");
const mongoose = require("mongoose");
const http = require("http"); // pour créer le serveur HTTP
const { Server } = require("socket.io"); // import de socket.io
const messageRoutes = require("./src/routes/message.routes");
require("dotenv").config();

const cors = require("cors");
const corsOptions = require("./config/corsOptions");

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

// Injecte l'objet io dans la requête (pour usage dans les contrôleurs)
app.set("io", io);

// Routes REST
app.use("/messages", messageRoutes);

// Connexion WebSocket
io.on("connection", (socket) => {
  console.log("Nouvelle connexion WebSocket :", socket.id);

  // Le client envoie son userId une fois connecté
  socket.on("join", (userId) => {
    socket.join(userId); // Le client rejoint une room privée
    console.log(`User ${userId} a rejoint sa room.`);
  });

  socket.on("disconnect", () => {
    console.log("Déconnexion :", socket.id);
  });
});

const port = 3002;

// Démarrage du serveur
mongoose
  .connect("mongodb://mongo-message:27017/messagedb")
  .then(() => {
    console.log("Connected to the database!");

    server.listen(port, () => {
      // pas app.listen, mais server.listen
      console.log(`Message service listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
