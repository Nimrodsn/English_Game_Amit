import { useCallback, useEffect, useState } from 'react';
import {
  databases,
  APPWRITE_DB,
  COLLECTIONS,
  ID,
  progressPermissions,
} from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import { getLevelById, LEVEL_BONUS_POINTS } from '../data/levels';
import { loadLevelPuzzles } from '../services/puzzleService';
import { preloadImage } from '../services/imageService';
import { useLevelProgress } from './useLevelProgress';

const POINTS_PER_CORRECT = 10;
const FEEDBACK_DELAY_MS = 1200;

export function useGameEngine(levelId) {
  const level = getLevelById(levelId);
  const { user, addPoints, demoMode } = useAuth();
  const { markLevelComplete, completedIds } = useLevelProgress();
  const earnsPoints = !completedIds.includes(level.id);

  const [puzzles, setPuzzles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPointsPop, setShowPointsPop] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [bonusAwarded, setBonusAwarded] = useState(false);
  const [levelBonusEarned, setLevelBonusEarned] = useState(false);

  const loadRound = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setFeedback(null);
    setSelectedWord(null);
    setSessionCorrect(0);
    setBonusAwarded(false);
    setLevelBonusEarned(false);

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
    if (completedIds.includes(level.id)) return;

    markLevelComplete(level.id);
    try {
      await addPoints(LEVEL_BONUS_POINTS);
      setLevelBonusEarned(true);
    } catch (err) {
      console.error('Level bonus failed:', err);
    }
  }, [bonusAwarded, level.id, completedIds, markLevelComplete, addPoints]);

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

      if (isCorrect) {
        setSessionCorrect((c) => c + 1);
        if (earnsPoints) {
          setShowPointsPop(true);
          try {
            await addPoints(POINTS_PER_CORRECT);
          } catch (err) {
            console.error('Points update failed:', err);
          }
        }
      }

      try {
        await recordProgress(currentPuzzle, isCorrect);
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
    [currentPuzzle, feedback, addPoints, earnsPoints, currentIndex, puzzles],
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
    earnsPoints,
    levelBonusEarned,
    levelBonus: LEVEL_BONUS_POINTS,
    submitAnswer,
    restartSession: loadRound,
    loadRound,
  };
}
