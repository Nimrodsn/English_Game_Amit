import { Link } from 'react-router-dom';
import { Trophy, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import LevelSelect from '../components/LevelSelect';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col items-center text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-lime-pastel via-purple-pastel to-peach-pastel shadow-md">
          <Sparkles className="h-7 w-7 text-purple-dark" />
        </div>

        <h1 className="text-xl font-extrabold leading-tight text-purple-dark">
          Welcome, {profile?.username || 'Explorer'}!
        </h1>
        <p className="text-xs font-semibold text-slate-600">
          Pick a level and earn stars!
        </p>

        <div className="mt-3 w-full">
          <LevelSelect />
        </div>

        <Link
          to="/leaderboard"
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-purple-pastel px-4 text-base font-extrabold text-purple-900 shadow-md transition active:scale-95"
        >
          <Trophy className="h-5 w-5" />
          Leaderboard
        </Link>

        <details className="mt-3 w-full rounded-2xl bg-white/70 p-3 text-left shadow-sm">
          <summary className="cursor-pointer text-xs font-extrabold text-purple-dark">
            How to play
          </summary>
          <ol className="mt-2 list-decimal space-y-0.5 pl-4 text-[11px] font-semibold text-slate-600">
            <li>Choose a level (8 words per round).</li>
            <li>Match the picture to the English word.</li>
            <li>+10 per correct answer, +25 level bonus.</li>
            <li>Unlock levels with more stars.</li>
          </ol>
        </details>
      </div>
    </Layout>
  );
}
