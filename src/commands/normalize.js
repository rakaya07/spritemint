import inquirer from 'inquirer';
import chalk from 'chalk';
import { normalizeSprites } from '../core/normalizeSprites.js';
import { selectFolder, selectPngFiles } from '../utils/folder.js';
import { SIZE_CHOICES } from '../utils/image.js';

export async function runNormalize() {
  console.log(chalk.cyan('\n  Normalize Sprites\n'));

  const folder = await selectFolder();

  const files = await selectPngFiles(folder, 'Select PNG sprites to normalize (use space to select):');
  if (files.length === 0) {
    console.log(chalk.yellow('\n  No files selected. Operation cancelled.\n'));
    return;
  }

  const { sizeChoice } = await inquirer.prompt([
    {
      type:    'list',
      name:    'sizeChoice',
      message: 'Output sprite size:',
      choices: Object.values(SIZE_CHOICES),
    },
  ]);

  let size;
  if (sizeChoice === SIZE_CHOICES.CUSTOM) {
    const { customSize } = await inquirer.prompt([
      {
        type:     'input',
        name:     'customSize',
        message:  'Enter custom size (px):',
        validate: (input) => {
          const n = parseInt(input, 10);
          return (Number.isInteger(n) && n > 0) || 'Please enter a positive integer.';
        },
        filter: (input) => parseInt(input, 10),
      },
    ]);
    size = customSize;
  } else {
    size = parseInt(sizeChoice, 10);
  }

  await normalizeSprites({ files, size });
}
