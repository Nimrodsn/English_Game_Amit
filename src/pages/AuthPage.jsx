import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { signIn, signUp, isAuthenticated, loading, setError, demoMode } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setLocalError('Pick a fun username!');
          return;
        }
        await signUp(email, password, username.trim());
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch (err) {
      const msg = err?.message || 'Something went wrong. Try again!';
      setLocalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center overflow-x-hidden px-4 py-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-pastel shadow-lg">
          <Sparkles className="h-8 w-8 text-purple-dark" />
        </div>
        <h1 className="text-3xl font-extrabold text-purple-dark">English Explorers</h1>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          Learn words. Earn stars. Be awesome!
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur"
      >
        <div className="mb-4 flex rounded-2xl bg-peach-pastel/40 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-xl py-3 text-sm font-extrabold transition ${
              mode === 'login' ? 'bg-white shadow text-purple-dark' : 'text-slate-600'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-xl py-3 text-sm font-extrabold transition ${
              mode === 'signup' ? 'bg-white shadow text-purple-dark' : 'text-slate-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signup' && (
          <label className="mb-3 block">
            <span className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
              <User className="h-4 w-4" /> Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border-2 border-purple-pastel bg-white px-4 py-3 text-base font-semibold outline-none focus:border-purple-dark"
              placeholder="SuperReader"
              maxLength={24}
            />
          </label>
        )}

        <label className="mb-3 block">
          <span className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
            <Mail className="h-4 w-4" /> Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border-2 border-purple-pastel bg-white px-4 py-3 text-base font-semibold outline-none focus:border-purple-dark"
            placeholder="you@email.com"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
            <Lock className="h-4 w-4" /> Password
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border-2 border-purple-pastel bg-white px-4 py-3 text-base font-semibold outline-none focus:border-purple-dark"
            placeholder="••••••••"
          />
        </label>

        {localError && (
          <p className="mb-3 rounded-xl bg-red-100 px-3 py-2 text-center text-sm font-bold text-red-700">
            {localError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-14 rounded-2xl bg-gradient-to-r from-lime-pastel via-purple-pastel to-peach-pastel text-lg font-extrabold text-slate-900 shadow-md transition active:scale-95 disabled:opacity-60"
        >
          {submitting ? 'Please wait...' : mode === 'signup' ? 'Start Exploring!' : 'Let\'s Go!'}
        </button>

        {demoMode && mode === 'login' && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Demo mode: sign up once, then log in with any email/password.
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Made for kids learning English · Ages 9+
      </p>
    </div>
  );
}
