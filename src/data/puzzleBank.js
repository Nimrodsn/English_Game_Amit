/**
 * Full vocabulary bank — used for demo mode and Appwrite seeding.
 * CSV for Appwrite import: scripts/puzzle-bank-import.csv
 * Regenerate CSV after edits: node scripts/export-puzzle-bank-csv.mjs
 */
import { CATEGORY_VOCABULARY, LEVEL_CATEGORY_ORDER } from './vocabulary/categories.js';

export const PUZZLE_BANK = LEVEL_CATEGORY_ORDER.flatMap((category) =>
  CATEGORY_VOCABULARY[category].map((item) => ({
    ...item,
    category,
    options: [],
  })),
);

export function bankToPuzzleDoc(p, index) {
  return {
    $id: `bank-${p.category}-${index}`,
    word: p.word,
    translation: p.translation,
    options: p.options,
    category: p.category,
    image_url: '',
  };
}

export const DEMO_PUZZLES = PUZZLE_BANK.map(bankToPuzzleDoc);
