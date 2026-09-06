const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") }); // fallback for docker env file at root

const connectDB = require("./config/db");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);

// DB
connectDB();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

// Serve React build in production, fallback to public for dev backward-compat
const clientDist = path.join(__dirname, "../client/dist");
const publicDir = path.join(__dirname, "../public");

try {
  const fs = require("fs");
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) return res.status(404).json({ message: "Not found" });
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    app.use(express.static(publicDir));
  }
} catch (e) { app.use(express.static(publicDir)); }

// Socket.IO with CORS
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
});
setupSocket(io);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} | env: ${process.env.NODE_ENV || 'development'}`));
