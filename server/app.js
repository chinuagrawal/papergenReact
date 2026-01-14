import express from "express";
import cors from "cors";

import adminRoutes from "../src/routes/admin.routes.js";
import ocrUploadRoutes from "../src/routes/ocrUpload.routes.js";

const app = express();

app.use(cors());

/**
 * 1️⃣ Multipart routes FIRST
 * No body parsers here
 */
app.use("/api/admin", ocrUploadRoutes);

/**
 * 2️⃣ JSON body parsers AFTER multipart
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 3️⃣ Normal admin routes
 */
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

export default app;
