/**
 * Full vocabulary bank — used for demo mode and Appwrite seeding.
 * CSV for Appwrite import: scripts/puzzle-bank-import.csv
 * Regenerate CSV after edits: node scripts/export-puzzle-bank-csv.mjs
 */
export const PUZZLE_BANK = [
  { word: 'dog', translation: 'כלב', options: ['cat', 'dog', 'fish', 'bird'], category: 'animals' },
  { word: 'cat', translation: 'חתול', options: ['cat', 'cow', 'duck', 'frog'], category: 'animals' },
  { word: 'bird', translation: 'ציפור', options: ['bird', 'lion', 'bear', 'horse'], category: 'animals' },
  { word: 'fish', translation: 'דג', options: ['fish', 'snake', 'mouse', 'rabbit'], category: 'animals' },
  { word: 'horse', translation: 'סוס', options: ['horse', 'sheep', 'duck', 'bee'], category: 'animals' },
  { word: 'cow', translation: 'פרה', options: ['pig', 'cow', 'hen', 'owl'], category: 'animals' },
  { word: 'lion', translation: 'אריה', options: ['tiger', 'lion', 'wolf', 'fox'], category: 'animals' },
  { word: 'rabbit', translation: 'ארנב', options: ['rabbit', 'turtle', 'whale', 'eagle'], category: 'animals' },
  { word: 'apple', translation: 'תפוח', options: ['apple', 'banana', 'car', 'house'], category: 'food' },
  { word: 'banana', translation: 'בננה', options: ['grape', 'banana', 'bread', 'milk'], category: 'food' },
  { word: 'water', translation: 'מים', options: ['juice', 'water', 'cake', 'egg'], category: 'food' },
  { word: 'bread', translation: 'לחם', options: ['rice', 'bread', 'soup', 'salad'], category: 'food' },
  { word: 'egg', translation: 'ביצה', options: ['egg', 'meat', 'corn', 'nut'], category: 'food' },
  { word: 'cake', translation: 'עוגה', options: ['pie', 'cake', 'candy', 'honey'], category: 'food' },
  { word: 'milk', translation: 'חלב', options: ['tea', 'milk', 'soda', 'jam'], category: 'food' },
  { word: 'pizza', translation: 'פיצה', options: ['pizza', 'burger', 'taco', 'sushi'], category: 'food' },
  { word: 'book', translation: 'ספר', options: ['pen', 'book', 'desk', 'chair'], category: 'school' },
  { word: 'pencil', translation: 'עפרון', options: ['pencil', 'ruler', 'bag', 'clock'], category: 'school' },
  { word: 'desk', translation: 'שולחן כתיבה', options: ['desk', 'door', 'lamp', 'map'], category: 'school' },
  { word: 'chair', translation: 'כיסא', options: ['table', 'chair', 'board', 'bell'], category: 'school' },
  { word: 'bag', translation: 'תיק', options: ['hat', 'bag', 'coat', 'key'], category: 'school' },
  { word: 'ruler', translation: 'סרגל', options: ['ruler', 'eraser', 'glue', 'tape'], category: 'school' },
  { word: 'teacher', translation: 'מורה', options: ['student', 'teacher', 'class', 'test'], category: 'school' },
  { word: 'paper', translation: 'נייר', options: ['paper', 'paint', 'brush', 'box'], category: 'school' },
  { word: 'sun', translation: 'שמש', options: ['moon', 'star', 'sun', 'cloud'], category: 'nature' },
  { word: 'tree', translation: 'עץ', options: ['tree', 'flower', 'rock', 'river'], category: 'nature' },
  { word: 'rain', translation: 'גשם', options: ['snow', 'rain', 'wind', 'storm'], category: 'nature' },
  { word: 'flower', translation: 'פרח', options: ['grass', 'flower', 'leaf', 'seed'], category: 'nature' },
  { word: 'cloud', translation: 'ענן', options: ['sky', 'cloud', 'hill', 'sand'], category: 'nature' },
  { word: 'star', translation: 'כוכב', options: ['star', 'moon', 'lake', 'wave'], category: 'nature' },
  { word: 'mountain', translation: 'הר', options: ['valley', 'mountain', 'forest', 'beach'], category: 'nature' },
  { word: 'river', translation: 'נהר', options: ['river', 'ocean', 'island', 'cave'], category: 'nature' },
  { word: 'car', translation: 'מכונית', options: ['bus', 'car', 'bike', 'train'], category: 'transport' },
  { word: 'bus', translation: 'אוטובוס', options: ['taxi', 'bus', 'tram', 'truck'], category: 'transport' },
  { word: 'train', translation: 'רכבת', options: ['plane', 'train', 'boat', 'ship'], category: 'transport' },
  { word: 'bike', translation: 'אופניים', options: ['skate', 'bike', 'walk', 'run'], category: 'transport' },
  { word: 'plane', translation: 'מטוס', options: ['helicopter', 'plane', 'rocket', 'jet'], category: 'transport' },
  { word: 'boat', translation: 'סירה', options: ['boat', 'submarine', 'bridge', 'road'], category: 'transport' },
  { word: 'house', translation: 'בית', options: ['house', 'school', 'park', 'shop'], category: 'places' },
  { word: 'ball', translation: 'כדור', options: ['ball', 'bat', 'goal', 'net'], category: 'sports' },
  { word: 'happy', translation: 'שמח', options: ['sad', 'happy', 'angry', 'tired'], category: 'feelings' },
];

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
