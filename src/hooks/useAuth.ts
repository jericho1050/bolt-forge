import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';
import { OAuthProvider } from '../lib/validations/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (!mounted) return;

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }

        console.log('✅ Session retrieved:', session ? 'Found' : 'None');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session ? 'User present' : 'No user');
        
        if (!mounted) return;

        try {
          setUser(session?.user ?? null);
          setError(null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
            setLoading(false);
          }
        } catch (err) {
          console.error('❌ Auth state change error:', err);
          if (mounted) {
            setError(err instanceof Error ? err.message : 'Authentication state error');
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔄 Fetching profile for user:', userId);
      setLoading(true);
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      );

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('❌ Profile fetch error:', error);
        
        // If profile doesn't exist, that's not necessarily an error for new users
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No profile found - new user');
          setProfile(null);
        } else {
          setError(error.message);
        }
      } else {
        console.log('✅ Profile fetched successfully');
        setProfile(data);
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { data, error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setError(error.message);
      return { data: null, error };
    } finally {
      // Don't set loading to false here - let auth state change handle it
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (data.user && !error) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              ...userData,
            },
          ]);

        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
          setError(profileError.message);
          return { data, error: profileError };
        }
      }

      if (error) {
        setError(error.message);
      }

      return { data, error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setError(error.message);
      return { data: null, error };
    } finally {
      // Don't set loading to false here - let auth state change handle it
    }
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      
      return { data, error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('OAuth sign in failed');
      setError(error.message);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
      } else {
        setUser(null);
        setProfile(null);
      }
      
      return { error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed');
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
      } else if (error) {
        setError(error.message);
      }

      return { data, error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Profile update failed');
      setError(error.message);
      return { data: null, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { data, error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Password reset failed');
      setError(error.message);
      return { data: null, error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { data, error };
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
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
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
    signInWithOAuth,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    refreshAuth, // For debugging
  };
}