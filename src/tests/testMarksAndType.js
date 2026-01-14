import fs from "fs";
import path from "path";
import { normalizeLayout } from "../parser/layoutNormalizer.js";
import { detectQuestions } from "../parser/questionDetector.js";
import { processAnswers } from "../parser/answerProcessor.js";
import { detectMarksAndType } from "../parser/marksAndTypeDetector.js";

const dir = "ocr-output/job-1";

const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
const ocrJsonArray = files.map(f =>
  JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"))
);

const blocks = normalizeLayout(ocrJsonArray);
const q1 = detectQuestions(blocks);
const q2 = processAnswers(q1);
const finalQuestions = detectMarksAndType(q2);

console.log(JSON.stringify(finalQuestions, null, 2));
