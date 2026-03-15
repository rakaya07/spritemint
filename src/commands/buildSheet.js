import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { buildSpriteSheet } from '../core/buildSpriteSheet.js';

const SIZE_CHOICES = {
  S256:   '256',
  S512:   '512',
  S1024:  '1024',
  CUSTOM: 'Custom size',
};

const LAYOUT_CHOICES = {
  HORIZONTAL: 'Horizontal Strip',
  GRID:       'Grid',
};

const CURRENT_DIR  = 'Use current folder';
const MANUAL_ENTRY = 'Enter path manually';

export async function runBuildSheet() {
  console.log(chalk.cyan('\n  Build Sprite Sheet from Selected PNGs\n'));

  // ─── Folder selection ─────────────────────────────────────────────────────
  const folder = await selectFolder();

  // ─── File selection ───────────────────────────────────────────────────────
  const files = await selectFiles(folder);
  if (files.length === 0) {
    console.log(chalk.yellow('\n  No files selected. Operation cancelled.\n'));
    return;
  }

  // ─── Layout selection ─────────────────────────────────────────────────────
  const { layout } = await inquirer.prompt([
    {
      type:    'list',
      name:    'layout',
      message: 'Output layout:',
      choices: Object.values(LAYOUT_CHOICES),
    },
  ]);

  // ─── Cell size selection ──────────────────────────────────────────────────
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
        type:    'input',
        name:    'customSize',
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

  // ─── Grid columns (only for Grid layout) ──────────────────────────────────
  let cols = files.length;
  if (layout === LAYOUT_CHOICES.GRID) {
    const { colCount } = await inquirer.prompt([
      {
        type:    'input',
        name:    'colCount',
        message: `Number of columns (${files.length} images selected):`,
        validate: (input) => {
          const n = parseInt(input, 10);
          return (Number.isInteger(n) && n > 0) || 'Please enter a positive integer.';
        },
        filter: (input) => parseInt(input, 10),
      },
    ]);
    cols = colCount;
  }

  // ─── Output filename ──────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Reads all PNG filenames from `folder` and presents them as a checkbox list.
 * Returns an array of absolute file paths for the selected items.
 *
 * @param {string} folder
 * @returns {Promise<string[]>}
 */
async function selectFiles(folder) {
  const pngNames = fs
    .readdirSync(folder)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort();

  const { selected } = await inquirer.prompt([
    {
      type:    'checkbox',
      name:    'selected',
      message: 'Select PNG files to include (use space to select):',
      choices: pngNames,
    },
  ]);

  return selected.map((name) => path.join(folder, name));
}

/**
 * Builds a folder list by checking process.cwd() and its immediate
 * subdirectories for PNG files, then prompts the user to choose one.
 *
 * @returns {Promise<string>}
 */
async function selectFolder() {
  const cwd = process.cwd();

  const cwdHasPngs = dirContainsPngs(cwd);
  const subfolders = subdirectoriesWithPngs(cwd);

  const hasAnyOption = cwdHasPngs || subfolders.length > 0;

  if (!hasAnyOption) {
    return promptManualPath();
  }

  const choices = [
    ...(cwdHasPngs ? [CURRENT_DIR] : []),
    ...subfolders,
    new inquirer.Separator(),
    MANUAL_ENTRY,
  ];

  const { selected } = await inquirer.prompt([
    {
      type:    'list',
      name:    'selected',
      message: 'Select folder containing PNG files:',
      choices,
    },
  ]);

  if (selected === MANUAL_ENTRY) return promptManualPath();
  if (selected === CURRENT_DIR)  return cwd;

  return path.join(cwd, selected);
}

function dirContainsPngs(dir) {
  try {
    return fs
      .readdirSync(dir)
      .some((f) => f.toLowerCase().endsWith('.png'));
  } catch {
    return false;
  }
}

function subdirectoriesWithPngs(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => dirContainsPngs(path.join(dir, name)));
  } catch {
    return [];
  }
}

async function promptManualPath() {
  console.log(chalk.yellow('  No PNG files found in current directory or subfolders.\n'));
  const { manualPath } = await inquirer.prompt([
    {
      type:    'input',
      name:    'manualPath',
      message: 'Path to folder containing PNG files:',
      validate: (input) => input.trim().length > 0 || 'Please enter a folder path.',
    },
  ]);
  return manualPath.trim();
}
