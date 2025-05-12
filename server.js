import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// ✅ Enable CORS
const io = new Server(server, {
  cors: {
    origin: "*", // 🔥 allow all frontend origins (Firebase hosted frontend, etc.)
    methods: ["GET", "POST"]
  }
});

// ✅ Ping route for Railway health check / browser test
app.get("/", (req, res) => {
  res.send("✅ Socket server is running!");
});

// 🔗 Map to hold connected users: uid => socket.id
const users = new Map();

// 🚀 New connection
io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  // 🟢 Register user with UID
  socket.on("register", ({ uid }) => {
    users.set(uid, socket.id);
    console.log("✅ Registered UID:", uid);
  });

  // ✉️ Private messaging handler
  socket.on("private-message", ({ to, from, message }) => {
    console.log(`📩 Message from ${from} to ${to}: ${message}`);

    const targetSocketId = users.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("receive-private-message", { from, message });
    }
  });

  // 🔌 Handle disconnect
  socket.on("disconnect", () => {
    for (const [uid, id] of users.entries()) {
      if (id === socket.id) {
        users.delete(uid);
        break;
      }
    }
    console.log("❌ Disconnected:", socket.id);
  });
});

// 🚀 Start server on Railway (PORT from env or 3000 fallback)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
