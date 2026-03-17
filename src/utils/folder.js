import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

const CURRENT_DIR  = 'Use current folder';
const MANUAL_ENTRY = 'Enter path manually';

/**
 * Presents a list of folders containing PNG files and returns the chosen path.
 * Checks process.cwd() and its immediate subdirectories.
 *
 * @returns {Promise<string>} Absolute path of the chosen folder.
 */
export async function selectFolder() {
  const cwd        = process.cwd();
  const cwdHasPngs = dirContainsPngs(cwd);
  const subfolders = subdirectoriesWithPngs(cwd);

  if (!cwdHasPngs && subfolders.length === 0) return promptManualPath();

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

/**
 * Presents a list of PNG files from process.cwd() and its immediate
 * subdirectories, then returns the absolute path of the chosen file.
 *
 * @returns {Promise<string>} Absolute path of the chosen PNG file.
 */
export async function selectPngFile() {
  const cwd      = process.cwd();
  const allFiles = [];

  getPngsInDir(cwd).forEach((f) =>
    allFiles.push({ name: f, value: path.join(cwd, f) })
  );

  for (const dir of subdirectoriesWithPngs(cwd)) {
    getPngsInDir(path.join(cwd, dir)).forEach((f) =>
      allFiles.push({ name: path.join(dir, f), value: path.join(cwd, dir, f) })
    );
  }

  if (allFiles.length === 0) {
    console.log(chalk.yellow('  No PNG files found in current directory or subfolders.\n'));
    const { manualPath } = await inquirer.prompt([
      {
        type:     'input',
        name:     'manualPath',
        message:  'Input PNG file path:',
        validate: (input) => input.trim().length > 0 || 'Please enter a file path.',
      },
    ]);
    return manualPath.trim();
  }

  const { selected } = await inquirer.prompt([
    {
      type:    'list',
      name:    'selected',
      message: 'Select PNG file:',
      choices: allFiles,
    },
  ]);

  return selected;
}

/**
 * Presents a checkbox list of PNG files in `folder` and returns
 * the absolute paths of the selected files.
 *
 * @param {string} folder
 * @param {string} [message]
 * @returns {Promise<string[]>}
 */
export async function selectPngFiles(folder, message = 'Select PNG files (use space to select):') {
  const pngNames = fs
    .readdirSync(folder)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort();

  const { selected } = await inquirer.prompt([
    {
      type:    'checkbox',
      name:    'selected',
      message,
      choices: pngNames,
    },
  ]);

  return selected.map((name) => path.join(folder, name));
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

export function dirContainsPngs(dir) {
  try {
    return fs.readdirSync(dir).some((f) => f.toLowerCase().endsWith('.png'));
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

function getPngsInDir(dir) {
  try {
    return fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png')).sort();
  } catch {
    return [];
  }
}

async function promptManualPath() {
  console.log(chalk.yellow('  No PNG files found in current directory or subfolders.\n'));
  const { manualPath } = await inquirer.prompt([
    {
      type:     'input',
      name:     'manualPath',
      message:  'Path to folder containing PNG files:',
      validate: (input) => input.trim().length > 0 || 'Please enter a folder path.',
    },
  ]);
  return manualPath.trim();
}
