import { Storage } from "@google-cloud/storage";

console.log("DEBUG GCS_BUCKET_NAME =", process.env.GCS_BUCKET_NAME);

if (!process.env.GCS_BUCKET_NAME) {
  throw new Error("❌ GCS_BUCKET_NAME is not set. Check .env loading.");
}

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

/**
 * Upload local file (PDF etc.) to GCS
 */
export async function uploadToGCS(localPath, destination) {
  await bucket.upload(localPath, {
    destination,
    resumable: false,
  });

  return `gs://${bucket.name}/${destination}`;
}

/**
 * Upload JSON object directly to GCS
 * (used for AI output)
 */
export async function uploadJsonToGCS(destination, jsonData) {
  const file = bucket.file(destination);

  await file.save(JSON.stringify(jsonData, null, 2), {
    contentType: "application/json",
  });

  return `gs://${bucket.name}/${destination}`;
}
