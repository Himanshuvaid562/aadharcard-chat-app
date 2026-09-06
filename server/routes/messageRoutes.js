const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");

router.get("/:receiverId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.user }
      ]
    }).sort({ createdAt: 1 }).limit(500);
    res.json(messages);
  } catch (err) { res.status(500).json({ message: "Failed to fetch messages" }); }
});

router.post("/mark-read/:senderId", auth, async (req, res) => {
  try { await Message.updateMany({ sender: req.params.senderId, receiver: req.user, read: false }, { read: true }); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ message: "Failed" }); }
});

module.exports = router;
