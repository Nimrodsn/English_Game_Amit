import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-lime-pastel via-purple-pastel to-peach-pastel shadow-lg">
          <Sparkles className="h-12 w-12 text-purple-dark" />
        </div>

        <h1 className="text-3xl font-extrabold leading-tight text-purple-dark">
          Welcome, {profile?.username || 'Explorer'}!
        </h1>
        <p className="mt-2 max-w-xs text-base font-semibold text-slate-600">
          Match pictures to English words and climb the leaderboard.
        </p>

        <div className="mt-8 flex w-full flex-col gap-4">
          <Link
            to="/game"
            className="flex min-h-16 items-center justify-center gap-3 rounded-3xl bg-lime-pastel px-6 text-xl font-extrabold text-lime-900 shadow-lg transition active:scale-95"
          >
            <Gamepad2 className="h-8 w-8" />
            Play Now
          </Link>

          <Link
            to="/leaderboard"
            className="flex min-h-16 items-center justify-center gap-3 rounded-3xl bg-purple-pastel px-6 text-xl font-extrabold text-purple-900 shadow-lg transition active:scale-95"
          >
            <Trophy className="h-8 w-8" />
            Top English Explorers
          </Link>
        </div>

        <div className="mt-8 w-full rounded-3xl bg-white/70 p-5 text-left shadow-sm">
          <h2 className="mb-2 font-extrabold text-purple-dark">How to play</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm font-semibold text-slate-600">
            <li>Look at the picture.</li>
            <li>Tap the correct English word.</li>
            <li>Earn 10 points for each correct answer!</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
