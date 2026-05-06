import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_ENDPOINT.replace("/api", "");

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("join", userId);
    });
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
