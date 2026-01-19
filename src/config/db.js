import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Neon / cloud PG
});

// Fires when a client is actually checked out
pool.on("connect", () => {
  
});

// 🔥 Explicit startup check (recommended during development)
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected & ready");
  } catch (err) {
    console.error("❌ PostgreSQL connection failed");
    console.error(err);
    process.exit(1); // fail fast if DB is unreachable
  }
})();
