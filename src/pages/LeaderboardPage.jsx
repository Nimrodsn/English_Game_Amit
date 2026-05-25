import { Trophy } from 'lucide-react';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <Layout>
      <div className="mb-4 flex items-center justify-center gap-2">
        <Trophy className="h-8 w-8 text-amber-500" />
        <h1 className="text-2xl font-extrabold text-purple-dark">Top English Explorers</h1>
      </div>
      <Leaderboard />
    </Layout>
  );
}
