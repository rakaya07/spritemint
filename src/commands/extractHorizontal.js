import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { extractAndBuildHorizontal } from '../core/extractAndBuildHorizontal.js';

const DETECTION_MODE = {
  AUTO: 'Auto Detect',
  MANUAL: 'Manual Grid',
};

const SIZE_CHOICES = {
  S256: '256',
  S512: '512',
  S1024: '1024',
  CUSTOM: 'Custom size',
};

export async function runExtractHorizontal() {
  console.log(chalk.cyan('\n  Extract Sprites → Horizontal Sheet\n'));

  const pngFiles = fs
    .readdirSync(process.cwd())
    .filter((f) => f.toLowerCase().endsWith('.png'));

  let inputFile;

  if (pngFiles.length > 0) {
    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: 'Select PNG file:',
        choices: pngFiles,
      },
    ]);
    inputFile = path.join(process.cwd(), selectedFile);
  } else {
    console.log(chalk.yellow('  No PNG files found in current directory.\n'));
    const { manualPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'manualPath',
        message: 'Input PNG file path:',
        validate: (input) =>
          input.trim().length > 0 || 'Please enter a file path.',
      },
    ]);
    inputFile = manualPath.trim();
  }

  const { detectionMode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'detectionMode',
      message: 'Sprite detection mode:',
      choices: Object.values(DETECTION_MODE),
    },
  ]);

  let grid = null;

  if (detectionMode === DETECTION_MODE.MANUAL) {
    const { rows, cols } = await inquirer.prompt([
      {
        type: 'input',
        name: 'rows',
        message: 'Number of rows:',
        validate: (input) => {
          const n = parseInt(input, 10);
          return (Number.isInteger(n) && n > 0) || 'Please enter a positive integer.';
        },
        filter: (input) => parseInt(input, 10),
      },
      {
        type: 'input',
        name: 'cols',
        message: 'Number of columns:',
        validate: (input) => {
          const n = parseInt(input, 10);
          return (Number.isInteger(n) && n > 0) || 'Please enter a positive integer.';
        },
        filter: (input) => parseInt(input, 10),
      },
    ]);
    grid = { rows, cols };
  }

  const { sizeChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'sizeChoice',
      message: 'Output cell size (px):',
      choices: Object.values(SIZE_CHOICES),
    },
  ]);

  let cellSize;

  if (sizeChoice === SIZE_CHOICES.CUSTOM) {
    const { customSize } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customSize',
        message: 'Enter custom cell size (px):',
        validate: (input) => {
          const n = parseInt(input, 10);
          return (Number.isInteger(n) && n > 0) || 'Please enter a positive integer.';
        },
        filter: (input) => parseInt(input, 10),
      },
    ]);
    cellSize = customSize;
  } else {
    cellSize = parseInt(sizeChoice, 10);
  }

  const { outputFile } = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputFile',
      message: 'Output filename:',
      default: 'output-horizontal.png',
    },
  ]);

  await extractAndBuildHorizontal({
    inputFile: inputFile.trim(),
    detectionMode,
    grid,
    cellSize,
    outputFile: outputFile.trim(),
  });
}
