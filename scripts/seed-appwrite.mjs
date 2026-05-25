/**
 * Seed vocabulary_puzzles from JSON via Appwrite API (alternative to CSV import).
 *
 * Usage:
 *   node scripts/seed-appwrite.mjs
 *
 * Requires in .env (or environment):
 *   APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY (from Appwrite API keys),
 *   APPWRITE_DATABASE_ID, APPWRITE_PUZZLES_COLLECTION_ID
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client, Databases, ID } from 'appwrite';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  try {
    const envPath = resolve(__dirname, '../.env');
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* no .env */
  }
}

loadEnvFile();

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID;
const collectionId =
  process.env.APPWRITE_PUZZLES_COLLECTION_ID || process.env.VITE_APPWRITE_PUZZLES_COLLECTION_ID;

if (!endpoint || !projectId || !apiKey || !databaseId || !collectionId) {
  console.error(
    'Missing env vars. Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY,\n' +
      'APPWRITE_DATABASE_ID, APPWRITE_PUZZLES_COLLECTION_ID in .env',
  );
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

const puzzles = JSON.parse(
  readFileSync(resolve(__dirname, 'seed-puzzles.json'), 'utf8'),
);

for (const puzzle of puzzles) {
  const doc = await databases.createDocument(databaseId, collectionId, ID.unique(), {
    word: puzzle.word,
    translation: puzzle.translation,
    options: puzzle.options,
    category: puzzle.category,
    image_url: puzzle.image_url || '',
  });
  console.log(`Created: ${doc.word} (${doc.$id})`);
}

console.log(`Done — ${puzzles.length} puzzles seeded.`);
