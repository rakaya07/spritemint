#!/usr/bin/env node

import { showHelp } from '../src/help.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

import('../src/index.js');
