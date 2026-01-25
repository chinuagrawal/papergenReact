import app from "./app.js";
import pg from "pg";
import axios from "axios";

const { Pool } = pg;
const PORT = process.env.PORT || 5000;

// PostgreSQL Pool
const connectionString = process.env.PG_CONNECTION || process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "❌ CRITICAL: PG_CONNECTION or DATABASE_URL is missing in .env",
  );
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Handle idle client errors to prevent crash
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  // Do not exit the process, let the pool handle reconnection of new clients
});

// Test DB Connection
pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch((err) => console.error("❌ DB Connection Error:", err.message));

// ========== SEND OTP ==========
app.post("/api/send-otp", async (req, res) => {
  try {
    let { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile required" });

    // India format
    mobile = mobile.startsWith("91") ? mobile : `91${mobile}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Postgres (upsert or just insert - createTables said id serial primary key)
    // We should clean up old OTPs for this mobile first
    await pool.query("DELETE FROM otps WHERE mobile = $1", [mobile]);
    await pool.query("INSERT INTO otps (mobile, otp) VALUES ($1, $2)", [
      mobile,
      otp,
    ]);

    // Send SMS
    if (process.env.TWOFACTOR_API_KEY) {
      await axios.get(
        `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${mobile}/${otp}`,
      );
    } else {
      console.log(`⚠️ No TWOFACTOR_API_KEY, OTP for ${mobile} is ${otp}`);
    }

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("OTP error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== VERIFY OTP ==========
app.post("/api/verify-otp", async (req, res) => {
  try {
    let { mobile, otp } = req.body;
    if (!mobile || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Missing mobile or otp" });

    mobile = mobile.startsWith("91") ? mobile : `91${mobile}`;

    // Check OTP
    const otpRes = await pool.query(
      "SELECT * FROM otps WHERE mobile = $1 AND otp = $2",
      [mobile, otp],
    );
    if (otpRes.rows.length === 0) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Check/Create User
    let userRes = await pool.query("SELECT * FROM users WHERE mobile = $1", [
      mobile,
    ]);
    let user;

    if (userRes.rows.length === 0) {
      // Create new user
      const newUser = await pool.query(
        "INSERT INTO users (mobile, role, verified) VALUES ($1, $2, $3) RETURNING *",
        [mobile, null, true], // Default role to null so user must select it
      );
      user = newUser.rows[0];
    } else {
      // Update verified
      await pool.query("UPDATE users SET verified = $1 WHERE mobile = $2", [
        true,
        mobile,
      ]);
      user = userRes.rows[0];
      user.verified = true;
    }

    // Cleanup OTP
    await pool.query("DELETE FROM otps WHERE mobile = $1", [mobile]);

    res.json({ success: true, message: "OTP verified", user });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== GET USER ==========
app.post("/api/get-user", async (req, res) => {
  try {
    let { mobile } = req.body;
    if (!mobile)
      return res
        .status(400)
        .json({ success: false, message: "Mobile required" });

    mobile = mobile.startsWith("91") ? mobile : `91${mobile}`;

    const userRes = await pool.query("SELECT * FROM users WHERE mobile = $1", [
      mobile,
    ]);
    if (userRes.rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: userRes.rows[0] });
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== SAVE ROLE ==========
app.post("/api/save-role", async (req, res) => {
  try {
    let { mobile, role } = req.body;
    if (!mobile || !role)
      return res
        .status(400)
        .json({ success: false, message: "Missing mobile or role" });

    mobile = mobile.startsWith("91") ? mobile : `91${mobile}`;

    // Update role
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE mobile = $2 RETURNING *",
      [role, mobile],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Save Role Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== GET QUESTIONS BY CHAPTERS ==========
app.post("/api/get-questions-by-chapters", async (req, res) => {
  try {
    const { chapterIds } = req.body;
    if (!chapterIds || !Array.isArray(chapterIds) || chapterIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chapterIds" });
    }

    // Convert to integers just in case
    const ids = chapterIds.map((id) => parseInt(id)).filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return res.json({ success: true, questions: [] });
    }

    const query = `
      SELECT * FROM questions 
      WHERE chapter_id = ANY($1::int[]) 
      ORDER BY 
        CASE 
          WHEN COALESCE(qtype, question_type) ILIKE '%Very Short%' THEN 1
          WHEN COALESCE(qtype, question_type) ILIKE '%Short%' THEN 2
          WHEN COALESCE(qtype, question_type) ILIKE '%Long%' THEN 3
          WHEN COALESCE(qtype, question_type) ILIKE '%MCQ%' THEN 4
          ELSE 5 
        END, 
        id
    `;

    const result = await pool.query(query, [ids]);

    res.json({ success: true, questions: result.rows });
  } catch (err) {
    console.error("Get Questions Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
