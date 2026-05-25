import { RotateCcw, Star } from 'lucide-react';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import QuizCard from '../components/QuizCard';
import { useGameEngine } from '../hooks/useGameEngine';

export default function GamePage() {
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
    submitAnswer,
    restartSession,
  } = useGameEngine();

  return (
    <Layout>
      <div className="relative">
        <h1 className="mb-3 text-center text-2xl font-extrabold text-purple-dark">
          Word Quest
        </h1>

        <ProgressBar
          value={progressPercent}
          label={`Level ${Math.min(currentIndex + 1, totalPuzzles || 1)} of ${totalPuzzles || 1}`}
        />

        {showPointsPop && (
          <span className="pointer-events-none absolute right-4 top-16 z-10 flex items-center gap-1 rounded-full bg-lime-pastel px-3 py-1 text-lg font-extrabold text-lime-900 animate-float-up shadow-lg">
            <Star className="h-5 w-5 fill-current" />
            +10
          </span>
        )}

        <div className="mt-4">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-pastel border-t-purple-dark" />
            </div>
          )}

          {error && !loading && (
            <p className="mb-3 rounded-2xl bg-amber-100 px-3 py-2 text-center text-sm font-bold text-amber-800">
              {error}
            </p>
          )}

          {!loading && isComplete && (
            <div className="rounded-3xl bg-white/85 p-6 text-center shadow-lg">
              <p className="text-2xl font-extrabold text-purple-dark">Amazing job!</p>
              <p className="mt-2 font-semibold text-slate-600">
                You got {sessionCorrect} out of {totalPuzzles} correct this round.
              </p>
              <button
                type="button"
                onClick={restartSession}
                className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-lime-pastel text-lg font-extrabold text-lime-900 transition active:scale-95"
              >
                <RotateCcw className="h-6 w-6" />
                Play Again
              </button>
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
