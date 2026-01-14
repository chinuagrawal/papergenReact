import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FORCE load .env from root BEFORE anything else
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// Optional hard proof
console.log("BOOTSTRAP ENV GCS_BUCKET_NAME =", process.env.GCS_BUCKET_NAME);

// Now load the actual server
import("./server.js");
        