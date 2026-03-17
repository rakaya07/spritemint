import inquirer from 'inquirer';
import chalk from 'chalk';
import { buildSpriteSheet } from '../core/buildSpriteSheet.js';
import { selectFolder, selectPngFiles } from '../utils/folder.js';
import { SIZE_CHOICES } from '../utils/image.js';

const LAYOUT_CHOICES = {
  HORIZONTAL: 'Horizontal Strip',
  GRID:       'Grid',
};

export async function runBuildSheet() {
  console.log(chalk.cyan('\n  Build Sprite Sheet from Selected PNGs\n'));

  const folder = await selectFolder();

  const files = await selectPngFiles(folder, 'Select PNG files to include (use space to select):');
  if (files.length === 0) {
    console.log(chalk.yellow('\n  No files selected. Operation cancelled.\n'));
    return;
  }

  const { layout } = await inquirer.prompt([
    {
      type:    'list',
      name:    'layout',
      message: 'Output layout:',
      choices: Object.values(LAYOUT_CHOICES),
    },
  ]);

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

  let cols = files.length;
  if (layout === LAYOUT_CHOICES.GRID) {
    const { colCount } = await inquirer.prompt([
      {
        type:     'input',
        name:     'colCount',
        message:  `Number of columns (${files.length} images selected):`,
        validate: (input) => {
          const n = parseInt(input, 10);
          return (Number.isInteger(n) && n > 0) || 'Please enter a positive integer.';
        },
        filter: (input) => parseInt(input, 10),
      },
    ]);
    cols = colCount;
  }

  const { rawName } = await inquirer.prompt([
    {
      type:    'input',
      name:    'rawName',
      message: 'Output filename:',
      default: 'sheet.png',
    },
  ]);
  const outputName = rawName.trim().toLowerCase().endsWith('.png')
    ? rawName.trim()
    : `${rawName.trim()}.png`;

  await buildSpriteSheet({ files, cellSize, layout, cols, outputName });
}
