// server/utils/cropImage.js
const sharp = require('sharp');

/**
 * Crop image from bbox with safe validation & clamping.
 * - Accepts bbox keys: { left, top, width, height } OR { x, y, w, h }
 * - Also accepts normalized bbox in 0..1 range (auto-detects if all values <= 1)
 *
 * @param {string} inputPath - path to source image
 * @param {string} outPath - path to write cropped image
 * @param {object} bbox - bounding box
 * @returns {Promise<object>} returns metadata about the crop { left, top, width, height }
 */
async function cropFromBBox(inputPath, outPath, bbox) {
  if (!bbox || typeof bbox !== 'object') {
    throw new Error('cropFromBBox: invalid bbox argument');
  }

  // normalize keys
  let { left, top, width, height, x, y, w, h } = bbox;
  if (x !== undefined) left = x;
  if (y !== undefined) top = y;
  if (w !== undefined) width = w;
  if (h !== undefined) height = h;

  // get image metadata
  const image = sharp(inputPath);
  const meta = await image.metadata();
  const imgW = meta.width || 0;
  const imgH = meta.height || 0;

  if (!imgW || !imgH) {
    throw new Error(`cropFromBBox: unable to determine image dimensions for ${inputPath}`);
  }

  // if bbox appears normalized (all values between 0 and 1), convert to pixels
  const allNumbers = [left, top, width, height].every(v => typeof v === 'number');
  if (!allNumbers) {
    throw new Error('cropFromBBox: bbox must contain numeric coordinates');
  }

  const isNormalized =
    left >= 0 && left <= 1 &&
    top >= 0 && top <= 1 &&
    width >= 0 && width <= 1 &&
    height >= 0 && height <= 1;

  let L = isNormalized ? Math.round(left * imgW) : Math.round(left);
  let T = isNormalized ? Math.round(top * imgH) : Math.round(top);
  let W = isNormalized ? Math.round(width * imgW) : Math.round(width);
  let H = isNormalized ? Math.round(height * imgH) : Math.round(height);

  // Defensive: ensure ints and non-negative
  L = Number.isFinite(L) ? L : 0;
  T = Number.isFinite(T) ? T : 0;
  W = Number.isFinite(W) ? W : 0;
  H = Number.isFinite(H) ? H : 0;

  // Clamp to image bounds (ensure at least 1x1)
  if (L < 0) L = 0;
  if (T < 0) T = 0;
  if (L >= imgW) L = Math.max(0, imgW - 1);
  if (T >= imgH) T = Math.max(0, imgH - 1);

  // Adjust width/height so crop stays inside image
  W = Math.min(W, imgW - L);
  H = Math.min(H, imgH - T);

  // Ensure positive size (sharp requires width & height > 0)
  if (W <= 0 || H <= 0) {
    // helpful debug message
    const err = new Error(
      `cropFromBBox: invalid crop after clamping — image ${imgW}x${imgH}, requested L=${L},T=${T},W=${W},H=${H}`
    );
    err.meta = { imgW, imgH, origBBox: bbox, clamped: { left: L, top: T, width: W, height: H } };
    throw err;
  }

  // perform crop
  await image
    .extract({ left: L, top: T, width: W, height: H })
    .toFile(outPath);

  return { left: L, top: T, width: W, height: H, outPath };
}

module.exports = { cropFromBBox };
