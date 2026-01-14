import express from "express";
import cors from "cors";
import adminRoutes from "../src/routes/admin.routes.js";

const app = express();

app.use(cors());

// IMPORTANT: Move JSON parsers BEFORE routes, 
// but Multer handles the multipart parsing for specific routes.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use only ONE admin router
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

export default app;