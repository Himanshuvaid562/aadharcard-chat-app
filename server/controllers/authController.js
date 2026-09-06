const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const aadhaarRegex = /^[0-9]{12}$/;

exports.register = async (req, res) => {
  try {
    const { name, aadhaar, password } = req.body;
    if (!name || !aadhaar || !password) return res.status(400).json({ message: "All fields are required" });
    if (!aadhaarRegex.test(aadhaar)) return res.status(400).json({ message: "Aadhaar must be 12 digits" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (name.trim().length < 2) return res.status(400).json({ message: "Name too short" });

    const exists = await User.findOne({ aadhaar });
    if (exists) return res.status(400).json({ message: "User already exists with this Aadhaar" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), aadhaar, password: hashed });

    res.status(201).json({ message: "Registered successfully", user: { _id: user._id, name: user.name, aadhaar: user.aadhaar } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { aadhaar, password } = req.body;
    if (!aadhaar || !password) return res.status(400).json({ message: "Aadhaar and password required" });

    const user = await User.findOne({ aadhaar });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, aadhaar: user.aadhaar }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // mark online
    user.online = true;
    await user.save().catch(() => {});

    res.json({
      token,
      user: { _id: user._id, name: user.name, aadhaar: user.aadhaar, online: true, createdAt: user.createdAt }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
