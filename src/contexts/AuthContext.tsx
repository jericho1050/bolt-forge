import React, { createContext, useContext, useEffect, useState } from 'react';
import { Models, Query, Permission, Role, ID, OAuthProvider } from 'appwrite';
import { account, databases, DATABASE_ID, COLLECTION_IDS } from '../lib/appwrite';
import { Profile, ProfileInsert } from '../lib/database/appwrite-types';
import { SignInFormData, SignUpFormData } from '../lib/validations/auth';

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  // Auth operations
  signIn: (data: SignInFormData) => Promise<void>;
  signUp: (data: SignUpFormData) => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
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
    isInitialized: false,
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

  // Get current URL for OAuth redirects
  const getOAuthUrls = () => {
    const baseUrl = window.location.origin;
    return {
      success: `${baseUrl}/`,
      failure: `${baseUrl}/?error=oauth_failed`
    };
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

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        
        // Check for OAuth callback in URL
        const urlParams = new URLSearchParams(window.location.search);
        const oauthError = urlParams.get('error');
        
        if (oauthError === 'oauth_failed') {
          console.log('❌ OAuth authentication failed');
          if (mounted) {
            setState(prev => ({
              ...prev,
              error: 'OAuth authentication failed. Please try again.',
              isLoading: false,
              isInitialized: true,
            }));
          }
          // Clear the error parameter from URL
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }
        
        // Use the safer checkSession method that doesn't try to delete invalid sessions
        const user = await checkSession();
        
        if (!mounted) return;
        
        setState(prev => ({ ...prev, user, isInitialized: true }));
        
        if (user) {
          console.log('✅ User session found, fetching profile...');
          await fetchProfile(user.$id);
        } else {
          console.log('ℹ️ No active session found');
          setState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
        }
      } catch (err) {
        console.log('Auth initialization error:', err);
        if (mounted) {
          // If it's a network error, keep the loading state or set a more specific error
          if (isNetworkError(err)) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              isInitialized: true,
              error: 'Network connection error. Please check your internet connection.',
            }));
          } else {
            setState({
              user: null,
              profile: null,
              isLoading: false,
              error: null,
              isInitialized: true,
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
        console.log('✅ Profile found and loaded');
        setState(prev => ({
          ...prev,
          profile: response.documents[0] as Profile,
          isLoading: false,
        }));
      } else {
        console.log('ℹ️ No profile found, creating basic profile...');
        // Auto-create profile for new users
        const currentUser = await account.get();
        const profileData: ProfileInsert = {
          user_id: currentUser.$id,
          full_name: currentUser.name || 'New User',
          user_type: 'developer',
        };
        
        const newProfile = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_IDS.PROFILES,
          ID.unique(),
          profileData,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(currentUser.$id)),
            Permission.delete(Role.user(currentUser.$id)),
          ]
        );
        
        console.log('✅ Basic profile created');
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
      console.log('🔄 Starting sign in process...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Delete any existing sessions first (ignore errors)
      try {
        await account.deleteSession('current');
      } catch (err) {
        console.warn('Could not delete existing session (this is normal):', err);
      }
      
      // Create new session
      console.log('🔄 Creating session for:', data.emailOrUsername);
      await account.createEmailPasswordSession(data.emailOrUsername, data.password);
      
      // Get user data
      const user = await account.get();
      console.log('✅ Sign in successful, user:', user.email);
      
      setState(prev => ({ ...prev, user }));
      await fetchProfile(user.$id);
      
      console.log('🎯 Sign in complete - redirect should happen now');
    } catch (err) {
      console.error('❌ Sign in error:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Sign in failed',
        isLoading: false,
      }));
      throw err;
    }
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    try {
      console.log(`🔄 Starting OAuth sign in with ${provider}...`);
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get dynamic URLs for OAuth redirect
      const { success, failure } = getOAuthUrls();
      
      console.log(`🔄 OAuth URLs - Success: ${success}, Failure: ${failure}`);
      
      // Delete any existing sessions first (ignore errors)
      try {
        await account.deleteSession('current');
      } catch (err) {
        console.warn('Could not delete existing session (this is normal):', err);
      }
      
      // Initiate OAuth flow - this will redirect to the provider
      console.log(`🔄 Initiating ${provider} OAuth flow...`);
      await account.createOAuth2Session(
        provider,
        success,
        failure
      );
      
      // Note: The user will be redirected to the OAuth provider
      // When they return, the app will re-initialize and detect the session
      
    } catch (err) {
      console.error(`❌ OAuth sign in error with ${provider}:`, err);
      setState(prev => ({
        ...prev,
        error: `OAuth authentication with ${provider} failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        isLoading: false,
      }));
      throw err;
    }
  };

  const signUp = async (data: SignUpFormData) => {
    try {
      console.log('🔄 Starting sign up process...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Create user account
      const user = await account.create(ID.unique(), data.email, data.password, data.fullName);
      console.log('✅ User account created:', user.email);
      
      // Delete any existing sessions (ignore errors)
      try {
        await account.deleteSession('current');
      } catch (err) {
        console.warn('Could not delete existing session (this is normal):', err);
      }
      
      // Create new session
      console.log('🔄 Creating session after registration');
      await account.createEmailPasswordSession(data.email, data.password);
      
      // Get authenticated user
      const authenticatedUser = await account.get();
      console.log('✅ User authenticated after registration');
      
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

      console.log('✅ Profile created successfully');

      setState({
        user: authenticatedUser,
        profile: profile as Profile,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
      
      console.log('🎯 Sign up complete - redirect should happen now');
    } catch (err) {
      console.error('❌ Sign up error:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Sign up failed',
        isLoading: false,
      }));
      throw err;
    }
  };

  const signOut = async () => {
    try {
      console.log('🔄 Starting sign out process...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Clear all authentication data
      try {
        // Delete the current session from Appwrite
        await account.deleteSession('current');
        console.log('✅ Appwrite session deleted successfully');
      } catch (sessionError) {
        // Log the error but don't fail the sign-out process
        console.warn('⚠️ Could not delete Appwrite session (session may already be invalid):', sessionError);
      }
      
      // Clear any cached data (localStorage, sessionStorage, etc.)
      try {
        // Clear any auth-related localStorage items
        const authKeys = Object.keys(localStorage).filter(key => 
          key.includes('auth') || 
          key.includes('user') || 
          key.includes('session') ||
          key.includes('token')
        );
        authKeys.forEach(key => localStorage.removeItem(key));
        
        // Clear any auth-related sessionStorage items
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
          key.includes('auth') || 
          key.includes('user') || 
          key.includes('session') ||
          key.includes('token')
        );
        sessionKeys.forEach(key => sessionStorage.removeItem(key));
        
        console.log('✅ Local storage and session storage cleared');
      } catch (storageError) {
        console.warn('⚠️ Could not clear some cached data:', storageError);
      }
      
      // Clear the auth state
      setState({
        user: null,
        profile: null,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
      
      console.log('✅ Sign out completed successfully - user will be redirected to homepage');
      
    } catch (err) {
      console.error('❌ Sign out error:', err);
      
      // Even if there's an error, still clear the local state
      // This ensures the user isn't stuck in a signed-in state
      setState({
        user: null,
        profile: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sign out encountered an issue, but you have been logged out locally',
        isInitialized: true,
      });
      
      // Don't throw the error - we want sign out to always succeed locally
      console.log('⚠️ Sign out completed with warnings - user state cleared locally');
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
          isInitialized: true,
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
          isInitialized: true,
        }));
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Auth refresh failed',
          isInitialized: true,
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
    signInWithOAuth,
    signOut,
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