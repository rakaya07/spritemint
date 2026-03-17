import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import sharp from 'sharp';
import { normalizeToCell } from '../utils/image.js';

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

  const spinner = ora(`Processing ${files.length} sprites…`).start();

  // Normalize all sprites in parallel
  const results = await Promise.all(
    files.map(async (inputPath, i) => {
      const filename = path.basename(inputPath);
      try {
        const buf = await normalizeToCell(inputPath, cellSize);
        const col = isGrid ? i % cols : i;
        const row = isGrid ? Math.floor(i / cols) : 0;
        return { ok: true, input: buf, left: col * cellSize, top: row * cellSize };
      } catch (err) {
        return { ok: false, filename, message: err.message };
      }
    })
  );

  const composites = results.filter((r) => r.ok).map(({ input, left, top }) => ({ input, left, top }));
  const errors     = results.filter((r) => !r.ok);
  const processed  = composites.length;
  const failed     = errors.length;

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
