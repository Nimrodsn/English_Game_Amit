const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY;
const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

/** Generic pastel card — no word text (avoids "picture = letters" confusion). */
function genericPlaceholder() {
  return 'https://placehold.co/600x400/e9d5ff/c084fc?text=🖼️';
}

async function fetchOpenAI(word, category = '') {
  try {
    const params = new URLSearchParams({ word });
    if (category) params.set('category', category);
    const res = await fetch(`/api/generate-image?${params}`);
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

/** Free Wikipedia thumbnail — works well for common nouns (apple, dog, etc.). */
async function fetchWikipedia(word) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const src = data.thumbnail?.source;
    if (!src) return null;
    return src.replace(/\/\d+px-/, '/600px-');
  } catch {
    return null;
  }
}

/** Free AI illustration — no API key (fallback when OpenAI/Pexels unavailable). */
function pollinationsUrl(word) {
  const prompt = encodeURIComponent(
    `cute colorful cartoon ${word} illustration for children learning English, simple, no text`,
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=600&height=400&nologo=true`;
}

const cache = new Map();

async function resolveImage(word, category = '') {
  const openai = await fetchOpenAI(word, category);
  if (openai) return openai;

  const pexels = await fetchPexels(word);
  if (pexels) return pexels;

  const unsplash = await fetchUnsplash(word);
  if (unsplash) return unsplash;

  const wiki = await fetchWikipedia(word);
  if (wiki) return wiki;

  return pollinationsUrl(word);
}

/** Warm the cache for the next card (OpenAI / Pexels / fallbacks). */
export function preloadImage(word, cachedUrl = '', category = '') {
  if (!word) return;
  getImageForWord(word, cachedUrl, category).catch(() => {});
}

export async function getImageForWord(word, cachedUrl = '', category = '') {
  if (cachedUrl?.trim()) return cachedUrl;

  const key = `${word.toLowerCase()}-${category}`;
  if (cache.has(key)) return cache.get(key);

  const url = await resolveImage(word, category);
  cache.set(key, url);
  return url;
}

/** Called when <img> fails to load (expired OpenAI URL, blocked host, etc.). */
export async function getFallbackImage(word) {
  const wiki = await fetchWikipedia(word);
  if (wiki) return wiki;
  return pollinationsUrl(word);
}

export { genericPlaceholder };
