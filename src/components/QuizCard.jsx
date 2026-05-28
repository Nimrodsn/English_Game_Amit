import { useCallback, useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { getFallbackImage, getImageForWord, genericPlaceholder } from '../services/imageService';
import { speakText } from '../services/speechService';
import OptionButton from './OptionButton';

export default function QuizCard({
  puzzle,
  feedback,
  selectedWord,
  onSelect,
  disabled,
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [hintSpeaking, setHintSpeaking] = useState(false);

  const loadImage = useCallback(async () => {
    setImageLoading(true);
    setImageError(false);
    const url = await getImageForWord(puzzle.word, puzzle.image_url, puzzle.category);
    setImageUrl(url);
    setImageLoading(false);
  }, [puzzle.word, puzzle.image_url, puzzle.category]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const handleImageError = async () => {
    if (imageError) {
      setImageUrl(genericPlaceholder());
      return;
    }
    setImageError(true);
    setImageLoading(true);
    const fallback = await getFallbackImage(puzzle.word);
    setImageUrl(fallback);
    setImageLoading(false);
  };

  const handleSpeakHint = async () => {
    if (!puzzle.translation || hintSpeaking) return;
    setHintSpeaking(true);
    try {
      await speakText(puzzle.translation, 'he');
    } finally {
      setHintSpeaking(false);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white/80 p-4 shadow-lg backdrop-blur">
      <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl bg-purple-pastel/30">
        {imageLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-purple-pastel" />
            <span className="text-xs font-bold text-slate-500">Loading picture...</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`Picture of ${puzzle.word}`}
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        )}
      </div>

      {puzzle.translation && (
        <div className="mb-3 flex items-center justify-center gap-2">
          <p className="text-center text-sm font-semibold text-slate-500" dir="auto">
            Hint: {puzzle.translation}
          </p>
          <button
            type="button"
            onClick={handleSpeakHint}
            disabled={hintSpeaking}
            aria-label="Hear the hint in Hebrew"
            className="flex min-h-9 min-w-9 items-center justify-center rounded-full bg-purple-pastel/80 text-purple-dark transition hover:bg-peach-pastel active:scale-95 disabled:opacity-50"
          >
            <Volume2 className={`h-4 w-4 ${hintSpeaking ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      )}

      <p className="mb-4 text-center text-lg font-extrabold text-purple-dark">
        Which word matches the picture?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {(puzzle.options || []).map((option) => (
          <OptionButton
            key={option}
            option={option}
            correctWord={puzzle.word}
            feedback={feedback}
            selectedWord={selectedWord}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
