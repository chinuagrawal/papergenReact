import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

/**
 * Fetches raw OCR JSON files written by Document AI
 */
export async function fetchRawOCRJson(outputPrefix) {
  const [files] = await bucket.getFiles({
    prefix: outputPrefix,
  });

  const jsonFiles = files.filter(f => f.name.endsWith(".json"));

  if (jsonFiles.length === 0) {
    throw new Error("No OCR output JSON found");
  }

  const results = [];

  for (const file of jsonFiles) {
    const [contents] = await file.download();
    results.push(JSON.parse(contents.toString("utf-8")));
  }

  return results;
}
