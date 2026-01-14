import fs from "fs";
import path from "path";
import { normalizeLayout } from "../parser/layoutNormalizer.js";
import { detectQuestions } from "../parser/questionDetector.js";
import { processAnswers } from "../parser/answerProcessor.js";

const dir = "ocr-output/job-1";

const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
const ocrJsonArray = files.map(f =>
  JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"))
);

const blocks = normalizeLayout(ocrJsonArray);
const questions = detectQuestions(blocks);
const finalQuestions = processAnswers(questions);

console.log(JSON.stringify(finalQuestions, null, 2));
