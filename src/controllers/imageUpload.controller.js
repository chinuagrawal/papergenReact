import { uploadToGCS } from "../services/gcs.service.js";

export async function uploadQuestionImage(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = await uploadToGCS(
      file.buffer,
      file.mimetype
    );

    res.json({ success: true, imageUrl });
  } catch (err) {
    res.status(500).json({ error: "Image upload failed" });
  }
}
