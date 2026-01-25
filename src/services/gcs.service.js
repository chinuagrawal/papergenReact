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
 * Upload Buffer to GCS (for images)
 * Returns public HTTP URL
 */
export async function uploadBufferToGCS(buffer, mimeType) {
  const filename = `images/${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const file = bucket.file(filename);

  await file.save(buffer, {
    contentType: mimeType,
    resumable: false,
  });

  // Make the file public (Requires 'Fine-grained' access control on bucket)
  try {
    await file.makePublic();
  } catch (err) {
    console.warn(
      `⚠️ Failed to make file public: ${filename}. Ensure bucket has 'Fine-grained' access control. Error: ${err.message}`,
    );
  }

  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
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
