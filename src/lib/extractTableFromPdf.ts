type PositionedText = { x: number; y: number; str: string };

/**
 * Groups text items into table rows by clustering nearby y-positions
 * (PDF coordinates are bottom-up, so items are sorted by descending y to
 * read top-to-bottom).
 */
function groupIntoRows(
  items: PositionedText[],
  rowThreshold = 4,
): PositionedText[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y);
  const rows: PositionedText[][] = [];

  for (const item of sorted) {
    const lastRow = rows[rows.length - 1];
    if (lastRow && Math.abs(lastRow[0].y - item.y) <= rowThreshold) {
      lastRow.push(item);
    } else {
      rows.push([item]);
    }
  }

  rows.forEach((row) => row.sort((a, b) => a.x - b.x));
  return rows;
}

/**
 * Finds canonical column x-positions across the whole page by clustering
 * every item's x-start position, so text in different rows that starts at
 * roughly the same horizontal position lines up in the same column.
 */
function buildColumnBins(rows: PositionedText[][], colThreshold = 12): number[] {
  const xs = rows
    .flat()
    .map((item) => item.x)
    .sort((a, b) => a - b);

  const bins: number[] = [];
  for (const x of xs) {
    if (bins.length === 0 || x - bins[bins.length - 1] > colThreshold) {
      bins.push(x);
    }
  }
  return bins;
}

function nearestBinIndex(x: number, bins: number[]): number {
  let best = 0;
  let bestDist = Infinity;
  bins.forEach((bin, idx) => {
    const dist = Math.abs(x - bin);
    if (dist < bestDist) {
      bestDist = dist;
      best = idx;
    }
  });
  return best;
}

/**
 * Reconstructs a page's text items into a table grid. This is a heuristic
 * (position-clustering), not true table detection - works well for PDFs
 * with genuine text-based tabular layouts, but won't be perfect for
 * complex or scanned layouts, same tradeoff every "PDF to Excel" tool makes.
 */
export function reconstructTable(items: PositionedText[]): string[][] {
  if (items.length === 0) return [];

  const rows = groupIntoRows(items);
  const bins = buildColumnBins(rows);

  return rows.map((row) => {
    const cells = new Array(bins.length).fill("");
    for (const item of row) {
      const binIdx = nearestBinIndex(item.x, bins);
      cells[binIdx] = cells[binIdx] ? `${cells[binIdx]} ${item.str}` : item.str;
    }
    return cells;
  });
}

export type { PositionedText };
