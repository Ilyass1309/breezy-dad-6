import { io } from "socket.io-client";

const SOCKET_URL = process.env.MESSAGE_SERVICE_URL || "https://message-service-cpmd.onrender.com";
const socket = io(SOCKET_URL, {
  autoConnect: false, // on connectera manuellement après avoir le user.id
});

export default socket;
