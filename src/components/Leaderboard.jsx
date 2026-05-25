import { useEffect, useState } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { databases, APPWRITE_DB, COLLECTIONS, Query, isAppwriteConfigured } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';

const DEMO_LEADERS_KEY = 'english_game_demo_leaders';

function loadDemoLeaders() {
  try {
    const raw = localStorage.getItem(DEMO_LEADERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoLeader(profile) {
  const list = loadDemoLeaders().filter((p) => p.user_id !== profile.user_id);
  list.push({
    user_id: profile.user_id,
    username: profile.username,
    total_points: profile.total_points ?? 0,
    avatar_url: profile.avatar_url,
  });
  list.sort((a, b) => b.total_points - a.total_points);
  localStorage.setItem(DEMO_LEADERS_KEY, JSON.stringify(list.slice(0, 10)));
}

function rankIcon(index) {
  if (index === 0) return <Trophy className="h-6 w-6 text-amber-500" />;
  if (index === 1) return <Medal className="h-6 w-6 text-slate-400" />;
  if (index === 2) return <Medal className="h-6 w-6 text-amber-700" />;
  return <Star className="h-5 w-5 text-purple-pastel" />;
}

export default function Leaderboard() {
  const { profile, demoMode } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && demoMode) {
      saveDemoLeader(profile);
    }
  }, [profile, demoMode]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (demoMode || !isAppwriteConfigured()) {
          const list = loadDemoLeaders();
          if (profile && !list.find((l) => l.user_id === profile.user_id)) {
            list.push({
              user_id: profile.user_id,
              username: profile.username,
              total_points: profile.total_points ?? 0,
            });
            list.sort((a, b) => b.total_points - a.total_points);
          }
          setLeaders(list.slice(0, 10));
          return;
        }

        const res = await databases.listDocuments(APPWRITE_DB, COLLECTIONS.profiles, [
          Query.orderDesc('total_points'),
          Query.limit(10),
        ]);
        setLeaders(res.documents);
      } catch {
        setLeaders(loadDemoLeaders());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile, demoMode]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-pastel border-t-purple-dark" />
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <p className="rounded-3xl bg-white/70 p-6 text-center font-bold text-slate-600">
        No explorers yet. Play the game to earn points!
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {leaders.map((entry, index) => {
        const isMe = profile?.user_id === entry.user_id;
        return (
          <li
            key={entry.user_id || entry.$id || index}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm ${
              isMe
                ? 'border-2 border-purple-dark bg-purple-pastel/50'
                : 'bg-white/80'
            }`}
          >
            <span className="flex w-8 shrink-0 justify-center">{rankIcon(index)}</span>
            <span className="w-6 shrink-0 text-center text-sm font-extrabold text-slate-500">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-extrabold text-slate-800">
              {entry.username}
            </span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-lime-pastel px-3 py-1 text-sm font-extrabold">
              <Star className="h-4 w-4" />
              {entry.total_points ?? 0}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
