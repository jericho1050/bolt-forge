import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import Profile from '../components/Profile';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { useEffect } from 'react';

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
});

function ProfileComponent() {
  const { user, profile, isLoading, error, refreshAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/' });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={refreshAuth} />;
  if (!user) return null;
  return <Profile userType={profile?.user_type ?? 'developer'} onNavigate={() => {}} />;
} 