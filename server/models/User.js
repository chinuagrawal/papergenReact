const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    mobile: { type: String, unique: true, required: true },
    otp: { type: String },
    role: { type: String, enum: ["teacher", "student", null], default: null },
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true, // ✅ adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("User", userSchema);
