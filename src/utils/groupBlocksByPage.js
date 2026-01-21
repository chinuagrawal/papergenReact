export function groupBlocksByPage(blocks) {
  const pages = {};

  for (const block of blocks) {
    if (!pages[block.page]) {
      pages[block.page] = [];
    }
    pages[block.page].push(block);
  }

  return Object.entries(pages).map(([page, blocks]) => ({
    page: Number(page),
    blocks
  }));
}
