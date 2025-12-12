const sharp = require('sharp');
const fs = require('fs');

module.exports.cropFromBBox = async (pageImagePath, outPath, bbox) => {
  // bbox expected in pixels: { left, top, width, height }
  // clamp values
  const img = sharp(pageImagePath);
  const meta = await img.metadata();
  let left = Math.max(0, Math.floor(bbox.left));
  let top = Math.max(0, Math.floor(bbox.top));
  let width = Math.min(meta.width - left, Math.floor(bbox.width));
  let height = Math.min(meta.height - top, Math.floor(bbox.height));
  if (width <= 0 || height <= 0) throw new Error('Invalid crop dims');
  await img.extract({ left, top, width, height }).png().toFile(outPath);
  return outPath;
};
