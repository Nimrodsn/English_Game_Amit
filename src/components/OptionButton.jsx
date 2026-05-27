import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakWord } from '../services/speechService';

export default function OptionButton({
  option,
  correctWord,
  feedback,
  selectedWord,
  disabled,
  onSelect,
}) {
  const [speaking, setSpeaking] = useState(false);

  const isSelected = selectedWord === option;
  const isCorrect = option.toLowerCase() === correctWord.toLowerCase();

  let wrapperClass =
    'flex min-h-14 w-full items-center gap-1 rounded-2xl border-2 p-1 transition';

  if (!feedback) {
    wrapperClass += ' border-purple-pastel bg-white/90 shadow-sm';
  } else if (isCorrect) {
    wrapperClass += ' border-green-500 bg-green-400 animate-pop scale-105';
  } else if (isSelected && !isCorrect) {
    wrapperClass += ' border-red-500 bg-red-400 animate-shake';
  } else {
    wrapperClass += ' border-slate-200 bg-slate-100 opacity-70';
  }

  const textClass = `flex-1 px-2 text-base font-extrabold capitalize sm:text-lg ${
    feedback && (isCorrect || (isSelected && !isCorrect))
      ? 'text-white'
      : feedback
        ? 'text-slate-400'
        : 'text-slate-800'
  }`;

  const handleSpeak = async (e) => {
    e.stopPropagation();
    if (speaking) return;
    setSpeaking(true);
    try {
      await speakWord(option);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        disabled={disabled || Boolean(feedback)}
        onClick={() => onSelect(option)}
        className={`${textClass} min-h-11 rounded-xl text-left active:scale-95 disabled:opacity-60`}
      >
        {option}
      </button>
      <button
        type="button"
        onClick={handleSpeak}
        disabled={speaking}
        aria-label={`Hear the word ${option}`}
        className={`flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full transition active:scale-95 ${
          feedback && isCorrect
            ? 'bg-white/30 text-white'
            : feedback && isSelected
              ? 'bg-white/30 text-white'
              : 'bg-purple-pastel/80 text-purple-dark hover:bg-peach-pastel'
        } disabled:opacity-50`}
      >
        <Volume2 className={`h-5 w-5 ${speaking ? 'animate-pulse' : ''}`} />
      </button>
    </div>
  );
}
