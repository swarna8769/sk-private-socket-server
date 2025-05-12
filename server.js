import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // ඔබේ client origin එක මෙතන දැමිය හැක
  },
});

const users = new Map();

// ✅ මෙතනට ඔබේ code එක add කරන්න
io.on("connection", (socket) => {
  console.log("✅ A user connected");

  socket.on("register", ({ uid }) => {
    console.log("🔗 Registered UID:", uid);
    users.set(uid, socket.id);
  });

  socket.on("private-message", ({ to, from, message }) => {
    console.log(`📩 Message from ${from} to ${to}: ${message}`);
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
    console.log("❌ User disconnected");
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
