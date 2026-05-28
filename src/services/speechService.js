const cache = new Map();
let currentAudio = null;
const DEFAULT_LANG = 'en';

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function speakWordFallback(word, lang = DEFAULT_LANG) {
  stopSpeaking();
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = lang === 'he' ? 'he-IL' : 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export async function speakText(text, lang = DEFAULT_LANG) {
  const normalized = String(text || '').trim();
  if (!normalized) return;
  const key = `${lang}:${normalized.toLowerCase()}`;

  stopSpeaking();

  if (cache.has(key)) {
    currentAudio = new Audio(cache.get(key));
    try {
      await currentAudio.play();
    } catch {
      speakWordFallback(normalized, lang);
    }
    return;
  }

  try {
    const params = new URLSearchParams({
      word: normalized,
      lang,
    });
    const res = await fetch(`/api/speak-word?${params.toString()}`);
    if (!res.ok) {
      speakWordFallback(normalized, lang);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    currentAudio = new Audio(url);
    await currentAudio.play();
  } catch {
    speakWordFallback(normalized, lang);
  }
}

export async function speakWord(word) {
  return speakText(word, 'en');
}
