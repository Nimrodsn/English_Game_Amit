function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildOptions(correctWord, categoryWords, count = 4) {
  const normalizedCorrect = String(correctWord || '').trim().toLowerCase();
  if (!normalizedCorrect) return [];

  const uniquePool = [...new Set((categoryWords || []).map((w) => String(w).trim().toLowerCase()))]
    .filter(Boolean)
    .filter((word) => word !== normalizedCorrect);

  const wrongNeeded = Math.max(0, count - 1);
  const wrongAnswers = shuffle(uniquePool).slice(0, wrongNeeded);
  return shuffle([normalizedCorrect, ...wrongAnswers]);
}
