/** Game levels — round size and pass rules come from difficulty tier. */
export const PUZZLES_PER_ROUND = 8;

export const LEVEL_BONUS_POINTS = 25;

export const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'expert'];

export const DIFFICULTY = {
  easy: { label: 'Easy', puzzlesPerRound: 6, passRatio: 0.5, bonusPoints: 20 },
  medium: { label: 'Medium', puzzlesPerRound: 8, passRatio: 0.6, bonusPoints: 25 },
  hard: { label: 'Hard', puzzlesPerRound: 10, passRatio: 0.7, bonusPoints: 30 },
  expert: { label: 'Expert', puzzlesPerRound: 10, passRatio: 0.8, bonusPoints: 35 },
};

export const LEVELS = [
  {
    id: 1,
    slug: 'animals',
    title: 'Animal Friends',
    emoji: '🐶',
    category: 'animals',
    description: 'Dogs, cats, birds and more!',
    difficulty: 'easy',
    unlockPoints: 0,
    color: 'lime',
  },
  {
    id: 2,
    slug: 'food',
    title: 'Yummy Food',
    emoji: '🍎',
    category: 'food',
    description: 'Fruits, snacks, and meals.',
    difficulty: 'easy',
    unlockPoints: 0,
    color: 'peach',
  },
  {
    id: 3,
    slug: 'colors',
    title: 'Rainbow Colors',
    emoji: '🎨',
    category: 'colors',
    description: 'Red, blue, green, and more!',
    difficulty: 'easy',
    unlockPoints: 0,
    color: 'purple',
  },
  {
    id: 4,
    slug: 'body',
    title: 'My Body',
    emoji: '🧒',
    category: 'body',
    description: 'Head, hands, eyes, and legs.',
    difficulty: 'medium',
    unlockPoints: 40,
    color: 'peach',
  },
  {
    id: 5,
    slug: 'furniture',
    title: 'Home Furniture',
    emoji: '🛋️',
    category: 'furniture',
    description: 'Bed, table, lamp, and sofa.',
    difficulty: 'medium',
    unlockPoints: 50,
    color: 'lime',
  },
  {
    id: 6,
    slug: 'clothes',
    title: 'What I Wear',
    emoji: '👕',
    category: 'clothes',
    description: 'Shirt, shoes, hat, and dress.',
    difficulty: 'medium',
    unlockPoints: 60,
    color: 'purple',
  },
  {
    id: 7,
    slug: 'school',
    title: 'School Time',
    emoji: '📚',
    category: 'school',
    description: 'Books, pens, and classroom words.',
    difficulty: 'hard',
    unlockPoints: 100,
    color: 'peach',
  },
  {
    id: 8,
    slug: 'nature',
    title: 'Nature World',
    emoji: '🌳',
    category: 'nature',
    description: 'Sun, trees, flowers, and sky.',
    difficulty: 'hard',
    unlockPoints: 120,
    color: 'lime',
  },
  {
    id: 9,
    slug: 'transport',
    title: 'On the Go',
    emoji: '🚗',
    category: 'transport',
    description: 'Cars, buses, bikes, and trains.',
    difficulty: 'hard',
    unlockPoints: 140,
    color: 'purple',
  },
  {
    id: 10,
    slug: 'master',
    title: 'Super Explorer',
    emoji: '⭐',
    category: 'mixed',
    description: 'Mix of everything — expert mode!',
    difficulty: 'expert',
    unlockPoints: 220,
    color: 'peach',
  },
  {
    id: 11,
    slug: 'family',
    title: 'My Family',
    emoji: '👨‍👩‍👧',
    category: 'family',
    description: 'Mom, dad, sister, and more!',
    difficulty: 'easy',
    unlockPoints: 0,
    color: 'lime',
  },
  {
    id: 12,
    slug: 'weather',
    title: 'Weather Watch',
    emoji: '🌤️',
    category: 'weather',
    description: 'Sun, rain, wind, and clouds.',
    difficulty: 'easy',
    unlockPoints: 0,
    color: 'peach',
  },
  {
    id: 13,
    slug: 'sports',
    title: 'Sports Fun',
    emoji: '⚽',
    category: 'sports',
    description: 'Ball, run, swim, and team play.',
    difficulty: 'medium',
    unlockPoints: 70,
    color: 'purple',
  },
  {
    id: 14,
    slug: 'places',
    title: 'Places Around',
    emoji: '🏫',
    category: 'places',
    description: 'Home, park, shop, and city.',
    difficulty: 'medium',
    unlockPoints: 80,
    color: 'lime',
  },
  {
    id: 15,
    slug: 'feelings',
    title: 'How I Feel',
    emoji: '😊',
    category: 'feelings',
    description: 'Happy, sad, excited, and calm.',
    difficulty: 'medium',
    unlockPoints: 80,
    color: 'peach',
  },
  {
    id: 16,
    slug: 'numbers',
    title: 'Number Time',
    emoji: '🔢',
    category: 'numbers',
    description: 'One to ten and counting fun.',
    difficulty: 'hard',
    unlockPoints: 180,
    color: 'purple',
  },
];

export function getLevelDifficulty(level) {
  return DIFFICULTY[level?.difficulty] ?? DIFFICULTY.medium;
}

export function getLevelById(levelId) {
  const id = Number(levelId);
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}

export function isLevelUnlocked(level, totalPoints, completedLevelIds = []) {
  if (level.unlockPoints === 0) return true;
  if (completedLevelIds.includes(level.id - 1)) return true;
  return (totalPoints ?? 0) >= level.unlockPoints;
}
