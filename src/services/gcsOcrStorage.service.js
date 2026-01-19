import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

/**
 * Saves final OCR JSON to YOUR bucket
 */
export async function saveOcrJsonToGcs(jobId, pages) {
  const prefix = `ocr-output/job-${jobId}`;

  for (let i = 0; i < pages.length; i++) {
    await bucket
      .file(`${prefix}/page-${i + 1}.json`)
      .save(JSON.stringify(pages[i], null, 2), {
        contentType: "application/json",
      });
  }

  return `gs://${bucket.name}/${prefix}`;
}

/**
 * Reads OCR JSON from YOUR bucket
 */
export async function readOcrJsonFromGcs(jobId) {
  const prefix = `ocr-output/job-${jobId}/`;

  const [files] = await bucket.getFiles({ prefix });
  const jsonFiles = files.filter(f => f.name.endsWith(".json"));

  if (!jsonFiles.length) {
    throw new Error("OCR output not found in GCS");
  }

  const pages = [];

  for (const file of jsonFiles) {
    const [buf] = await file.download();
    pages.push(JSON.parse(buf.toString()));
  }

  return pages;
}
