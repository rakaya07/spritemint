import sharp from 'sharp';

export const SIZE_CHOICES = {
  S256:   '256',
  S512:   '512',
  S1024:  '1024',
  CUSTOM: 'Custom size',
};

/**
 * Returns true if the file extension is a supported image type.
 * @param {string} filename
 * @returns {boolean}
 */
export function isSupportedImage(filename) {
  return /\.(png|jpg|jpeg|webp)$/i.test(filename);
}

/**
 * Clamps a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Trims transparent edges, resizes to fit inside `cellSize` (preserving aspect
 * ratio, never upscaling), centers on a transparent square canvas, and returns
 * the result as a PNG Buffer.
 *
 * @param {string|Buffer} input - File path or raw PNG buffer.
 * @param {number}        cellSize
 * @returns {Promise<Buffer>}
 */
export async function normalizeToCell(input, cellSize) {
  const trimmed = await sharp(input).trim().png().toBuffer();
  const { width: trimW, height: trimH } = await sharp(trimmed).metadata();

  const scale    = Math.min(cellSize / trimW, cellSize / trimH, 1);
  const resizedW = Math.round(trimW * scale);
  const resizedH = Math.round(trimH * scale);

  const resized = await sharp(trimmed)
    .resize(resizedW, resizedH, { fit: 'fill' })
    .png()
    .toBuffer();

  const left = Math.floor((cellSize - resizedW) / 2);
  const top  = Math.floor((cellSize - resizedH) / 2);

  return sharp({
    create: {
      width:      cellSize,
      height:     cellSize,
      channels:   4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .composite([{ input: resized, left, top }])
    .toBuffer();
}

/**
 * Attempts to auto-detect the grid layout of a sprite sheet by finding common
 * row/column combinations where each cell has power-of-two dimensions.
 * Falls back to any combination that produces square cells.
 * Returns null if no suitable grid is found.
 *
 * @param {number} imageWidth
 * @param {number} imageHeight
 * @returns {{ rows: number, cols: number } | null}
 */
export function autoDetectGrid(imageWidth, imageHeight) {
  // Exclude [1,1] — a single-cell "grid" is never a useful sprite sheet
  const candidates = [
    [1, 2], [2, 1], [2, 2],
    [1, 4], [4, 1], [2, 4], [4, 2], [4, 4],
    [1, 8], [8, 1], [2, 8], [8, 2], [4, 8], [8, 4], [8, 8],
  ];

  // Collect all candidates where both cell dimensions are powers of two
  const valid = [];
  for (const [rows, cols] of candidates) {
    const cellW = imageWidth  / cols;
    const cellH = imageHeight / rows;
    if (
      Number.isInteger(cellW) && Number.isInteger(cellH) &&
      isPowerOfTwo(cellW) && isPowerOfTwo(cellH)
    ) {
      valid.push({ rows, cols, cellW, cellH });
    }
  }

  if (valid.length > 0) {
    // Prefer: 1) most square cell (aspect ratio closest to 1:1)
    //         2) fewest cells (simplest grid)
    valid.sort((a, b) => {
      const ratioA = Math.max(a.cellW, a.cellH) / Math.min(a.cellW, a.cellH);
      const ratioB = Math.max(b.cellW, b.cellH) / Math.min(b.cellW, b.cellH);
      if (ratioA !== ratioB) return ratioA - ratioB;
      return (a.rows * a.cols) - (b.rows * b.cols);
    });
    return { rows: valid[0].rows, cols: valid[0].cols };
  }

  // Fallback: any integer division producing square cells
  for (const [rows, cols] of candidates) {
    const cellW = imageWidth  / cols;
    const cellH = imageHeight / rows;
    if (Number.isInteger(cellW) && Number.isInteger(cellH) && cellW === cellH) {
      return { rows, cols };
    }
  }

  return null;
}

function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}
