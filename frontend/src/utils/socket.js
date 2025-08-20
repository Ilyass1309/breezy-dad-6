import { io } from "socket.io-client";

const socket = io("http://localhost:3002", {
  autoConnect: false, // on connectera manuellement après avoir le user.id
});

export default socket;
