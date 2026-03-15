import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { normalizeSprites } from '../core/normalizeSprites.js';

const SIZE_CHOICES = {
  S256: '256',
  S512: '512',
  S1024: '1024',
  CUSTOM: 'Custom size',
};

const CURRENT_DIR  = 'Use current folder';
const MANUAL_ENTRY = 'Enter path manually';

export async function runNormalize() {
  console.log(chalk.cyan('\n  Normalize Sprites\n'));

  // ─── Folder selection ─────────────────────────────────────────────────────
  const folder = await selectFolder();

  // ─── File selection ───────────────────────────────────────────────────────
  const files = await selectFiles(folder);
  if (files.length === 0) {
    console.log(chalk.yellow('\n  No files selected. Operation cancelled.\n'));
    return;
  }

  // ─── Size selection ───────────────────────────────────────────────────────
  const { sizeChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'sizeChoice',
      message: 'Output sprite size:',
      choices: Object.values(SIZE_CHOICES),
    },
  ]);

  let size;

  if (sizeChoice === SIZE_CHOICES.CUSTOM) {
    const { customSize } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customSize',
        message: 'Enter custom size (px):',
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Reads all PNG filenames from `folder` and presents them as a checkbox list.
 * Returns an array of absolute file paths for the selected items.
 *
 * @param {string} folder - Absolute path of the folder to scan.
 * @returns {Promise<string[]>} Absolute paths of the selected PNG files.
 */
async function selectFiles(folder) {
  const pngNames = fs
    .readdirSync(folder)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort();

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select PNG sprites to normalize (use space to select):',
      choices: pngNames,
    },
  ]);

  return selected.map((name) => path.join(folder, name));
}

/**
 * Builds a folder list by:
 *   1. Checking whether process.cwd() itself contains PNGs → "Use current folder"
 *   2. Scanning immediate subdirectories of process.cwd() for PNGs
 *
 * Always uses process.cwd() so the result reflects where the user invoked the
 * command, not where the package is installed — safe for global CLI installs.
 *
 * @returns {Promise<string>} Absolute path of the chosen folder.
 */
async function selectFolder() {
  const cwd = process.cwd();

  const cwdHasPngs  = dirContainsPngs(cwd);
  const subfolders  = subdirectoriesWithPngs(cwd);

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
      type: 'list',
      name: 'selected',
      message: 'Select folder containing PNG files:',
      choices,
    },
  ]);

  if (selected === MANUAL_ENTRY)  return promptManualPath();
  if (selected === CURRENT_DIR)   return cwd;

  return path.join(cwd, selected);
}

/**
 * Returns true if `dir` contains at least one .png file (case-insensitive).
 *
 * @param {string} dir
 * @returns {boolean}
 */
function dirContainsPngs(dir) {
  try {
    return fs
      .readdirSync(dir)
      .some((f) => f.toLowerCase().endsWith('.png'));
  } catch {
    return false;
  }
}

/**
 * Returns the names of immediate subdirectories of `dir` that contain
 * at least one .png file (case-insensitive).
 *
 * @param {string} dir
 * @returns {string[]}
 */
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

/**
 * Falls back to free-text path input when no PNG folders are detected.
 *
 * @returns {Promise<string>}
 */
async function promptManualPath() {
  console.log(chalk.yellow('  No PNG files found in current directory or subfolders.\n'));
  const { manualPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'manualPath',
      message: 'Path to folder containing PNG files:',
      validate: (input) => input.trim().length > 0 || 'Please enter a folder path.',
    },
  ]);
  return manualPath.trim();
}
