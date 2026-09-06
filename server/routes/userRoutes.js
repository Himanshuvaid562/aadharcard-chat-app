const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    const q = req.query.search;
    let filter = { _id: { $ne: req.user } };
    if (q) filter.name = { $regex: q, $options: "i" };
    const users = await User.find(filter).select("-password").sort({ online: -1, name: 1 }).limit(100);
    res.json(users);
  } catch (err) { res.status(500).json({ message: "Failed to fetch users" }); }
});

module.exports = router;
