const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY;
const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

function placeholder(word) {
  const text = encodeURIComponent(word);
  return `https://placehold.co/600x400/d4b8ff/5b21b6?text=${text}`;
}

async function fetchOpenAI(word) {
  try {
    const res = await fetch(`/api/generate-image?word=${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

async function fetchPexels(word) {
  if (!pexelsKey) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(word)}&per_page=1`,
      { headers: { Authorization: pexelsKey } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.photos?.[0]?.src?.large || data.photos?.[0]?.src?.medium || null;
  } catch {
    return null;
  }
}

async function fetchUnsplash(word) {
  if (!unsplashKey) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1`,
      { headers: { Authorization: `Client-ID ${unsplashKey}` } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch {
    return null;
  }
}

const cache = new Map();

export async function getImageForWord(word, cachedUrl = '') {
  if (cachedUrl?.trim()) return cachedUrl;

  const key = word.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const openai = await fetchOpenAI(word);
  if (openai) {
    cache.set(key, openai);
    return openai;
  }

  const pexels = await fetchPexels(word);
  if (pexels) {
    cache.set(key, pexels);
    return pexels;
  }

  const unsplash = await fetchUnsplash(word);
  if (unsplash) {
    cache.set(key, unsplash);
    return unsplash;
  }

  const fallback = placeholder(word);
  cache.set(key, fallback);
  return fallback;
}
