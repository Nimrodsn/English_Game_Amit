const cache = new Map();
let currentAudio = null;

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

export function speakWordFallback(word) {
  stopSpeaking();
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export async function speakWord(word) {
  const key = word.toLowerCase().trim();
  if (!key) return;

  stopSpeaking();

  if (cache.has(key)) {
    currentAudio = new Audio(cache.get(key));
    try {
      await currentAudio.play();
    } catch {
      speakWordFallback(key);
    }
    return;
  }

  try {
    const res = await fetch(`/api/speak-word?word=${encodeURIComponent(key)}`);
    if (!res.ok) {
      speakWordFallback(key);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    currentAudio = new Audio(url);
    await currentAudio.play();
  } catch {
    speakWordFallback(key);
  }
}
