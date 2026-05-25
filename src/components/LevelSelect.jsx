import { Link } from 'react-router-dom';
import { Lock, Check, Star } from 'lucide-react';
import { useLevelProgress } from '../hooks/useLevelProgress';
import { useAuth } from '../context/AuthContext';

const colorMap = {
  lime: 'from-lime-pastel to-lime-pastel/60 border-lime-dark/30',
  peach: 'from-peach-pastel to-peach-pastel/60 border-orange-300/40',
  purple: 'from-purple-pastel to-purple-pastel/60 border-purple-dark/30',
};

export default function LevelSelect() {
  const { profile } = useAuth();
  const { levelsWithStatus } = useLevelProgress(profile?.total_points ?? 0);

  return (
    <div className="flex w-full flex-col gap-3">
      <h2 className="text-center text-lg font-extrabold text-purple-dark">Choose Your Level</h2>
      {levelsWithStatus.map((level) => {
        const colors = colorMap[level.color] || colorMap.purple;
        const inner = (
          <div
            className={`flex items-center gap-3 rounded-2xl border-2 bg-gradient-to-r p-4 shadow-sm ${colors} ${
              level.unlocked ? 'opacity-100' : 'opacity-55'
            }`}
          >
            <span className="text-3xl">{level.emoji}</span>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-extrabold text-slate-800">{level.title}</p>
              <p className="text-xs font-semibold text-slate-600">{level.description}</p>
              {level.unlockPoints > 0 && !level.unlocked && (
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-700">
                  <Star className="h-3 w-3" />
                  Need {level.unlockPoints} points
                </p>
              )}
            </div>
            {level.completed && (
              <Check className="h-7 w-7 shrink-0 text-green-600" />
            )}
            {!level.unlocked && <Lock className="h-7 w-7 shrink-0 text-slate-500" />}
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
  );
}
