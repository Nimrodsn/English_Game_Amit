import { useCallback, useEffect, useState } from 'react';
import { getFallbackImage, getImageForWord, genericPlaceholder } from '../services/imageService';

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

  const getButtonClass = (option) => {
    const base =
      'min-h-14 w-full rounded-2xl border-2 px-2 text-base font-extrabold capitalize transition active:scale-95 sm:text-lg';

    if (!feedback) {
      return `${base} border-purple-pastel bg-white/90 text-slate-800 shadow-sm hover:bg-peach-pastel/60 disabled:opacity-60`;
    }

    const isSelected = selectedWord === option;
    const isCorrect = option.toLowerCase() === puzzle.word.toLowerCase();

    if (isCorrect) {
      return `${base} border-green-500 bg-green-400 text-white animate-pop scale-105`;
    }
    if (isSelected && !isCorrect) {
      return `${base} border-red-500 bg-red-400 text-white animate-shake`;
    }
    return `${base} border-slate-200 bg-slate-100 text-slate-400 opacity-70`;
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
        <p className="mb-3 text-center text-sm font-semibold text-slate-500" dir="auto">
          Hint: {puzzle.translation}
        </p>
      )}

      <p className="mb-4 text-center text-lg font-extrabold text-purple-dark">
        Which word matches the picture?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {(puzzle.options || []).map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled || Boolean(feedback)}
            onClick={() => onSelect(option)}
            className={getButtonClass(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
