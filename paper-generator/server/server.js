import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import twilio from 'twilio';

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

// MongoDB setup
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Twilio setup
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const fromNumber = process.env.TWILIO_PHONE;

// OTP Schema (auto delete after 5 min)
const otpSchema = new mongoose.Schema({
  mobile: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, expires: 300 }
});
const OTP = mongoose.model('OTP', otpSchema);

// Send OTP
app.post('/api/send-otp', async (req, res) => {
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
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;
  const record = await OTP.findOne({ mobile, otp });
  if (!record) {
    return res.json({ success: false, message: 'Invalid OTP' });
  }

  // OTP valid — delete it and return success
  await OTP.deleteMany({ mobile });
  res.json({ success: true, message: 'OTP verified successfully' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
