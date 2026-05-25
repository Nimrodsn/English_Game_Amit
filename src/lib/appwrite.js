import { Client, Account, Databases, ID, Query, Permission, Role } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client = new Client();

if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);

export const APPWRITE_DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;

export const COLLECTIONS = {
  profiles: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID,
  puzzles: import.meta.env.VITE_APPWRITE_PUZZLES_COLLECTION_ID,
  progress: import.meta.env.VITE_APPWRITE_PROGRESS_COLLECTION_ID,
};

export function isAppwriteConfigured() {
  return Boolean(
    endpoint &&
      projectId &&
      APPWRITE_DB &&
      COLLECTIONS.profiles &&
      COLLECTIONS.puzzles &&
      COLLECTIONS.progress,
  );
}

/** Appwrite Cloud allows read, update, delete, write — not legacy "create". */
export function profilePermissions(userId) {
  return [
    Permission.read(Role.any()),
    Permission.write(Role.user(userId)),
  ];
}

export function progressPermissions(userId) {
  return [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
  ];
}

export { ID, Query, Permission, Role, client };
