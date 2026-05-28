import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Trophy, LogOut, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/game', icon: Gamepad2, label: 'Play' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaders' },
];

export default function Layout({ children, showNav = true }) {
  const { pathname } = useLocation();
  const { profile, signOut, demoMode } = useAuth();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden px-4 pb-24 pt-4">
      {demoMode && (
        <div className="mb-3 rounded-2xl bg-amber-100 px-3 py-2 text-center text-xs font-bold text-amber-800">
          Demo mode — add Appwrite keys in .env to go live
        </div>
      )}

      {profile && (
        <div className="mb-2 flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 shadow-sm backdrop-blur">
          <span className="truncate text-sm font-bold text-purple-dark">
            Hi, {profile.username}!
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-lime-pastel px-3 py-1 text-sm font-extrabold text-lime-900">
            <Star className="h-4 w-4 fill-current" />
            {profile.total_points ?? 0}
          </span>
        </div>
      )}

      <main className="flex-1">{children}</main>

      {showNav && (
        <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 items-center justify-around gap-1 rounded-t-3xl border-t border-white/50 bg-white/90 px-2 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname === to || (to === '/' && pathname.startsWith('/game'));
            return (
              <Link
                key={to}
                to={to}
                className={`flex min-h-12 min-w-16 flex-col items-center justify-center rounded-2xl px-2 text-xs font-bold transition active:scale-95 ${
                  active
                    ? 'bg-purple-pastel text-purple-900'
                    : 'text-slate-500 hover:bg-peach-pastel/50'
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => signOut()}
            className="flex min-h-12 min-w-16 flex-col items-center justify-center rounded-2xl px-2 text-xs font-bold text-slate-500 transition active:scale-95 hover:bg-red-100 hover:text-red-600"
          >
            <LogOut className="h-6 w-6" />
            Exit
          </button>
        </nav>
      )}
    </div>
  );
}
