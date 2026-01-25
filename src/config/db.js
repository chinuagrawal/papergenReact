import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.PG_CONNECTION,
  ssl: { rejectUnauthorized: false } // required for Neon / cloud PG
});

// Handle idle client errors to prevent crash
pool.on("error", (err) => {
  console.error("Unexpected error on idle client (src/config/db)", err);
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
