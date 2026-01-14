import fs from "fs";
import path from "path";

/**
 * Saves raw OCR JSON to local disk (dev mode)
 */
export function saveRawOCRToDisk(ocrJobId, ocrJsonArray) {
  const dir = path.join("ocr-output", `job-${ocrJobId}`);

  fs.mkdirSync(dir, { recursive: true });

  ocrJsonArray.forEach((json, index) => {
    const filePath = path.join(dir, `page-${index + 1}.json`);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
  });

  return dir;
}
