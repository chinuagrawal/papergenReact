import { Storage } from "@google-cloud/storage";

console.log("DEBUG GCS_BUCKET_NAME =", process.env.GCS_BUCKET_NAME);

if (!process.env.GCS_BUCKET_NAME) {
  throw new Error("❌ GCS_BUCKET_NAME is not set. Check .env loading.");
}

const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

export async function uploadToGCS(localPath, destination) {
  await bucket.upload(localPath, { destination, resumable: false });
  return `gs://${bucket.name}/${destination}`;
}
