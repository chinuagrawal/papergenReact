import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

/**
 * Saves final OCR JSON to YOUR bucket
 */
export async function saveOcrJsonToGcs(jobId, data) {
  const filePath = `ocr-output/job-${jobId}/questions.json`;

  await bucket.file(filePath).save(
    JSON.stringify(data, null, 2),
    { contentType: "application/json" }
  );

  return `gs://${bucket.name}/${filePath}`;
}


/**
 * Reads OCR JSON from YOUR bucket
 */
/**
 * Reads FINAL AI-processed OCR JSON from GCS
 */
export async function readOcrJsonFromGcs(jobId) {
  const filePath = `ocr-output/job-${jobId}/questions.json`;
  const file = bucket.file(filePath);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error("OCR output not found in GCS");
  }

  const [buf] = await file.download();
  return JSON.parse(buf.toString("utf-8"));
}
