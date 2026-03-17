import fs from 'fs';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import sharp from 'sharp';
import { normalizeToCell } from '../utils/image.js';

/**
 * @param {{ files: string[], size: number }} options
 *   files - Absolute paths of the PNG files to process.
 *   size  - Side length of the output square canvas in pixels.
 */
export async function normalizeSprites({ files, size }) {
  const outputDir = path.join(process.cwd(), 'normalized');
  fs.mkdirSync(outputDir, { recursive: true });

  const spinner  = ora(`Processing 1 / ${files.length}`).start();
  let processed  = 0;
  let failed     = 0;
  const errors   = [];

  for (const inputPath of files) {
    const filename = path.basename(inputPath);
    spinner.text = `Processing ${processed + 1} / ${files.length}  —  ${filename}`;

    try {
      const buf        = await normalizeToCell(inputPath, size);
      const outputPath = path.join(outputDir, filename);
      await sharp(buf).toFile(outputPath);
      processed++;
    } catch (err) {
      failed++;
      errors.push({ filename, message: err.message });
    }
  }

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
