import React, { createContext, useContext, useEffect, useState } from 'react';
import { Models, Query, Permission, Role, ID } from 'appwrite';
import { account, databases, DATABASE_ID, COLLECTION_IDS } from '../lib/appwrite';
import { Profile, ProfileInsert } from '../lib/database/appwrite-types';
import { OAuthProvider, SignInFormData, SignUpFormData } from '../lib/validations/auth';

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  // Auth operations
  signIn: (data: SignInFormData) => Promise<void>;
  signUp: (data: SignUpFormData) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string, oldPassword: string) => Promise<void>;
  
  // Profile operations
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  
  // Utility functions
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Helper function to retry operations with exponential backoff
  const retryWithBackoff = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // If it's not a network error or we've exhausted retries, throw immediately
        if (!isNetworkError(error) || attempt === maxRetries) {
          throw error;
        }
        
        // Wait with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };

  // Helper function to detect network-related errors
  const isNetworkError = (error: any): boolean => {
    if (!error) return false;
    
    const errorMessage = error.message?.toLowerCase() || '';
    const errorType = error.name?.toLowerCase() || '';
    
    return (
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('network error') ||
      errorMessage.includes('network request failed') ||
      errorMessage.includes('connection') ||
      errorType === 'typeerror' ||
      error.code === 0 || // Network error code
      !navigator.onLine // Browser is offline
    );
  };

  // Check if there's a valid session without trying to delete invalid ones
  const checkSession = async () => {
    try {
      // Use retry mechanism for network resilience
      const user = await retryWithBackoff(async () => {
        return await account.get();
      });
      return user;
    } catch (err) {
      // If it's a network error after retries, don't clear the session
      if (isNetworkError(err)) {
        console.warn('Network error while checking session after retries, retaining current state:', err);
        // Return null but don't clear existing session data
        throw new Error('Network connection error after retries');
      }
      
      // Session is invalid or doesn't exist
      console.log('Session is invalid or expired:', err);
      return null;
    }
  };

  // Validate session and fetch user data
  const validateSession = async () => {
    try {
      // First try to get the current session
      const session = await account.getSession('current');
      
      if (!session) {
        throw new Error('No active session');
      }

      // Then get the user data
      const user = await account.get();
      return user;
    } catch (err) {
      // If session is invalid, try to delete it but don't fail if deletion fails
      try {
        await account.deleteSession('current');
      } catch (deleteErr) {
        // Silently handle deletion errors - this is expected for invalid sessions
        console.warn('Could not delete invalid session (this is normal):', deleteErr);
      }
      throw err;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Use the safer checkSession method that doesn't try to delete invalid sessions
        const user = await checkSession();
        
        if (!mounted) return;
        
        setState(prev => ({ ...prev, user }));
        
        if (user) {
          await fetchProfile(user.$id);
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.log('Auth initialization error:', err);
        if (mounted) {
          // If it's a network error, keep the loading state or set a more specific error
          if (isNetworkError(err)) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              error: 'Network connection error. Please check your internet connection.',
            }));
          } else {
            setState({
              user: null,
              profile: null,
              isLoading: false,
              error: null, // Don't set error for initial load unless it's network-related
            });
          }
        }
      }
    };

    initializeAuth();
    return () => { mounted = false; };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // First check the session is still good using the safer method
      const user = await checkSession();
      if (!user) {
        throw new Error('Session is no longer valid');
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.PROFILES,
        [Query.equal('user_id', userId)]
      );

      if (response.documents.length > 0) {
        setState(prev => ({
          ...prev,
          profile: response.documents[0] as Profile,
          isLoading: false,
        }));
      } else {
        // Auto-create profile for OAuth users
        const currentUser = await account.get();
        const profileData: ProfileInsert = {
          user_id: currentUser.$id,
          full_name: currentUser.name || 'New User',
          user_type: 'developer',
        };
        
        const newProfile = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_IDS.PROFILES,
          ID.unique(), // Use ID.unique() instead of 'unique()'
          profileData,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(currentUser.$id)),
            Permission.delete(Role.user(currentUser.$id)),
          ]
        );
        
        setState(prev => ({
          ...prev,
          profile: newProfile as Profile,
          isLoading: false,
        }));
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      
      // Handle network errors differently
      if (isNetworkError(err)) {
        setState(prev => ({
          ...prev,
          error: 'Network connection error. Please check your internet connection.',
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to fetch profile',
          isLoading: false,
        }));
      }
    }
  };

  const signIn = async (data: SignInFormData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Delete any existing sessions first (ignore errors)
      try {
        await account.deleteSession('current');
      } catch (err) {
        // Ignore errors from deleting non-existent or invalid sessions
        console.warn('Could not delete existing session (this is normal):', err);
      }
      
      // Create new session
      await account.createEmailPasswordSession(data.emailOrUsername, data.password);
      
      // Validate the new session
      const user = await validateSession();
      
      setState(prev => ({ ...prev, user }));
      await fetchProfile(user.$id);
    } catch (err) {
      console.error('Sign in error:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Sign in failed',
        isLoading: false,
      }));
      throw err;
    }
  };

  const signUp = async (data: SignUpFormData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Create user account
      const user = await account.create(ID.unique(), data.email, data.password);
      
      // Delete any existing sessions (ignore errors)
      try {
        await account.deleteSession('current');
      } catch (err) {
        // Ignore errors from deleting non-existent or invalid sessions
        console.warn('Could not delete existing session (this is normal):', err);
      }
      
      // Create new session
      await account.createEmailPasswordSession(data.email, data.password);
      
      // Validate the new session
      const authenticatedUser = await validateSession();
      
      // Create profile
      const profileData: ProfileInsert = {
        user_id: authenticatedUser.$id,
        full_name: data.fullName || '',
        user_type: data.userType,
        company_name: data.companyName,
        location: data.location,
        phone: data.phone,
      };
      
      const profile = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.PROFILES,
        ID.unique(),
        profileData,
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(authenticatedUser.$id)),
          Permission.delete(Role.user(authenticatedUser.$id)),
        ]
      );

      setState({
        user: authenticatedUser,
        profile: profile as Profile,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Sign up error:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Sign up failed',
        isLoading: false,
      }));
      throw err;
    }
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await account.createOAuth2Session(
        provider,
        `${window.location.origin}/`,
        `${window.location.origin}/?error=oauth_failed`
      );
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'OAuth sign in failed',
        isLoading: false,
      }));
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await account.deleteSession('current');
      
      setState({
        user: null,
        profile: null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Sign out failed',
        isLoading: false,
      }));
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user || !state.profile) {
      throw new Error('No user logged in');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.PROFILES,
        state.profile.$id,
        updates
      );

      setState(prev => ({
        ...prev,
        profile: updatedProfile as Profile,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Profile update failed',
        isLoading: false,
      }));
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      await account.createRecovery(
        email,
        `${window.location.origin}/auth/reset-password`
      );
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Password reset failed',
      }));
      throw err;
    }
  };

  const updatePassword = async (newPassword: string, oldPassword: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      await account.updatePassword(newPassword, oldPassword);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Password update failed',
      }));
      throw err;
    }
  };

  const refreshAuth = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check session and get user using the safer method
      const user = await checkSession();
      setState(prev => ({ ...prev, user }));
      
      if (user) {
        await fetchProfile(user.$id);
      } else {
        setState(prev => ({
          ...prev,
          profile: null,
          isLoading: false,
        }));
      }
    } catch (err) {
      console.error('Auth refresh error:', err);
      
      // Handle network errors vs auth errors differently
      if (isNetworkError(err)) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Network connection error. Please check your internet connection.',
        }));
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Auth refresh failed',
        });
      }
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}