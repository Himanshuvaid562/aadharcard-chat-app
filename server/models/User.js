const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  aadhaar: { type: String, required: true, unique: true, match: /^[0-9]{12}$/, index: true },
  password: { type: String, required: true, minlength: 6 },
  online: { type: Boolean, default: false },
  avatar: { type: String, default: "" },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
