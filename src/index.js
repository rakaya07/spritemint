import inquirer from 'inquirer';
import chalk from 'chalk';
import { runNormalize } from './commands/normalize.js';
import { runExtractHorizontal } from './commands/extractHorizontal.js';

const MENU_CHOICES = {
  NORMALIZE: 'Normalize Sprites',
  EXTRACT_HORIZONTAL: 'Extract Sprites from Sheet and Build Horizontal Output',
};

async function main() {
  console.log(chalk.bold.green('\n  SpriteMint ') + chalk.gray('— Unity Sprite Processor\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: Object.values(MENU_CHOICES),
    },
  ]);

  switch (action) {
    case MENU_CHOICES.NORMALIZE:
      await runNormalize();
      break;
    case MENU_CHOICES.EXTRACT_HORIZONTAL:
      await runExtractHorizontal();
      break;
  }
}

main().catch((err) => {
  console.error(chalk.red('\nError: ') + err.message);
  process.exit(1);
});
