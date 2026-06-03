import { Link } from 'react-router-dom';
import { Lock, Check, Star } from 'lucide-react';
import { useLevelProgress } from '../hooks/useLevelProgress';
import { useAuth } from '../context/AuthContext';
import { DIFFICULTY, DIFFICULTY_ORDER } from '../data/levels';

const colorMap = {
  lime: 'from-lime-pastel to-lime-pastel/60 border-lime-dark/30',
  peach: 'from-peach-pastel to-peach-pastel/60 border-orange-300/40',
  purple: 'from-purple-pastel to-purple-pastel/60 border-purple-dark/30',
};

const difficultyBadge = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-900',
  hard: 'bg-orange-100 text-orange-900',
  expert: 'bg-purple-100 text-purple-900',
};

export default function LevelSelect() {
  const { profile } = useAuth();
  const { levelsWithStatus } = useLevelProgress(profile?.total_points ?? 0);

  const grouped = DIFFICULTY_ORDER.map((key) => ({
    key,
    label: DIFFICULTY[key].label,
    levels: levelsWithStatus.filter((l) => l.difficulty === key),
  })).filter((g) => g.levels.length > 0);

  return (
    <div className="w-full">
      <h2 className="mb-2 text-center text-base font-extrabold text-purple-dark">
        Choose Your Level
      </h2>
      <div className="flex flex-col gap-4">
        {grouped.map((section) => (
          <div key={section.key}>
            <h3 className="mb-1.5 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600">
              {section.label}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {section.levels.map((level) => {
                const colors = colorMap[level.color] || colorMap.purple;
                const badgeClass = difficultyBadge[level.difficulty] || difficultyBadge.medium;
                const inner = (
                  <div
                    className={`relative flex min-h-[5.5rem] flex-col rounded-xl border-2 bg-gradient-to-br p-2 shadow-sm ${colors} ${
                      level.unlocked ? 'opacity-100' : 'opacity-55'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xl leading-none">{level.emoji}</span>
                      <div className="flex shrink-0 items-center gap-0.5">
                        {level.completed && (
                          <Check className="h-4 w-4 text-green-600" aria-hidden />
                        )}
                        {!level.unlocked && (
                          <Lock className="h-4 w-4 text-slate-500" aria-hidden />
                        )}
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-2 text-left text-xs font-extrabold leading-tight text-slate-800">
                      {level.title}
                    </p>
                    <span
                      className={`mt-1 w-fit rounded-md px-1.5 py-0.5 text-[9px] font-bold leading-none ${badgeClass}`}
                    >
                      {DIFFICULTY[level.difficulty]?.label}
                    </span>
                    {level.unlockPoints > 0 && !level.unlocked && (
                      <p className="mt-auto flex items-center gap-0.5 pt-1 text-[10px] font-bold leading-none text-amber-700">
                        <Star className="h-2.5 w-2.5" />
                        {level.unlockPoints}
                      </p>
                    )}
                  </div>
                );

                if (!level.unlocked) {
                  return (
                    <div key={level.id} aria-disabled className="cursor-not-allowed">
                      {inner}
                    </div>
                  );
                }

                return (
                  <Link
                    key={level.id}
                    to={`/game/${level.id}`}
                    className="transition active:scale-[0.98]"
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
