/**
 * Regenerate scripts/puzzle-bank-import.csv from src/data/puzzleBank.js
 * Run: node scripts/export-puzzle-bank-csv.mjs
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PUZZLE_BANK } from '../src/data/puzzleBank.js';
import { buildOptions } from '../src/utils/puzzleOptions.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, 'puzzle-bank-import.csv');

function escapeCsv(value) {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function optionsToCsv(options) {
  const json = JSON.stringify(options);
  return `"${json.replace(/"/g, '""')}"`;
}

const header = 'word,translation,options,category,image_url';
const wordsByCategory = new Map();
for (const puzzle of PUZZLE_BANK) {
  if (!wordsByCategory.has(puzzle.category)) {
    wordsByCategory.set(puzzle.category, []);
  }
  wordsByCategory.get(puzzle.category).push(puzzle.word);
}

const rows = PUZZLE_BANK.map((p) =>
  [
    escapeCsv(p.word),
    escapeCsv(p.translation),
    optionsToCsv(buildOptions(p.word, wordsByCategory.get(p.category) || [])),
    escapeCsv(p.category),
    '',
  ].join(','),
);

// No UTF-8 BOM — Appwrite treats BOM as part of the first column name ("word" fails).
writeFileSync(outPath, `${[header, ...rows].join('\n')}\n`, 'utf8');
console.log(`Wrote ${PUZZLE_BANK.length} rows to ${outPath}`);
