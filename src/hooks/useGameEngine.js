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

const POINTS_PER_CORRECT = 10;
const FEEDBACK_DELAY_MS = 1200;

export function useGameEngine(levelId) {
  const level = getLevelById(levelId);
  const { user, profile, updatePoints, demoMode } = useAuth();
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
    const newTotal = (profile?.total_points ?? 0) + LEVEL_BONUS_POINTS;
    await updatePoints(newTotal);
  }, [bonusAwarded, level.id, markLevelComplete, profile, updatePoints]);

  useEffect(() => {
    if (isComplete && sessionCorrect >= Math.ceil(totalPuzzles * 0.6)) {
      awardLevelBonus();
    }
  }, [isComplete, sessionCorrect, totalPuzzles, awardLevelBonus]);

  const submitAnswer = useCallback(
    async (word) => {
      if (!currentPuzzle || feedback) return;

      const isCorrect = word.toLowerCase() === currentPuzzle.word.toLowerCase();
      setSelectedWord(word);
      setFeedback(isCorrect ? 'correct' : 'wrong');

      try {
        await recordProgress(currentPuzzle, isCorrect);

        if (isCorrect) {
          setSessionCorrect((c) => c + 1);
          setShowPointsPop(true);
          const newTotal = (profile?.total_points ?? 0) + POINTS_PER_CORRECT;
          await updatePoints(newTotal);
        }
      } catch (err) {
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
    [currentPuzzle, feedback, profile, updatePoints, user, demoMode, currentIndex, puzzles],
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
