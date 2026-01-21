import { readOcrJsonFromGcs } from "../services/gcsOcrStorage.service.js";
import { getOCRJobById } from "../models/ocrJob.model.js";


export async function getOCRResult(req, res) {
  const { jobId } = req.params;

  const job = await getOCRJobById(jobId);

  if (!job) {
    return res.status(404).json({ error: "OCR job not found" });
  }

  if (job.status !== "completed") {
    return res.json({ status: job.status });
  }

  const data = await readOcrJsonFromGcs(jobId);

  res.json({
    status: "completed",
    questions: data.questions || []
  });
}
