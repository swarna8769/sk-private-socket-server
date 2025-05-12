import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const users = new Map();

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("register", ({ uid }) => {
    users.set(uid, socket.id);
  });

  socket.on("private-message", ({ to, from, message }) => {
    const targetSocketId = users.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("receive-private-message", { from, message });
    }
  });

  socket.on("disconnect", () => {
    for (const [uid, id] of users.entries()) {
      if (id === socket.id) {
        users.delete(uid);
        break;
      }
    }
  });
});

server.listen(10000, () => {
  console.log("Server running on port 10000");
});
