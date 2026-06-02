import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  account,
  databases,
  APPWRITE_DB,
  COLLECTIONS,
  ID,
  Query,
  isAppwriteConfigured,
  profilePermissions,
} from '../lib/appwrite';
import { getClientAdminAllowlist, isAdminEmail } from '../lib/admin';

const AuthContext = createContext(null);

const DEMO_PROFILE_KEY = 'english_game_demo_profile';
const DEMO_USER_KEY = 'english_game_demo_user';

function loadDemoProfile() {
  try {
    const raw = localStorage.getItem(DEMO_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDemoProfile(profile) {
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const demoMode = !isAppwriteConfigured();
  const pointsRef = useRef(0);
  const profileDocRef = useRef(null);

  useEffect(() => {
    if (profile) {
      pointsRef.current = profile.total_points ?? 0;
      profileDocRef.current = profile;
    }
  }, [profile]);

  const fetchProfile = useCallback(async (userId) => {
    if (demoMode) {
      const p = loadDemoProfile();
      if (p && p.user_id === userId) {
        setProfile(p);
        return p;
      }
      return null;
    }

    const res = await databases.listDocuments(APPWRITE_DB, COLLECTIONS.profiles, [
      Query.equal('user_id', [userId]),
      Query.limit(1),
    ]);
    const doc = res.documents[0] ?? null;
    setProfile(doc);
    return doc;
  }, [demoMode]);

  const refreshProfile = useCallback(async () => {
    if (!user) return null;
    return fetchProfile(user.$id);
  }, [user, fetchProfile]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        if (demoMode) {
          const demoUserId = localStorage.getItem(DEMO_USER_KEY);
          if (demoUserId) {
            const demoUser = { $id: demoUserId, name: loadDemoProfile()?.username || 'Explorer' };
            setUser(demoUser);
            await fetchProfile(demoUserId);
          }
        } else {
          const session = await account.get();
          setUser(session);
          await fetchProfile(session.$id);
        }
      } catch {
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [demoMode, fetchProfile]);

  const signUp = async (email, password, username) => {
    setError(null);
    if (demoMode) {
      const userId = ID.unique();
      const newProfile = {
        user_id: userId,
        username,
        total_points: 0,
        avatar_url: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(username)}`,
      };
      localStorage.setItem(DEMO_USER_KEY, userId);
      saveDemoProfile(newProfile);
      setUser({ $id: userId, name: username, email });
      setProfile(newProfile);
      return;
    }

    const newUser = await account.create(ID.unique(), email, password, username);
    await account.createEmailPasswordSession(email, password);

    await databases.createDocument(APPWRITE_DB, COLLECTIONS.profiles, ID.unique(), {
      user_id: newUser.$id,
      username,
      total_points: 0,
      avatar_url: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(username)}`,
    }, profilePermissions(newUser.$id));

    setUser(newUser);
    await fetchProfile(newUser.$id);
  };

  const signIn = async (email, password) => {
    setError(null);
    if (demoMode) {
      const existing = loadDemoProfile();
      if (!existing) {
        throw new Error('No demo account yet. Please sign up first!');
      }
      localStorage.setItem(DEMO_USER_KEY, existing.user_id);
      setUser({ $id: existing.user_id, name: existing.username, email });
      setProfile(existing);
      return;
    }

    await account.createEmailPasswordSession(email, password);
    const session = await account.get();
    setUser(session);
    await fetchProfile(session.$id);
  };

  const signOut = async () => {
    if (demoMode) {
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(null);
      setProfile(null);
      return;
    }
    await account.deleteSession('current');
    setUser(null);
    setProfile(null);
  };

  /** Add points atomically — safe when Appwrite updates lag behind fast answers (production). */
  const addPoints = useCallback(async (delta) => {
    const doc = profileDocRef.current;
    if (!doc || delta === 0) return null;

    const before = pointsRef.current;
    const newTotal = before + delta;
    pointsRef.current = newTotal;

    const optimistic = { ...doc, total_points: newTotal };
    profileDocRef.current = optimistic;
    setProfile(optimistic);

    if (demoMode) {
      saveDemoProfile(optimistic);
      return optimistic;
    }

    try {
      const updated = await databases.updateDocument(
        APPWRITE_DB,
        COLLECTIONS.profiles,
        doc.$id,
        { total_points: newTotal },
      );
      const synced = updated.total_points ?? newTotal;
      pointsRef.current = synced;
      profileDocRef.current = updated;
      setProfile(updated);
      return updated;
    } catch (err) {
      pointsRef.current = before;
      profileDocRef.current = doc;
      setProfile(doc);
      throw err;
    }
  }, [demoMode]);

  const updatePoints = async (newTotal) => {
    const doc = profileDocRef.current;
    if (!doc) return null;
    const delta = newTotal - pointsRef.current;
    return addPoints(delta);
  };

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return isAdminEmail(user.email, getClientAdminAllowlist());
  }, [user?.email]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      error,
      setError,
      demoMode,
      isAdmin,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      updatePoints,
      addPoints,
      isAuthenticated: Boolean(user),
    }),
    [user, profile, loading, error, demoMode, isAdmin, refreshProfile, updatePoints, addPoints],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
