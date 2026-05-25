import { useCallback, useEffect, useState } from 'react';
import {
  databases,
  APPWRITE_DB,
  COLLECTIONS,
  ID,
  progressPermissions,
} from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import { getLevelById, LEVEL_BONUS_POINTS, PUZZLES_PER_ROUND } from '../data/levels';
import { loadLevelPuzzles } from '../services/puzzleService';
import { preloadImage } from '../services/imageService';
import { useLevelProgress } from './useLevelProgress';
import { debugLog } from '../lib/debugLog';

const POINTS_PER_CORRECT = 10;
const FEEDBACK_DELAY_MS = 1200;

export function useGameEngine(levelId) {
  const level = getLevelById(levelId);
  const { user, profile, addPoints, demoMode } = useAuth();
  const { markLevelComplete } = useLevelProgress(profile?.total_points ?? 0);

  const [puzzles, setPuzzles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPointsPop, setShowPointsPop] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [bonusAwarded, setBonusAwarded] = useState(false);

  const loadRound = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setFeedback(null);
    setSelectedWord(null);
    setSessionCorrect(0);
    setBonusAwarded(false);

    try {
      const round = await loadLevelPuzzles(level, { demoMode, useAI: true });
      setPuzzles(round);
      if (round[0]) preloadImage(round[0].word, round[0].image_url, round[0].category);
      if (round[1]) preloadImage(round[1].word, round[1].image_url, round[1].category);
    } catch (err) {
      setError(err.message || 'Could not load puzzles');
    } finally {
      setLoading(false);
    }
  }, [level, demoMode]);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  const currentPuzzle = puzzles[currentIndex] ?? null;
  const totalPuzzles = puzzles.length;
  const progressPercent = totalPuzzles
    ? ((currentIndex + (feedback ? 1 : 0)) / totalPuzzles) * 100
    : 0;
  const isComplete = totalPuzzles > 0 && currentIndex >= totalPuzzles;

  const recordProgress = async (puzzle, isCorrect) => {
    if (demoMode || !user) return;

    await databases.createDocument(
      APPWRITE_DB,
      COLLECTIONS.progress,
      ID.unique(),
      {
        user_id: user.$id,
        puzzle_id: puzzle.$id,
        is_correct: isCorrect,
      },
      progressPermissions(user.$id),
    );
  };

  const awardLevelBonus = useCallback(async () => {
    if (bonusAwarded) return;
    setBonusAwarded(true);
    markLevelComplete(level.id);
    // #region agent log
    debugLog('useGameEngine.js:awardLevelBonus', 'level bonus', {
      bonus: LEVEL_BONUS_POINTS,
      sessionCorrect,
      totalPuzzles,
    }, 'E');
    // #endregion
    await addPoints(LEVEL_BONUS_POINTS);
  }, [bonusAwarded, level.id, markLevelComplete, addPoints, sessionCorrect, totalPuzzles]);

  useEffect(() => {
    if (isComplete && sessionCorrect >= Math.ceil(totalPuzzles * 0.6)) {
      awardLevelBonus();
    }
  }, [isComplete, sessionCorrect, totalPuzzles, awardLevelBonus]);

  const submitAnswer = useCallback(
    async (word) => {
      if (!currentPuzzle || feedback) return;

      const isCorrect = word.toLowerCase() === currentPuzzle.word.toLowerCase();
      // #region agent log
      debugLog('useGameEngine.js:submitAnswer', 'answer checked', {
        selectedWord: word,
        correctWord: currentPuzzle.word,
        isCorrect,
        profilePointsBefore: profile?.total_points ?? 0,
        currentIndex,
        puzzleId: currentPuzzle.$id,
      }, isCorrect ? 'A' : 'B');
      // #endregion
      setSelectedWord(word);
      setFeedback(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) {
        setSessionCorrect((c) => {
          const next = c + 1;
          // #region agent log
          debugLog('useGameEngine.js:sessionCorrect', 'session count', { prev: c, next }, 'D');
          // #endregion
          return next;
        });
        setShowPointsPop(true);
        try {
          const updated = await addPoints(POINTS_PER_CORRECT);
          // #region agent log
          debugLog('useGameEngine.js:addPoints', 'after correct', {
            returnedTotal: updated?.total_points,
            delta: POINTS_PER_CORRECT,
          }, 'A');
          // #endregion
        } catch (err) {
          // #region agent log
          debugLog('useGameEngine.js:addPoints', 'points failed', { message: err?.message }, 'C');
          // #endregion
          console.error('Points update failed:', err);
        }
      }

      try {
        await recordProgress(currentPuzzle, isCorrect);
      } catch (err) {
        // #region agent log
        debugLog('useGameEngine.js:recordProgress', 'error', { message: err?.message }, 'C');
        // #endregion
        console.error('Progress save failed:', err);
      }

      setTimeout(() => {
        setShowPointsPop(false);
        setFeedback(null);
        setSelectedWord(null);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        const nextPuzzle = puzzles[nextIndex + 1];
        if (nextPuzzle) preloadImage(nextPuzzle.word, nextPuzzle.image_url, nextPuzzle.category);
      }, FEEDBACK_DELAY_MS);
    },
    [currentPuzzle, feedback, profile, addPoints, user, demoMode, currentIndex, puzzles],
  );

  return {
    level,
    puzzles,
    currentPuzzle,
    currentIndex,
    totalPuzzles,
    progressPercent,
    feedback,
    selectedWord,
    loading,
    error,
    isComplete,
    sessionCorrect,
    showPointsPop,
    bonusAwarded,
    levelBonus: LEVEL_BONUS_POINTS,
    submitAnswer,
    restartSession: loadRound,
    loadRound,
  };
}
