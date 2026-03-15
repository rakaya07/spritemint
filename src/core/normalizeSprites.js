import fs from 'fs';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import sharp from 'sharp';

/**
 * @param {{ files: string[], size: number }} options
 *   files - Absolute paths of the PNG files to process.
 *   size  - Side length of the output square canvas in pixels.
 */
export async function normalizeSprites({ files, size }) {
  // ─── Prepare output directory ─────────────────────────────────────────────
  const outputDir = path.join(process.cwd(), 'normalized');
  fs.mkdirSync(outputDir, { recursive: true });

  // ─── Process each sprite ──────────────────────────────────────────────────
  const spinner = ora(`Processing 1 / ${files.length}`).start();
  let processed = 0;
  let failed = 0;
  const errors = [];

  for (const inputPath of files) {
    const filename = path.basename(inputPath);
    spinner.text = `Processing ${processed + 1} / ${files.length}  —  ${filename}`;

    try {
      const outputPath = path.join(outputDir, filename);
      await normalizeSpriteFile(inputPath, outputPath, size);
      processed++;
    } catch (err) {
      failed++;
      errors.push({ filename, message: err.message });
    }
  }

  // ─── Result ───────────────────────────────────────────────────────────────
  if (failed === 0) {
    spinner.succeed(chalk.green(`Done! ${processed} sprite${processed !== 1 ? 's' : ''} normalized.`));
  } else {
    spinner.warn(chalk.yellow(`Finished with ${failed} error${failed !== 1 ? 's' : ''}.`));
    for (const { filename, message } of errors) {
      console.log(chalk.red(`  ✖ ${filename}: `) + chalk.gray(message));
    }
  }

  console.log(
    chalk.gray('\n  Output : ') + chalk.white(outputDir) +
    chalk.gray('\n  Size   : ') + chalk.white(`${size}×${size}px`) +
    chalk.gray('\n  Files  : ') + chalk.white(`${processed} processed`) +
    (failed > 0 ? chalk.red(`, ${failed} failed`) : '') + '\n'
  );
}

/**
 * Loads a single PNG, trims transparent edges, resizes to fit inside a square
 * of `size × size` (preserving aspect ratio, no upscaling), then centers the
 * result on a transparent square canvas with equal padding on all sides.
 *
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {number} size
 */
async function normalizeSpriteFile(inputPath, outputPath, size) {
  // Trim transparent edges for a tight bounding box
  const trimmed = await sharp(inputPath).trim().png().toBuffer();
  const { width: trimW, height: trimH } = await sharp(trimmed).metadata();

  // Scale so the longest side fits inside `size` — never upscale
  const scale    = Math.min(size / trimW, size / trimH, 1);
  const resizedW = Math.round(trimW * scale);
  const resizedH = Math.round(trimH * scale);

  const resized = await sharp(trimmed)
    .resize(resizedW, resizedH, { fit: 'fill' })
    .png()
    .toBuffer();

  // Center on a transparent size × size canvas
  const left = Math.floor((size - resizedW) / 2);
  const top  = Math.floor((size - resizedH) / 2);

  await sharp({
    create: {
      width:      size,
      height:     size,
      channels:   4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .composite([{ input: resized, left, top }])
    .toFile(outputPath);
}
