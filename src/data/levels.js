/** Game levels — each has 8 words per round, unlocked by points or completion. */
export const PUZZLES_PER_ROUND = 8;

export const LEVEL_BONUS_POINTS = 25;

export const LEVELS = [
  {
    id: 1,
    slug: 'animals',
    title: 'Animal Friends',
    emoji: '🐶',
    category: 'animals',
    description: 'Dogs, cats, birds and more!',
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
    unlockPoints: 30,
    color: 'peach',
  },
  {
    id: 5,
    slug: 'furniture',
    title: 'Home Furniture',
    emoji: '🛋️',
    category: 'furniture',
    description: 'Bed, table, lamp, and sofa.',
    unlockPoints: 60,
    color: 'lime',
  },
  {
    id: 6,
    slug: 'clothes',
    title: 'What I Wear',
    emoji: '👕',
    category: 'clothes',
    description: 'Shirt, shoes, hat, and dress.',
    unlockPoints: 90,
    color: 'purple',
  },
  {
    id: 7,
    slug: 'school',
    title: 'School Time',
    emoji: '📚',
    category: 'school',
    description: 'Books, pens, and classroom words.',
    unlockPoints: 120,
    color: 'peach',
  },
  {
    id: 8,
    slug: 'nature',
    title: 'Nature World',
    emoji: '🌳',
    category: 'nature',
    description: 'Sun, trees, flowers, and sky.',
    unlockPoints: 160,
    color: 'lime',
  },
  {
    id: 9,
    slug: 'transport',
    title: 'On the Go',
    emoji: '🚗',
    category: 'transport',
    description: 'Cars, buses, bikes, and trains.',
    unlockPoints: 200,
    color: 'purple',
  },
  {
    id: 10,
    slug: 'master',
    title: 'Super Explorer',
    emoji: '⭐',
    category: 'mixed',
    description: 'Mix of everything — expert mode!',
    unlockPoints: 260,
    color: 'peach',
  },
];

export function getLevelById(levelId) {
  const id = Number(levelId);
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}

export function isLevelUnlocked(level, totalPoints, completedLevelIds = []) {
  if (level.unlockPoints === 0) return true;
  if (completedLevelIds.includes(level.id - 1)) return true;
  return (totalPoints ?? 0) >= level.unlockPoints;
}
