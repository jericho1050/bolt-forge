import { useState, useEffect } from 'react';
import { Models, Query, Permission, Role } from 'appwrite';
import { account, databases, DATABASE_ID, COLLECTION_IDS } from '../lib/appwrite';
import { Profile, ProfileInsert } from '../lib/database/appwrite-types';

export function useAuth() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing Appwrite auth...');
        
        // Get current user session
        const user = await account.get();
        
        if (!mounted) return;

        console.log('✅ User session retrieved:', user ? 'Found' : 'None');
        setUser(user);
        
        if (user) {
          // For new users landing on homepage, auto-create profile if missing
          await fetchProfile(user.$id, true);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.log('ℹ️ No active session');
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchProfile = async (userId: string, createIfMissing: boolean = false) => {
    try {
      console.log('🔄 Fetching profile for user:', userId);
      setLoading(true);
      
      // Try to find profile by user_id using correct Appwrite Query syntax
      const response = await databases.listDocuments(
        DATABASE_ID, 
        COLLECTION_IDS.PROFILES, 
        [Query.equal('user_id', userId)]
      );

      if (response.documents.length > 0) {
        console.log('✅ Profile fetched successfully');
        setProfile(response.documents[0] as Profile);
      } else {
        console.log('ℹ️ No profile found - new user');
        
        if (createIfMissing) {
          console.log('🔄 Creating basic profile for new user...');
          const currentUser = await account.get();
          
          const profileData: ProfileInsert = {
            user_id: currentUser.$id,
            full_name: currentUser.name || 'New User',
            user_type: 'developer', // Default to developer, user can change later
          };
          
          const newProfile = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_IDS.PROFILES,
            'unique()', // Or currentUser.$id if you prefer
            profileData,
            [
              Permission.read(Role.any()), // Or Role.users() if profiles are not public
              Permission.update(Role.user(currentUser.$id)),
              Permission.delete(Role.user(currentUser.$id)),
            ]
          );
          
          console.log('✅ Basic profile created for new user with permissions');
          setProfile(newProfile as Profile);
        } else {
          setProfile(null);
        }
      }
    } catch (err) {
      console.error('❌ Profile fetch exception:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      
      setUser(user);
      await fetchProfile(user.$id);
      
      return { data: { user, session }, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setError(error.message);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<ProfileInsert>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user account
      const user = await account.create('unique()', email, password);
      
      // Create email session
      await account.createEmailPasswordSession(email, password);
      
      // Get the authenticated user
      const authenticatedUser = await account.get();
      
      // Create profile
      const profileData: ProfileInsert = {
        user_id: authenticatedUser.$id,
        full_name: userData.full_name || '',
        user_type: userData.user_type || 'developer',
        ...userData,
      };
      
      const profile = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.PROFILES,
        'unique()', // Or authenticatedUser.$id if you prefer
        profileData,
        [
          Permission.read(Role.any()), // Or Role.users() if profiles are not public
          Permission.update(Role.user(authenticatedUser.$id)),
          Permission.delete(Role.user(authenticatedUser.$id)),
        ]
      );

      setUser(authenticatedUser);
      setProfile(profile as Profile);
      setLoading(false);

      return { data: { user: authenticatedUser, profile }, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setError(error.message);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await account.deleteSession('current');
      
      setUser(null);
      setProfile(null);
      
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed');
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: new Error('No user logged in') };

    try {
      setError(null);
      
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.PROFILES,
        profile.$id,
        updates
      );

      setProfile(updatedProfile as Profile);
      return { data: updatedProfile, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Profile update failed');
      setError(error.message);
      return { data: null, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      
      await account.createRecovery(
        email,
        `${window.location.origin}/auth/reset-password`
      );
      
      return { data: { message: 'Recovery email sent' }, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Password reset failed');
      setError(error.message);
      return { data: null, error };
    }
  };

  const updatePassword = async (password: string, oldPassword: string) => {
    try {
      setError(null);
      
      await account.updatePassword(password, oldPassword);
      
      return { data: { message: 'Password updated' }, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Password update failed');
      setError(error.message);
      return { data: null, error };
    }
  };

  // Force refresh auth state (for debugging)
  const refreshAuth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await account.get();
      setUser(user);
      
      if (user) {
        await fetchProfile(user.$id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    refreshAuth, // For debugging
  };
}