require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const twilio = require("twilio");

// MODELS
const User = require("./models/User.js");
const Selection = require("./models/Selection.js");

// ROUTES
const ocrRoutes = require("./routes/ocr.js");

// INIT APP
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));

// Twilio setup
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const fromNumber = process.env.TWILIO_PHONE;

// OTP Schema (auto delete after 5 min)
const otpSchema = new mongoose.Schema({
  mobile: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, expires: 300 }
});
const OTP = mongoose.model("OTP", otpSchema);

// OCR ROUTES
app.use("/api/ocr", ocrRoutes);
console.log("📌 OCR ROUTES REGISTERED ON /api/ocr");


// ========== SEND OTP ==========
app.post("/api/send-otp", async (req, res) => {
  const { mobile } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.deleteMany({ mobile });
  await OTP.create({ mobile, otp });

  try {
    await client.messages.create({
      body: `Your OTP for login is ${otp}`,
      from: fromNumber,
      to: `+91${mobile}`
    });
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Failed to send OTP" });
  }
});

// ========== VERIFY OTP ==========
app.post("/api/verify-otp", async (req, res) => {
  const { mobile, otp } = req.body;
  const record = await OTP.findOne({ mobile, otp });

  if (!record)
    return res.json({ success: false, message: "Invalid OTP" });

  let user = await User.findOne({ mobile });
  if (!user) user = new User({ mobile, verified: true });
  else user.verified = true;

  await user.save();
  await OTP.deleteMany({ mobile });

  res.json({ success: true, message: "OTP verified", user });
});

// SAVE ROLE
app.post("/api/save-role", async (req, res) => {
  try {
    const { mobile, role } = req.body;

    if (!mobile || !role)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const user = await User.findOneAndUpdate(
      { mobile },
      { role },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "Role saved", user });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET USER
app.post("/api/get-user", async (req, res) => {
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ mobile });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// SAVE SELECTION
app.post("/api/save-selection", async (req, res) => {
  try {
    const { teacher, board, className, subject, bookTypes } = req.body;

    if (!teacher || !board || !className || !subject || !bookTypes?.length)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const selection = await Selection.create({
      teacher,
      board,
      className,
      subject,
      bookTypes,
    });

    res.json({ success: true, message: "Selection saved", selection });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error while saving selection",
    });
  }
});

// GET LAST SELECTION
app.post("/api/get-last-selection", async (req, res) => {
  try {
    const { teacher } = req.body;

    if (!teacher)
      return res.status(400).json({ success: false, message: "Teacher missing" });

    const selection = await Selection.findOne({ teacher }).sort({ createdAt: -1 });

    if (!selection)
      return res.json({ success: false, message: "No selection found" });

    res.json({ success: true, selection });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// START SERVER
app.listen(5000, () => console.log("Server running on port 5000"));
