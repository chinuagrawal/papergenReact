require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
// const twilio = require("twilio");

// MODELS
const User = require("./models/User.js");
const Selection = require("./models/Selection.js");
const { sequelize } = require('./models');

// ROUTES
const ocrRoutes = require("./routes/ocr.js");

// INIT APP
const app = express();
app.use(cors());
app.use(bodyParser.json());




const multer = require('multer');
const path = require('path');

const upload = multer({ dest: path.join(__dirname, 'tmp') });
const ocrController = require('./controllers/ocrController');
const adminController = require('./controllers/adminController');


app.use(express.json());

// MongoDB setup
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error("❌ DB error", err));

// // Twilio setup
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
// const fromNumber = process.env.TWILIO_PHONE;

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
// app.post("/api/send-otp", async (req, res) => {
//   const { mobile } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   await OTP.deleteMany({ mobile });
//   await OTP.create({ mobile, otp });

//   try {
//     await client.messages.create({
//       body: `Your OTP for login is ${otp}`,
//       from: fromNumber,
//       to: `+91${mobile}`
//     });
//     res.json({ success: true, message: "OTP sent successfully" });
//   } catch (err) {
//     console.log(err);
//     res.json({ success: false, message: "Failed to send OTP" });
//   }
// });


app.post("/api/send-otp", async (req, res) => {
  try {
    let { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile required" });
    }

    // India format (no +)
    mobile = mobile.startsWith("91") ? mobile : `91${mobile}`;

    const otp = Math.floor(100000 + Math.random() * 900000);

    await OTP.create({
      mobile,
      otp
    });

    await axios.get(
      `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${mobile}/${otp}`
    );

    res.json({ success: true, message: "OTP sent" });

  } catch (err) {
    console.error("OTP error:", err.message);
    res.status(500).json({ success: false });
  }
});
// ========== VERIFY OTP ==========
app.post("/api/verify-otp", async (req, res) => {
  let { mobile, otp } = req.body;
  // 🔑 SAME FORMAT AS send-otp
  mobile = mobile.startsWith("91") ? mobile : `91${mobile}`;
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


// init DB
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // dev convenience
    console.log('DB connected');
  } catch (e) { console.error(e); process.exit(1); }
})();

// routes
app.post('/api/admin/upload', upload.single('file'), ocrController.processUpload);
app.get('/api/admin/documents', adminController.listDocuments);
app.get('/api/admin/documents/:id', adminController.getDocument);
app.put('/api/admin/questions/:id', adminController.updateQuestion);
app.delete('/api/admin/questions/:id', adminController.deleteQuestion);
app.delete('/api/admin/documents/:id', adminController.deleteDocument);

// static uploads serve for local storage
if (process.env.USE_GCS !== 'true') {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}



