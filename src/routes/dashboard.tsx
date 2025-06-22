import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/Dashboard';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { useEffect } from 'react';

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
});

function DashboardComponent() {
  const { user, profile, isLoading, error, refreshAuth, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if auth is fully initialized and there's no user
    if (isInitialized && !isLoading && !user) {
      console.log('❌ No authenticated user, redirecting to home...');
      navigate({ to: '/' });
    }
  }, [user, isLoading, isInitialized, navigate]);

  // Show loading while auth is initializing or loading
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen if there's an auth error
  if (error) {
    return <ErrorScreen error={error} onRetry={refreshAuth} />;
  }

  // Redirect to home if no user (this will be handled by useEffect)
  if (!user) {
    return <LoadingScreen />;
  }

  // Show dashboard
  return <Dashboard userType={profile?.user_type ?? 'developer'} />;
}