import { useEffect, useState } from 'react';
import { getImageForWord } from '../services/imageService';

export default function QuizCard({
  puzzle,
  feedback,
  selectedWord,
  onSelect,
  disabled,
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setImageLoading(true);

    getImageForWord(puzzle.word, puzzle.image_url).then((url) => {
      if (!cancelled) {
        setImageUrl(url);
        setImageLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [puzzle.word, puzzle.image_url]);

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
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-pulse rounded-full bg-purple-pastel" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={puzzle.word}
            className="h-full w-full object-cover"
            loading="lazy"
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
