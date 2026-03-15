import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import sharp from 'sharp';

const LAYOUT = {
  HORIZONTAL: 'Horizontal Strip',
  GRID:       'Grid',
};

/**
 * Builds a sprite sheet from the given PNG files.
 *
 * @param {{
 *   files:      string[],
 *   cellSize:   number,
 *   layout:     string,
 *   cols:       number,
 *   outputName: string,
 * }} options
 */
export async function buildSpriteSheet({ files, cellSize, layout, cols, outputName }) {
  const isGrid    = layout === LAYOUT.GRID;
  const sheetCols = isGrid ? cols : files.length;
  const rows      = isGrid ? Math.ceil(files.length / cols) : 1;

  const sheetWidth  = cellSize * sheetCols;
  const sheetHeight = cellSize * rows;

  const spinner    = ora(`Processing 1 / ${files.length}`).start();
  const composites = [];
  let processed    = 0;
  let failed       = 0;
  const errors     = [];

  // ─── Normalize each sprite and compute its position ───────────────────────
  for (let i = 0; i < files.length; i++) {
    const inputPath = files[i];
    const filename  = path.basename(inputPath);
    spinner.text = `Processing ${i + 1} / ${files.length}  —  ${filename}`;

    try {
      const cellBuf = await normalizeToCell(inputPath, cellSize);
      const col     = isGrid ? i % cols : i;
      const row     = isGrid ? Math.floor(i / cols) : 0;

      composites.push({ input: cellBuf, left: col * cellSize, top: row * cellSize });
      processed++;
    } catch (err) {
      failed++;
      errors.push({ filename, message: err.message });
    }
  }

  // ─── Composite onto the final sheet canvas ────────────────────────────────
  spinner.text = 'Compositing sprite sheet…';

  const outputPath = path.join(process.cwd(), outputName);

  await sharp({
    create: {
      width:      sheetWidth,
      height:     sheetHeight,
      channels:   4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .composite(composites)
    .toFile(outputPath);

  // ─── Result ───────────────────────────────────────────────────────────────
  if (failed === 0) {
    spinner.succeed(chalk.green(`Done! Sprite sheet built from ${processed} image${processed !== 1 ? 's' : ''}.`));
  } else {
    spinner.warn(chalk.yellow(`Finished with ${failed} error${failed !== 1 ? 's' : ''}.`));
    for (const { filename, message } of errors) {
      console.log(chalk.red(`  ✖ ${filename}: `) + chalk.gray(message));
    }
  }

  console.log(
    chalk.gray('\n  Images   : ') + chalk.white(`${processed} selected`) +
    chalk.gray('\n  Layout   : ') + chalk.white(layout) +
    (isGrid
      ? chalk.gray('\n  Grid     : ') + chalk.white(`${sheetCols} cols × ${rows} rows`)
      : '') +
    chalk.gray('\n  Cell     : ') + chalk.white(`${cellSize}×${cellSize}px`) +
    chalk.gray('\n  Output   : ') + chalk.white(outputPath) + '\n'
  );
}

/**
 * Loads a single PNG, trims transparent edges, resizes so the longest side
 * fits inside `cellSize` (preserving aspect ratio, no upscaling), then centers
 * the result on a transparent `cellSize × cellSize` canvas.
 *
 * @param {string} inputPath
 * @param {number} cellSize
 * @returns {Promise<Buffer>}
 */
async function normalizeToCell(inputPath, cellSize) {
  const trimmed = await sharp(inputPath).trim().png().toBuffer();
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
