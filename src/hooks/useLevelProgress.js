import { useCallback, useMemo, useState } from 'react';
import { LEVELS, isLevelUnlocked } from '../data/levels';

const STORAGE_KEY = 'english_game_level_progress';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { completed: [] };
  } catch {
    return { completed: [] };
  }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useLevelProgress(totalPoints = 0) {
  const [progress, setProgress] = useState(loadProgress);

  const completedIds = progress.completed || [];

  const levelsWithStatus = useMemo(
    () =>
      LEVELS.map((level) => ({
        ...level,
        unlocked: isLevelUnlocked(level, totalPoints, completedIds),
        completed: completedIds.includes(level.id),
      })),
    [totalPoints, completedIds],
  );

  const markLevelComplete = useCallback((levelId) => {
    setProgress((prev) => {
      const completed = [...new Set([...(prev.completed || []), levelId])];
      const next = { completed };
      saveProgress(next);
      return next;
    });
  }, []);

  return { levelsWithStatus, completedIds, markLevelComplete };
}
