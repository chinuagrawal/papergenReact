const path = require('path');
const fs = require('fs');

const USE_GCS = (process.env.USE_GCS === 'true');

if (USE_GCS) {
  const { Storage } = require('@google-cloud/storage');
  const storage = new Storage();
  const bucket = storage.bucket(process.env.GCS_BUCKET);
  module.exports.uploadToGCS = async (localPath, destPath) => {
    await bucket.upload(localPath, { destination: destPath, resumable: false });
    return `gs://${process.env.GCS_BUCKET}/${destPath}`;
  };
} else {
  module.exports.uploadToGCS = async (localPath, destPath) => {
    const dest = path.join(process.cwd(), 'uploads', destPath);
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    await fs.promises.copyFile(localPath, dest);
    return dest; // local path returned
  };
}
