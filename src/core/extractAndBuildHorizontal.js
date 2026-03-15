import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import sharp from 'sharp';

/**
 * @typedef {{ rows: number, cols: number }} Grid
 *
 * @typedef {{
 *   inputFile: string,
 *   detectionMode: 'Auto Detect' | 'Manual Grid',
 *   grid: Grid | null,
 *   cellSize: number,
 *   outputFile: string,
 * }} ExtractHorizontalOptions
 */

/**
 * Extracts individual sprites from a sprite sheet, normalizes each one into
 * a square cell with transparent padding, and composites them into a single
 * horizontal PNG strip.
 *
 * Input example : 1024×1024 sheet containing 4 sprites (2×2 grid)
 * Output example: 2048×512 horizontal strip when cellSize = 512
 *
 * @param {ExtractHorizontalOptions} options
 */
export async function extractAndBuildHorizontal({
  inputFile,
  detectionMode,
  grid,
  cellSize,
  outputFile,
}) {
  const spinner = ora('Loading image...').start();

  // ─── Step 1: Load source image and read metadata ──────────────────────────
  const source = sharp(inputFile);
  const { width: imageWidth, height: imageHeight } = await source.metadata();

  // ─── Step 2: Determine grid and extract sprite regions ───────────────────
  spinner.text = 'Extracting sprite regions...';

  let rows, cols;

  if (detectionMode === 'Manual Grid') {
    rows = grid.rows;
    cols = grid.cols;
  } else {
    // Auto Detect: fallback to a 2×2 grid
    rows = 2;
    cols = 2;
  }

  const cellWidth  = Math.floor(imageWidth  / cols);
  const cellHeight = Math.floor(imageHeight / rows);
  const spriteCount = rows * cols;

  // Extract each grid cell as a raw PNG buffer
  const extractedBuffers = await Promise.all(
    Array.from({ length: spriteCount }, (_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;

      return sharp(inputFile)
        .extract({
          left:   col * cellWidth,
          top:    row * cellHeight,
          width:  cellWidth,
          height: cellHeight,
        })
        .png()
        .toBuffer();
    })
  );

  // ─── Step 3: Normalize each sprite into a square cell ────────────────────
  spinner.text = 'Normalizing sprites...';

  const normalizedBuffers = await Promise.all(
    extractedBuffers.map((buf) => normalizeSpriteToCell(buf, cellSize))
  );

  // ─── Step 4: Build horizontal strip ──────────────────────────────────────
  spinner.text = 'Building horizontal sheet...';

  const stripWidth = cellSize * spriteCount;

  const compositeInput = normalizedBuffers.map((buf, i) => ({
    input: buf,
    left:  i * cellSize,
    top:   0,
  }));

  const outputPath = path.isAbsolute(outputFile)
    ? outputFile
    : path.join(process.cwd(), outputFile);

  await sharp({
    create: {
      width:      stripWidth,
      height:     cellSize,
      channels:   4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .composite(compositeInput)
    .toFile(outputPath);

  spinner.succeed(chalk.green('Done!'));

  console.log(
    chalk.gray('\n  Input    : ') + chalk.white(inputFile) +
    chalk.gray('\n  Mode     : ') + chalk.white(detectionMode) +
    chalk.gray('\n  Grid     : ') + chalk.white(`${rows} rows × ${cols} cols`) +
    chalk.gray('\n  Sprites  : ') + chalk.white(spriteCount) +
    chalk.gray('\n  Cell size: ') + chalk.white(`${cellSize}×${cellSize}px`) +
    chalk.gray('\n  Output   : ') + chalk.white(outputPath) +
    chalk.gray('\n  Canvas   : ') + chalk.white(`${stripWidth}×${cellSize}px`) + '\n'
  );
}

/**
 * Resizes a sprite buffer to fit within a square cell, centered on a
 * transparent canvas. Preserves aspect ratio; never upscales beyond cellSize.
 *
 * @param {Buffer} spriteBuffer - Raw PNG buffer of the extracted sprite
 * @param {number} cellSize     - Side length of the output square canvas (px)
 * @returns {Promise<Buffer>}   - PNG buffer of the normalized cell
 */
async function normalizeSpriteToCell(spriteBuffer, cellSize) {
  // Trim transparent edges to get the tightest bounding box
  const trimmed = await sharp(spriteBuffer).trim().png().toBuffer();
  const { width: trimW, height: trimH } = await sharp(trimmed).metadata();

  // Scale so the longest side fits inside cellSize (no upscaling)
  const scale     = Math.min(cellSize / trimW, cellSize / trimH, 1);
  const resizedW  = Math.round(trimW * scale);
  const resizedH  = Math.round(trimH * scale);

  const resized = await sharp(trimmed)
    .resize(resizedW, resizedH, { fit: 'fill' })
    .png()
    .toBuffer();

  // Center on a transparent cellSize × cellSize canvas
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
