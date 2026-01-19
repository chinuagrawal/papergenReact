import { Storage } from "@google-cloud/storage";

/**
 * Reads OCR JSON written by Document AI
 * (NOT your bucket)
 */
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function fetchRawOCRJson(outputPrefix) {
  // outputPrefix is a FULL GCS PATH
  // gs://bucket-name/path/...

  const match = outputPrefix.match(/^gs:\/\/([^/]+)\/(.+)$/);
  if (!match) {
    throw new Error("Invalid OCR output prefix");
  }

  const [, bucketName, prefix] = match;

  const bucket = storage.bucket(bucketName);

  const [files] = await bucket.getFiles({ prefix });

  const jsonFiles = files.filter(f => f.name.endsWith(".json"));

  if (!jsonFiles.length) {
    throw new Error("No OCR output JSON found");
  }

  const results = [];

  for (const file of jsonFiles) {
    const [contents] = await file.download();
    results.push(JSON.parse(contents.toString("utf-8")));
  }

  return results;
}
