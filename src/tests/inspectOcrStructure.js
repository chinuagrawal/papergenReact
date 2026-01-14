import fs from "fs";
import path from "path";

const dir = "ocr-output/job-1";

const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

const sample = JSON.parse(
  fs.readFileSync(path.join(dir, files[0]), "utf-8")
);

// 🔥 Print top-level keys
console.log("TOP LEVEL KEYS:", Object.keys(sample));

// 🔥 Check responses
if (sample.responses?.length) {
  console.log("Responses count:", sample.responses.length);
  console.log("Response[0] keys:", Object.keys(sample.responses[0]));

  const doc = sample.responses[0].document;
  console.log("Document keys:", Object.keys(doc));
  console.log("Pages count:", doc.pages?.length);

  const page = doc.pages?.[0];
  if (page) {
    console.log("Page keys:", Object.keys(page));
    console.log("paragraphs:", page.paragraphs?.length);
    console.log("blocks:", page.blocks?.length);
    console.log("lines:", page.lines?.length);
    console.log("tokens:", page.tokens?.length);
  }
} else {
  console.log("❌ No responses[] found");
}
