const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const User = require("./models/User");

let onlineUsers = {}; // userId -> socketId

function setupSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    let raw = token;
    if (raw && raw.startsWith("Bearer ")) raw = raw.slice(7);
    if (!raw) return next(new Error("Authentication error: no token"));
    try {
      const decoded = jwt.verify(raw, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Socket connected:", socket.userId);
    onlineUsers[socket.userId] = socket.id;
    try { await User.findByIdAndUpdate(socket.userId, { online: true }); } catch {}

    // broadcast online users
    io.emit("onlineUsers", Object.keys(onlineUsers));

    socket.on("sendMessage", async ({ receiverId, text }) => {
      if (!receiverId || !text?.trim()) return;
      if (text.length > 2000) return;
      try {
        const message = await Message.create({ sender: socket.userId, receiver: receiverId, text: text.trim() });
        const populated = await message.populate([{ path: "sender", select: "name aadhaar" }, { path: "receiver", select: "name aadhaar" }]);
        const payload = {
          _id: populated._id,
          sender: populated.sender._id,
          senderName: populated.sender.name,
          receiver: populated.receiver._id,
          text: populated.text,
          createdAt: populated.createdAt,
          read: populated.read
        };
        if (onlineUsers[receiverId]) io.to(onlineUsers[receiverId]).emit("receiveMessage", payload);
        socket.emit("receiveMessage", payload);
      } catch (err) { console.error("sendMessage error", err); socket.emit("errorMessage", { message: "Failed to send" }); }
    });

    socket.on("typing", ({ receiverId, isTyping }) => {
      if (onlineUsers[receiverId]) io.to(onlineUsers[receiverId]).emit("typing", { senderId: socket.userId, isTyping });
    });

    socket.on("markRead", async ({ senderId }) => {
      try { await Message.updateMany({ sender: senderId, receiver: socket.userId, read: false }, { read: true }); } catch {}
    });

    socket.on("disconnect", async () => {
      delete onlineUsers[socket.userId];
      console.log("Socket disconnected:", socket.userId);
      try { await User.findByIdAndUpdate(socket.userId, { online: false, lastSeen: new Date() }); } catch {}
      io.emit("onlineUsers", Object.keys(onlineUsers));
    });
  });
}

module.exports = setupSocket;
