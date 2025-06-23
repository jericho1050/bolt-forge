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

// OAuth Providers
export const OAUTH_PROVIDERS = {
  GITHUB: 'github',
  GOOGLE: 'google',
} as const;

// OAuth Configuration Helper
export const getOAuthConfig = () => {
  const baseUrl = window.location.origin;
  
  return {
    success: `${baseUrl}/`,
    failure: `${baseUrl}/?error=oauth_failed`,
    scopes: {
      github: ['user:email', 'read:user'],
      google: ['email', 'profile'],
    }
  };
};

// Helper function to map OAuth user data to profile data
export const mapOAuthUserToProfile = (user: any, provider: string) => {
  const baseProfile = {
    user_id: user.$id,
    full_name: user.name || '',
    user_type: 'developer' as const, // Default to developer, can be changed later
  };

  // Provider-specific mappings
  switch (provider) {
    case 'github':
      return {
        ...baseProfile,
        github_username: user.prefs?.login || '',
        website: user.prefs?.blog || '',
        bio: user.prefs?.bio || '',
        location: user.prefs?.location || '',
      };
    
    case 'google':
      return {
        ...baseProfile,
        avatar_url: user.prefs?.picture || '',
        // Google doesn't provide username, so we'll generate one from email
      };
    
    default:
      return baseProfile;
  }
};