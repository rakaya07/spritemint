import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import sharp from 'sharp';
import { normalizeToCell, autoDetectGrid } from '../utils/image.js';

/**
 * @typedef {{ rows: number, cols: number }} Grid
 *
 * @typedef {{
 *   inputFile:     string,
 *   detectionMode: 'Auto Detect' | 'Manual Grid',
 *   grid:          Grid | null,
 *   cellSize:      number,
 *   outputFile:    string,
 * }} ExtractHorizontalOptions
 */

/**
 * Extracts individual sprites from a sprite sheet, normalizes each one into
 * a square cell with transparent padding, and composites them into a single
 * horizontal PNG strip.
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
  const spinner = ora('Loading image…').start();

  const source = sharp(inputFile);
  const { width: imageWidth, height: imageHeight } = await source.metadata();

  spinner.text = 'Determining grid…';

  let rows, cols;

  if (detectionMode === 'Manual Grid') {
    rows = grid.rows;
    cols = grid.cols;
  } else {
    const detected = autoDetectGrid(imageWidth, imageHeight);
    if (detected) {
      rows = detected.rows;
      cols = detected.cols;
      spinner.info(chalk.cyan(`  Auto-detected grid: ${rows} rows × ${cols} cols`));
      spinner.start('Extracting sprite regions…');
    } else {
      spinner.stop();
      console.log(chalk.yellow('  Could not auto-detect grid. Please enter manually.\n'));
      const { manualRows, manualCols } = await inquirer.prompt([
        {
          type:     'input',
          name:     'manualRows',
          message:  'Number of rows:',
          validate: (input) => {
            const n = parseInt(input, 10);
            return (Number.isInteger(n) && n > 0) || 'Please enter a positive integer.';
          },
          filter: (input) => parseInt(input, 10),
        },
        {
          type:     'input',
          name:     'manualCols',
          message:  'Number of columns:',
          validate: (input) => {
            const n = parseInt(input, 10);
            return (Number.isInteger(n) && n > 0) || 'Please enter a positive integer.';
          },
          filter: (input) => parseInt(input, 10),
        },
      ]);
      rows = manualRows;
      cols = manualCols;
      spinner.start('Extracting sprite regions…');
    }
  }

  const cellWidth   = Math.floor(imageWidth  / cols);
  const cellHeight  = Math.floor(imageHeight / rows);
  const spriteCount = rows * cols;

  // Extract all grid cells in parallel
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

  // Normalize each sprite in parallel, capturing per-sprite errors
  spinner.text = 'Normalizing sprites…';

  const normalizeResults = await Promise.all(
    extractedBuffers.map(async (buf, i) => {
      try {
        const normalized = await normalizeToCell(buf, cellSize);
        return { ok: true, buf: normalized, index: i };
      } catch (err) {
        return { ok: false, index: i, message: err.message };
      }
    })
  );

  const succeeded = normalizeResults.filter((r) => r.ok);
  const failed    = normalizeResults.filter((r) => !r.ok);

  if (succeeded.length === 0) {
    spinner.fail(chalk.red('All sprites failed to normalize.'));
    for (const { index, message } of failed) {
      console.log(chalk.red(`  ✖ sprite ${index + 1}: `) + chalk.gray(message));
    }
    return;
  }

  // Build horizontal strip
  spinner.text = 'Building horizontal sheet…';

  const stripWidth     = cellSize * succeeded.length;
  const compositeInput = succeeded.map(({ buf }, i) => ({
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

  if (failed.length === 0) {
    spinner.succeed(chalk.green('Done!'));
  } else {
    spinner.warn(chalk.yellow(`Finished with ${failed.length} error${failed.length !== 1 ? 's' : ''}.`));
    for (const { index, message } of failed) {
      console.log(chalk.red(`  ✖ sprite ${index + 1}: `) + chalk.gray(message));
    }
  }

  console.log(
    chalk.gray('\n  Input    : ') + chalk.white(inputFile) +
    chalk.gray('\n  Mode     : ') + chalk.white(detectionMode) +
    chalk.gray('\n  Grid     : ') + chalk.white(`${rows} rows × ${cols} cols`) +
    chalk.gray('\n  Sprites  : ') + chalk.white(`${succeeded.length} / ${spriteCount}`) +
    chalk.gray('\n  Cell size: ') + chalk.white(`${cellSize}×${cellSize}px`) +
    chalk.gray('\n  Output   : ') + chalk.white(outputPath) +
    chalk.gray('\n  Canvas   : ') + chalk.white(`${stripWidth}×${cellSize}px`) + '\n'
  );
}
