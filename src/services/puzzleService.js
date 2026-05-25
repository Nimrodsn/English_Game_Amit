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

function pickRound(puzzles, count = PUZZLES_PER_ROUND) {
  return shuffle(puzzles).slice(0, Math.min(count, puzzles.length));
}

function fromBank(level) {
  const filtered = filterByLevel(PUZZLE_BANK, level);
  return pickRound(filtered.map((p, i) => bankToPuzzleDoc(p, i)));
}

async function fetchFromAppwrite(level) {
  const queries = [Query.limit(100)];
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
      pool = fromBank(level);
    }
    return pickRound(pool);
  }

  try {
    let pool = await fetchFromAppwrite(level);

    if (pool.length < PUZZLES_PER_ROUND) {
      pool = [...pool, ...fromBank(level)];
    }

    if (pool.length < PUZZLES_PER_ROUND && useAI) {
      const ai = await fetchAIPuzzles(level);
      pool = [...pool, ...ai];
    }

    if (pool.length === 0) {
      return fromBank(level);
    }

    return pickRound(pool);
  } catch {
    return fromBank(level);
  }
}
