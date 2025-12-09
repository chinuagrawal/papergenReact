const poppler = require('pdf-poppler');
const path = require('path');
const fs = require('fs');

exports.convertPdfToImages = async (pdfPath) => {
  const outDir = path.join(__dirname, '../page-images');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const options = {
    format: 'jpeg',
    out_dir: outDir,
    out_prefix: 'page',
    page: null,
  };

  await poppler.convert(pdfPath, options);

  // Return images sorted: page-1.jpg, page-2.jpg...
  const images = fs.readdirSync(outDir)
    .filter(f => f.startsWith('page'))
    .map(f => path.join(outDir, f))
    .sort();

  return images;
};
