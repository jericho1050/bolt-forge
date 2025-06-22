import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../components/LandingPage';
import LoadingScreen from '../components/LoadingScreen';
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const { user, profile, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏠 Index route - Auth state:', {
      isInitialized,
      isLoading,
      hasUser: !!user,
      hasProfile: !!profile,
    });

    // Only redirect if we have both user and profile, and auth is fully initialized
    if (isInitialized && !isLoading && user && profile) {
      console.log('✅ User authenticated with profile, redirecting to dashboard...');
      console.log('🎯 Executing navigation to /dashboard');
      
      // Use setTimeout to ensure the navigation happens after the current render cycle
      setTimeout(() => {
        navigate({ to: '/dashboard', replace: true });
      }, 0);
    }
  }, [user, profile, isLoading, isInitialized, navigate]);

  // Show loading while initializing auth
  if (!isInitialized || isLoading) {
    console.log('🔄 Showing loading screen - isInitialized:', isInitialized, 'isLoading:', isLoading);
    return <LoadingScreen />;
  }

  // Show landing page if not authenticated
  console.log('🏠 Showing landing page - no authenticated user');
  return <LandingPage onSignIn={() => {}} onNavigate={() => {}} />;
}