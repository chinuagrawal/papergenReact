/**
 * Layout Normalizer
 * Works with Document AI batch OCR shard output (page-*.json)
 */

export function normalizeLayout(ocrJsonArray) {
  const blocks = [];

  for (const shard of ocrJsonArray) {
    const fullText = shard.text || "";
    const pages = shard.pages || [];

    pages.forEach((page, pageIndex) => {
      const pageNumber = pageIndex + 1;

      // Use best available structural unit
      const elements =
        page.paragraphs ||
        page.blocks ||
        page.lines ||
        [];

      elements.forEach(el => {
        const text = extractTextFromAnchor(
          fullText,
          el.layout?.textAnchor
        );
        if (!text) return;

        const bbox = extractBoundingBox(
          el.layout?.boundingPoly
        );

        const confidence = el.layout?.confidence ?? 0.9;

        blocks.push({
          page: pageNumber,
          text,
          bbox,
          confidence,
        });
      });
    });
  }

  // Sort by reading order
  blocks.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    if (a.bbox.y !== b.bbox.y) return a.bbox.y - b.bbox.y;
    return a.bbox.x - b.bbox.x;
  });

  return mergeNearby(blocks);
}
function extractTextFromAnchor(fullText, textAnchor) {
  if (!textAnchor?.textSegments?.length) return "";

  return textAnchor.textSegments
    .map(seg =>
      fullText.substring(
        Number(seg.startIndex),
        Number(seg.endIndex)
      )
    )
    .join("")
    .replace(/[ \t]+/g, " ")   // collapse spaces
.replace(/\n{3,}/g, "\n\n") // keep line breaks
.trim();

    
}

function extractBoundingBox(boundingPoly) {
  if (!boundingPoly?.normalizedVertices?.length) {
    return { x: 0, y: 0 };
  }

  const v = boundingPoly.normalizedVertices;
  return {
    x: v[0]?.x ?? 0,
    y: v[0]?.y ?? 0,
  };
}

function mergeNearby(blocks) {
  const merged = [];
  const Y_THRESHOLD = 0.02;

  for (const block of blocks) {
    const last = merged[merged.length - 1];

    if (
      last &&
      last.page === block.page &&
      Math.abs(last.bbox.y - block.bbox.y) < Y_THRESHOLD
    ) {
      last.text += " " + block.text;
      last.confidence = Math.min(last.confidence, block.confidence);
    } else {
      merged.push({ ...block });
    }
  }

  return merged;
}
