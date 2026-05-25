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
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-lime-pastel via-purple-pastel to-peach-pastel shadow-lg">
          <Sparkles className="h-10 w-10 text-purple-dark" />
        </div>

        <h1 className="text-2xl font-extrabold leading-tight text-purple-dark">
          Welcome, {profile?.username || 'Explorer'}!
        </h1>
        <p className="mt-1 max-w-xs text-sm font-semibold text-slate-600">
          Pick a level, learn new words, earn stars!
        </p>

        <div className="mt-5 w-full">
          <LevelSelect />
        </div>

        <Link
          to="/leaderboard"
          className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-3xl bg-purple-pastel px-6 text-lg font-extrabold text-purple-900 shadow-lg transition active:scale-95"
        >
          <Trophy className="h-7 w-7" />
          Top English Explorers
        </Link>

        <div className="mt-5 w-full rounded-3xl bg-white/70 p-4 text-left shadow-sm">
          <h2 className="mb-2 text-sm font-extrabold text-purple-dark">How to play</h2>
          <ol className="list-decimal space-y-1 pl-5 text-xs font-semibold text-slate-600">
            <li>Choose an unlocked level (8 words per round).</li>
            <li>Match the picture to the correct English word.</li>
            <li>+10 points per correct answer, +25 bonus when you finish a level!</li>
            <li>Unlock harder levels with more total points.</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
