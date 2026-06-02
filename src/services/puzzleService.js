import {
  databases,
  APPWRITE_DB,
  COLLECTIONS,
  Query,
  isAppwriteConfigured,
} from '../lib/appwrite';
import { PUZZLE_BANK, bankToPuzzleDoc } from '../data/puzzleBank';
import { PUZZLES_PER_ROUND } from '../data/levels';
import { DEMO_PUZZLES } from '../data/demoPuzzles';
import { buildOptions } from '../utils/puzzleOptions';

const RECENT_WORDS_KEY = 'english_game_recent_words';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function filterByLevel(puzzles, level) {
  if (level.category === 'mixed') return puzzles;
  return puzzles.filter((p) => p.category === level.category);
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadRecentWords() {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(RECENT_WORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRecentWords(data) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(RECENT_WORDS_KEY, JSON.stringify(data));
}

function getPuzzleKey(puzzle) {
  return `${String(puzzle.category || '').toLowerCase()}::${String(puzzle.word || '').toLowerCase()}`;
}

function dedupePuzzles(puzzles) {
  const seen = new Set();
  return puzzles.filter((puzzle) => {
    const key = getPuzzleKey(puzzle);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pickRound(puzzles, levelCategory, count = PUZZLES_PER_ROUND) {
  const maxCount = Math.min(count, puzzles.length);
  if (maxCount === 0) return [];

  const shuffled = shuffle(puzzles);
  const recentData = loadRecentWords();
  const recentWords = new Set((recentData[levelCategory] || []).map((word) => String(word).toLowerCase()));
  const preferred = shuffled.filter((puzzle) => !recentWords.has(String(puzzle.word).toLowerCase()));

  const round = preferred.slice(0, maxCount);
  if (round.length < maxCount) {
    const selectedKeys = new Set(round.map(getPuzzleKey));
    for (const puzzle of shuffled) {
      const key = getPuzzleKey(puzzle);
      if (selectedKeys.has(key)) continue;
      round.push(puzzle);
      selectedKeys.add(key);
      if (round.length >= maxCount) break;
    }
  }

  recentData[levelCategory] = round.map((puzzle) => String(puzzle.word || '').toLowerCase());
  saveRecentWords(recentData);
  return round;
}

function fromBank(level) {
  const filtered = filterByLevel(PUZZLE_BANK, level);
  return filtered.map((p, i) => bankToPuzzleDoc(p, i));
}

function addRoundOptions(round, pool) {
  const wordsByCategory = new Map();
  const allWords = [...new Set(pool.map((puzzle) => String(puzzle.word || '').toLowerCase()).filter(Boolean))];

  for (const puzzle of pool) {
    const category = String(puzzle.category || '').toLowerCase();
    if (!wordsByCategory.has(category)) {
      wordsByCategory.set(category, []);
    }
    wordsByCategory.get(category).push(String(puzzle.word || '').toLowerCase());
  }

  return round.map((puzzle) => {
    const categoryKey = String(puzzle.category || '').toLowerCase();
    const categoryWords = wordsByCategory.get(categoryKey) || allWords;
    let options = buildOptions(puzzle.word, categoryWords);
    if (options.length < 4) {
      options = buildOptions(puzzle.word, allWords);
    }
    return {
      ...puzzle,
      options,
    };
  });
}

async function fetchFromAppwrite(level) {
  const queries = [Query.limit(500)];
  if (level.category !== 'mixed') {
    queries.push(Query.equal('category', [level.category]));
  }

  const res = await databases.listDocuments(
    APPWRITE_DB,
    COLLECTIONS.puzzles,
    queries,
  );
  return res.documents;
}

async function fetchAIPuzzles(level, count = PUZZLES_PER_ROUND) {
  try {
    const res = await fetch(
      `/api/generate-puzzles?category=${encodeURIComponent(level.category)}&count=${count + 2}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.puzzles || [];
  } catch {
    return [];
  }
}

/**
 * Load a full round of puzzles for a level (DB + bank + optional OpenAI top-up).
 */
export async function loadLevelPuzzles(level, { demoMode, useAI = true } = {}) {
  if (demoMode || !isAppwriteConfigured()) {
    let pool = filterByLevel(DEMO_PUZZLES, level);
    if (pool.length < PUZZLES_PER_ROUND && useAI) {
      const ai = await fetchAIPuzzles(level);
      pool = [...pool, ...filterByLevel(ai, level)];
    }
    if (pool.length < PUZZLES_PER_ROUND) {
      pool = [...pool, ...fromBank(level)];
    }
    pool = dedupePuzzles(pool);
    const round = pickRound(pool, level.category);
    return addRoundOptions(round, pool);
  }

  try {
    let pool = await fetchFromAppwrite(level);

    if (pool.length < PUZZLES_PER_ROUND) {
      pool = [...pool, ...fromBank(level)];
    }

    if (pool.length < PUZZLES_PER_ROUND && useAI) {
      const ai = await fetchAIPuzzles(level);
      pool = [...pool, ...filterByLevel(ai, level)];
    }

    pool = dedupePuzzles(pool);

    if (pool.length === 0) {
      pool = fromBank(level);
    }

    const round = pickRound(pool, level.category);
    return addRoundOptions(round, pool);
  } catch {
    const pool = dedupePuzzles(fromBank(level));
    const round = pickRound(pool, level.category);
    return addRoundOptions(round, pool);
  }
}
