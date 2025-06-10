import { Client, Account, Databases, Storage, Teams } from 'appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
  throw new Error('Missing required Appwrite environment variables');
}

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

// Database and collection IDs
export const DATABASE_ID = 'bolt-forge-db';

export const COLLECTION_IDS = {
  PROFILES: 'profiles',
  SKILLS: 'skills',
  USER_SKILLS: 'user_skills',
  PROJECTS: 'projects',
  PROJECT_TAGS: 'project_tags',
  APPLICATIONS: 'applications',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  BADGES: 'badges',
  USER_BADGES: 'user_badges',
  REVIEWS: 'reviews',
} as const;

// Storage bucket IDs
export const BUCKET_IDS = {
  AVATARS: 'avatars',
  PROJECT_FILES: 'project_files',
  MESSAGE_FILES: 'message_files',
} as const;
