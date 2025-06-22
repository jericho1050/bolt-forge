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
    // Only redirect if we have both user and profile, and auth is fully initialized
    if (isInitialized && !isLoading && user && profile) {
      console.log('✅ User authenticated with profile, redirecting to dashboard...');
      navigate({ to: '/dashboard', replace: true });
    }
  }, [user, profile, isLoading, isInitialized, navigate]);

  // Show loading while initializing auth
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  // Show landing page if not authenticated
  return <LandingPage onSignIn={() => {}} onNavigate={() => {}} />;
}