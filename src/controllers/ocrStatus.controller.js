import { getOCRJob } from "../models/ocrJob.model.js";

export async function getOCRStatus(req, res) {
  const { jobId } = req.params;

  const job = await getOCRJob(jobId);
  if (!job) {
    return res.status(404).json({ error: "OCR job not found" });
  }

  res.json({
    id: job.id,
    status: job.status,
    outputPath: job.output_path,
    error: job.error,
    updatedAt: job.updated_at,
  });
}
