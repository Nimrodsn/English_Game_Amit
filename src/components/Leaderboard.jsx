import { useCallback, useEffect, useState } from 'react';
import { Trophy, Medal, Star, Pencil, Check, X } from 'lucide-react';
import { databases, APPWRITE_DB, COLLECTIONS, Query, isAppwriteConfigured } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import { adminUpdateScore } from '../services/adminService';

const DEMO_LEADERS_KEY = 'english_game_demo_leaders';

function loadDemoLeaders() {
  try {
    const raw = localStorage.getItem(DEMO_LEADERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoLeaders(list) {
  localStorage.setItem(DEMO_LEADERS_KEY, JSON.stringify(list.slice(0, 10)));
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
  saveDemoLeaders(list);
}

function updateDemoLeaderScore(userId, totalPoints) {
  const list = loadDemoLeaders().map((entry) =>
    entry.user_id === userId ? { ...entry, total_points: totalPoints } : entry,
  );
  list.sort((a, b) => b.total_points - a.total_points);
  saveDemoLeaders(list);
  return list.slice(0, 10);
}

function rankIcon(index) {
  if (index === 0) return <Trophy className="h-6 w-6 text-amber-500" />;
  if (index === 1) return <Medal className="h-6 w-6 text-slate-400" />;
  if (index === 2) return <Medal className="h-6 w-6 text-amber-700" />;
  return <Star className="h-5 w-5 text-purple-pastel" />;
}

export default function Leaderboard() {
  const { profile, demoMode, isAdmin, refreshProfile } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [adminError, setAdminError] = useState(null);

  useEffect(() => {
    if (profile && demoMode) {
      saveDemoLeader(profile);
    }
  }, [profile, demoMode]);

  const loadLeaders = useCallback(async () => {
    setLoading(true);
    setAdminError(null);
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
  }, [profile, demoMode]);

  useEffect(() => {
    loadLeaders();
  }, [loadLeaders]);

  const getEntryKey = (entry, index) => entry.$id || entry.user_id || String(index);

  const startEdit = (entry, index) => {
    setEditingKey(getEntryKey(entry, index));
    setEditValue(String(entry.total_points ?? 0));
    setAdminError(null);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
    setAdminError(null);
  };

  const saveEdit = async (entry) => {
    const newTotal = Number.parseInt(editValue, 10);
    if (!Number.isInteger(newTotal) || newTotal < 0 || newTotal > 99999) {
      setAdminError('Enter a whole number from 0 to 99999.');
      return;
    }

    setSaving(true);
    setAdminError(null);

    try {
      if (demoMode || !isAppwriteConfigured()) {
        const updated = updateDemoLeaderScore(entry.user_id, newTotal);
        setLeaders(updated);
        if (profile?.user_id === entry.user_id) {
          const nextProfile = { ...profile, total_points: newTotal };
          localStorage.setItem('english_game_demo_profile', JSON.stringify(nextProfile));
          await refreshProfile();
        }
      } else {
        const docId = entry.$id;
        if (!docId) throw new Error('Missing profile id');
        await adminUpdateScore(docId, newTotal);
        setLeaders((prev) => {
          const next = prev.map((row) =>
            row.$id === docId ? { ...row, total_points: newTotal } : row,
          );
          next.sort((a, b) => b.total_points - a.total_points);
          return next;
        });
      }
      setEditingKey(null);
      setEditValue('');
    } catch (err) {
      setAdminError(err.message || 'Could not save score');
    } finally {
      setSaving(false);
    }
  };

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
    <div>
      {isAdmin && (
        <p className="mb-3 rounded-xl bg-amber-100 px-3 py-2 text-center text-xs font-bold text-amber-900">
          Admin mode — tap a score to edit the leaderboard.
        </p>
      )}
      {adminError && (
        <p className="mb-3 rounded-xl bg-red-100 px-3 py-2 text-center text-xs font-bold text-red-800">
          {adminError}
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {leaders.map((entry, index) => {
          const isMe = profile?.user_id === entry.user_id;
          const entryKey = getEntryKey(entry, index);
          const isEditing = editingKey === entryKey;

          return (
            <li
              key={entryKey}
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

              {isEditing ? (
                <div className="flex shrink-0 items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={99999}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-16 rounded-lg border-2 border-purple-pastel px-1 py-0.5 text-center text-sm font-extrabold"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(entry)}
                    disabled={saving}
                    className="rounded-lg bg-lime-pastel p-1 text-lime-900"
                    aria-label="Save score"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="rounded-lg bg-slate-200 p-1 text-slate-700"
                    aria-label="Cancel edit"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-1">
                  <span className="flex items-center gap-1 rounded-full bg-lime-pastel px-3 py-1 text-sm font-extrabold">
                    <Star className="h-4 w-4" />
                    {entry.total_points ?? 0}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => startEdit(entry, index)}
                      className="rounded-lg bg-purple-pastel p-1 text-purple-900"
                      aria-label={`Edit score for ${entry.username}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
