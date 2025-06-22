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
    console.log('📊 Dashboard route - Auth state:', {
      isInitialized,
      isLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      error,
    });

    // Only redirect if auth is fully initialized and there's no user
    if (isInitialized && !isLoading && !user) {
      console.log('❌ No authenticated user on dashboard, redirecting to home...');
      navigate({ to: '/' });
    }
  }, [user, isLoading, isInitialized, navigate]);

  // Show loading while auth is initializing or loading
  if (!isInitialized || isLoading) {
    console.log('🔄 Dashboard loading - isInitialized:', isInitialized, 'isLoading:', isLoading);
    return <LoadingScreen />;
  }

  // Show error screen if there's an auth error
  if (error) {
    console.log('❌ Dashboard error:', error);
    return <ErrorScreen error={error} onRetry={refreshAuth} />;
  }

  // Redirect to home if no user (this will be handled by useEffect)
  if (!user) {
    console.log('❌ No user on dashboard, will redirect to home');
    return <LoadingScreen />;
  }

  // Show dashboard
  console.log('✅ Showing dashboard for user:', user.email);
  return <Dashboard userType={profile?.user_type ?? 'developer'} />;
}