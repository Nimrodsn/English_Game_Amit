const DEFAULT_ADMIN_EMAIL = 'nimrodsnapir@gmail.com';

export function parseAdminEmails(envString) {
  const raw = envString || DEFAULT_ADMIN_EMAIL;
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email, allowlist) {
  if (!email || !allowlist?.size) return false;
  return allowlist.has(String(email).trim().toLowerCase());
}

export function getClientAdminAllowlist() {
  return parseAdminEmails(import.meta.env.VITE_ADMIN_EMAILS);
}

export function getServerAdminAllowlist() {
  return parseAdminEmails(
    process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS,
  );
}
