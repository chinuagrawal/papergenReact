// utils/pdfToImages.js
const path = require("path");
const fs = require("fs");
const os = require("os");
const poppler = require("pdf-poppler");

module.exports.convertPdfToImages = async function convertPdfToImages(pdfPath) {
  try {
    const outputDir = path.join(os.tmpdir(), "pdf_pages_" + Date.now());
    fs.mkdirSync(outputDir);

    let opts = {
      format: "png",
      out_dir: outputDir,
      out_prefix: "page",
      page: null
    };

    console.log("📄 Converting PDF → images using Poppler...");

    await poppler.convert(pdfPath, opts);

    // Collect generated PNGs in correct page order
    const files = fs.readdirSync(outputDir)
      .filter(f => f.endsWith(".png"))
      .sort((a, b) => {
        const n1 = parseInt(a.replace("page-", "").replace(".png", ""));
        const n2 = parseInt(b.replace("page-", "").replace(".png", ""));
        return n1 - n2;
      })
      .map(f => path.join(outputDir, f));

    console.log("✔ PDF converted to", files.length, "pages");

    return files;
  } catch (err) {
    console.error("❌ Poppler conversion failed:", err);
    throw err;
  }
};
