// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", ({ uid }) => {
    users[uid] = socket.id;
    console.log("Registered:", uid, socket.id);
  });

  socket.on("private-message", ({ to, from, message }) => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("receive-private-message", { from, message });
    }
  });

  socket.on("disconnect", () => {
    for (const uid in users) {
      if (users[uid] === socket.id) {
        delete users[uid];
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
