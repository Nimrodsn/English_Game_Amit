import { account, isAppwriteConfigured } from '../lib/appwrite';

export async function getSessionJwt() {
  if (!isAppwriteConfigured()) {
    throw new Error('Appwrite is not configured');
  }
  const session = await account.createJWT();
  return session.jwt;
}

export async function adminUpdateScore(profileDocumentId, totalPoints) {
  const jwt = await getSessionJwt();
  const res = await fetch('/api/admin-update-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jwt,
      profileDocumentId,
      total_points: totalPoints,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update score');
  }
  return data;
}
