import inquirer from 'inquirer';
import chalk from 'chalk';
import { extractAndBuildHorizontal } from '../core/extractAndBuildHorizontal.js';
import { selectPngFile } from '../utils/folder.js';
import { SIZE_CHOICES } from '../utils/image.js';

const DETECTION_MODE = {
  AUTO:   'Auto Detect',
  MANUAL: 'Manual Grid',
};

export async function runExtractHorizontal() {
  console.log(chalk.cyan('\n  Extract Sprites → Horizontal Sheet\n'));

  const inputFile = await selectPngFile();

  const { detectionMode } = await inquirer.prompt([
    {
      type:    'list',
      name:    'detectionMode',
      message: 'Sprite detection mode:',
      choices: Object.values(DETECTION_MODE),
    },
  ]);

  let grid = null;
  if (detectionMode === DETECTION_MODE.MANUAL) {
    const { rows, cols } = await inquirer.prompt([
      {
        type:     'input',
        name:     'rows',
        message:  'Number of rows:',
        validate: (input) => {
          const n = parseInt(input, 10);
          return (Number.isInteger(n) && n > 0) || 'Please enter a positive integer.';
        },
        filter: (input) => parseInt(input, 10),
      },
      {
        type:     'input',
        name:     'cols',
        message:  'Number of columns:',
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
      type:    'list',
      name:    'sizeChoice',
      message: 'Output cell size (px):',
      choices: Object.values(SIZE_CHOICES),
    },
  ]);

  let cellSize;
  if (sizeChoice === SIZE_CHOICES.CUSTOM) {
    const { customSize } = await inquirer.prompt([
      {
        type:     'input',
        name:     'customSize',
        message:  'Enter custom cell size (px):',
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
      type:    'input',
      name:    'outputFile',
      message: 'Output filename:',
      default: 'output-horizontal.png',
    },
  ]);

  await extractAndBuildHorizontal({
    inputFile,
    detectionMode,
    grid,
    cellSize,
    outputFile: outputFile.trim(),
  });
}
