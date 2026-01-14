import fs from "fs";
import path from "path";
import { normalizeLayout } from "../parser/layoutNormalizer.js";

const JOB_ID = 1;
const dir = `ocr-output/job-${JOB_ID}`;

const files = fs
  .readdirSync(dir)
  .filter(f => f.endsWith(".json"));

const ocrJsonArray = files.map(f =>
  JSON.parse(
    fs.readFileSync(path.join(dir, f), "utf-8")
  )
);

const normalized = normalizeLayout(ocrJsonArray);

// Show first 20 blocks
console.log(normalized.slice(0, 20));
