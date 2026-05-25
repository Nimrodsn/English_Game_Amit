import { Link, useParams } from 'react-router-dom';
import { RotateCcw, Star, Home } from 'lucide-react';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import QuizCard from '../components/QuizCard';
import { useGameEngine } from '../hooks/useGameEngine';
import { getLevelById } from '../data/levels';

export default function GamePage() {
  const { levelId } = useParams();
  const level = getLevelById(levelId);
  const {
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
    levelBonus,
    submitAnswer,
    restartSession,
  } = useGameEngine(levelId);

  return (
    <Layout>
      <div className="relative">
        <div className="mb-2 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-xl bg-white/70 px-2 py-1 text-xs font-bold text-slate-600"
          >
            <Home className="h-4 w-4" />
            Levels
          </Link>
          <span className="text-2xl">{level.emoji}</span>
        </div>

        <h1 className="mb-1 text-center text-xl font-extrabold text-purple-dark">
          {level.title}
        </h1>
        <p className="mb-3 text-center text-xs font-semibold text-slate-500">
          Word {Math.min(currentIndex + 1, totalPuzzles || 1)} of {totalPuzzles || 8}
        </p>

        <ProgressBar value={progressPercent} label="Level progress" />

        {showPointsPop && (
          <span className="pointer-events-none absolute right-4 top-20 z-10 flex items-center gap-1 rounded-full bg-lime-pastel px-3 py-1 text-lg font-extrabold text-lime-900 animate-float-up shadow-lg">
            <Star className="h-5 w-5 fill-current" />
            +10
          </span>
        )}

        <div className="mt-4">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-pastel border-t-purple-dark" />
              <p className="text-sm font-bold text-slate-500">Loading words & pictures...</p>
            </div>
          )}

          {error && !loading && (
            <p className="mb-3 rounded-2xl bg-amber-100 px-3 py-2 text-center text-sm font-bold text-amber-800">
              {error}
            </p>
          )}

          {!loading && isComplete && (
            <div className="rounded-3xl bg-white/85 p-6 text-center shadow-lg">
              <p className="text-4xl">{level.emoji}</p>
              <p className="mt-2 text-2xl font-extrabold text-purple-dark">Level complete!</p>
              <p className="mt-2 font-semibold text-slate-600">
                You got {sessionCorrect} out of {totalPuzzles} correct.
              </p>
              {bonusAwarded && (
                <p className="mt-2 font-extrabold text-lime-800">
                  +{levelBonus} bonus stars for finishing!
                </p>
              )}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={restartSession}
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-lime-pastel text-lg font-extrabold text-lime-900 transition active:scale-95"
                >
                  <RotateCcw className="h-6 w-6" />
                  Play Again
                </button>
                <Link
                  to="/"
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-purple-pastel text-lg font-extrabold text-purple-900 transition active:scale-95"
                >
                  <Home className="h-6 w-6" />
                  More Levels
                </Link>
              </div>
            </div>
          )}

          {!loading && !isComplete && currentPuzzle && (
            <>
              {feedback === 'correct' && (
                <p className="mb-2 text-center text-lg font-extrabold text-green-600 animate-pop">
                  Correct! Great job!
                </p>
              )}
              {feedback === 'wrong' && (
                <p className="mb-2 text-center text-lg font-extrabold text-red-600">
                  Oops! The answer was {currentPuzzle.word}.
                </p>
              )}

              <QuizCard
                puzzle={currentPuzzle}
                feedback={feedback}
                selectedWord={selectedWord}
                onSelect={submitAnswer}
                disabled={Boolean(feedback)}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
