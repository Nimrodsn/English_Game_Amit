import { useCallback, useEffect, useState } from 'react';
import {
  databases,
  APPWRITE_DB,
  COLLECTIONS,
  ID,
  Query,
  isAppwriteConfigured,
  progressPermissions,
} from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import { DEMO_PUZZLES } from '../data/demoPuzzles';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const POINTS_PER_CORRECT = 10;
const FEEDBACK_DELAY_MS = 1200;

export function useGameEngine() {
  const { user, profile, updatePoints, demoMode } = useAuth();
  const [puzzles, setPuzzles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPointsPop, setShowPointsPop] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const loadPuzzles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (demoMode || !isAppwriteConfigured()) {
        setPuzzles(shuffle(DEMO_PUZZLES));
        return;
      }

      const all = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const res = await databases.listDocuments(APPWRITE_DB, COLLECTIONS.puzzles, [
          Query.limit(limit),
          Query.offset(offset),
        ]);
        all.push(...res.documents);
        hasMore = res.documents.length === limit;
        offset += limit;
      }

      if (all.length === 0) {
        setPuzzles(shuffle(DEMO_PUZZLES));
      } else {
        setPuzzles(shuffle(all));
      }
    } catch (err) {
      setError(err.message || 'Could not load puzzles');
      setPuzzles(shuffle(DEMO_PUZZLES));
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  useEffect(() => {
    loadPuzzles();
  }, [loadPuzzles]);

  const currentPuzzle = puzzles[currentIndex] ?? null;
  const totalPuzzles = puzzles.length;
  const progressPercent = totalPuzzles ? ((currentIndex + (feedback ? 1 : 0)) / totalPuzzles) * 100 : 0;
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
        setCurrentIndex((i) => i + 1);
      }, FEEDBACK_DELAY_MS);
    },
    [currentPuzzle, feedback, profile, updatePoints, user, demoMode],
  );

  const restartSession = () => {
    setCurrentIndex(0);
    setFeedback(null);
    setSelectedWord(null);
    setSessionCorrect(0);
    setPuzzles((p) => shuffle(p));
  };

  return {
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
    submitAnswer,
    restartSession,
    loadPuzzles,
  };
}
