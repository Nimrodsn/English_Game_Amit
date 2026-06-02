import { getServerAdminAllowlist, isAdminEmail } from '../src/lib/admin.js';

const MAX_POINTS = 99999;

function getAppwriteConfig() {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID;
  const profilesCollectionId =
    process.env.APPWRITE_PROFILES_COLLECTION_ID ||
    process.env.VITE_APPWRITE_PROFILES_COLLECTION_ID;

  return { endpoint, projectId, apiKey, databaseId, profilesCollectionId };
}

async function getAccountEmail(endpoint, projectId, jwt) {
  const res = await fetch(`${endpoint}/account`, {
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-JWT': jwt,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Invalid session');
  }

  const account = await res.json();
  return account.email;
}

async function updateProfileScore(config, profileDocumentId, totalPoints) {
  const url = `${config.endpoint}/databases/${config.databaseId}/collections/${config.profilesCollectionId}/documents/${profileDocumentId}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': config.projectId,
      'X-Appwrite-Key': config.apiKey,
    },
    body: JSON.stringify({ total_points: totalPoints }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Profile update failed');
  }

  return res.json();
}

export async function handleAdminUpdateScore(body) {
  const { jwt, profileDocumentId, total_points: totalPointsRaw } = body || {};

  if (!jwt || !profileDocumentId) {
    return { status: 400, body: { error: 'Missing jwt or profileDocumentId' } };
  }

  const totalPoints = Number(totalPointsRaw);
  if (!Number.isInteger(totalPoints) || totalPoints < 0 || totalPoints > MAX_POINTS) {
    return { status: 400, body: { error: 'total_points must be an integer from 0 to 99999' } };
  }

  const config = getAppwriteConfig();
  if (
    !config.endpoint ||
    !config.projectId ||
    !config.apiKey ||
    !config.databaseId ||
    !config.profilesCollectionId
  ) {
    return { status: 503, body: { error: 'Appwrite admin API not configured' } };
  }

  const allowlist = getServerAdminAllowlist();

  try {
    const email = await getAccountEmail(config.endpoint, config.projectId, jwt);
    if (!isAdminEmail(email, allowlist)) {
      return { status: 403, body: { error: 'Admin access required' } };
    }

    const updated = await updateProfileScore(config, profileDocumentId, totalPoints);
    return { status: 200, body: updated };
  } catch (err) {
    console.error('[admin-update-score]', err);
    return { status: 502, body: { error: 'Failed to update score' } };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const result = await handleAdminUpdateScore(body);
  return res.status(result.status).json(result.body);
}
