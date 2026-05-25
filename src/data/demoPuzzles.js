/** Fallback puzzles when Appwrite env vars are not set (local UI testing). */
export const DEMO_PUZZLES = [
  {
    $id: 'demo-1',
    word: 'apple',
    translation: 'תפוח',
    options: ['apple', 'banana', 'car', 'house'],
    category: 'food',
    image_url: '',
  },
  {
    $id: 'demo-2',
    word: 'dog',
    translation: 'כלב',
    options: ['cat', 'dog', 'fish', 'bird'],
    category: 'animals',
    image_url: '',
  },
  {
    $id: 'demo-3',
    word: 'book',
    translation: 'ספר',
    options: ['pen', 'book', 'desk', 'chair'],
    category: 'school',
    image_url: '',
  },
  {
    $id: 'demo-4',
    word: 'sun',
    translation: 'שמש',
    options: ['moon', 'star', 'sun', 'cloud'],
    category: 'nature',
    image_url: '',
  },
  {
    $id: 'demo-5',
    word: 'ball',
    translation: 'כדור',
    options: ['ball', 'bat', 'goal', 'run'],
    category: 'sports',
    image_url: '',
  },
];
