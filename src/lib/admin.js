export const DEFAULT_ADMIN_EMAIL = 'nimrodsnapir@gmail.com';
export const AUTH_EMAIL_KEY = 'english_game_auth_email';

export function parseAdminEmails(envString) {
  const raw = envString || DEFAULT_ADMIN_EMAIL;
  const allowlist = new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
  allowlist.add(DEFAULT_ADMIN_EMAIL.toLowerCase());
  return allowlist;
}

export function isAdminEmail(email, allowlist) {
  if (!email || !allowlist?.size) return false;
  return allowlist.has(String(email).trim().toLowerCase());
}

export function storeAuthEmail(email) {
  if (!email || typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(AUTH_EMAIL_KEY, String(email).trim().toLowerCase());
}

export function getAuthEmail(user) {
  if (user?.email) return String(user.email).trim().toLowerCase();
  if (typeof sessionStorage === 'undefined') return '';
  return sessionStorage.getItem(AUTH_EMAIL_KEY) || '';
}

export function clearAuthEmail() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(AUTH_EMAIL_KEY);
}

export function getClientAdminAllowlist() {
  return parseAdminEmails(import.meta.env.VITE_ADMIN_EMAILS);
}

export function getServerAdminAllowlist() {
  return parseAdminEmails(
    process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS,
  );
}
