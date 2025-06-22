import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../components/LandingPage';
import LoadingScreen from '../components/LoadingScreen';
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && profile) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [user, profile, isLoading, navigate]);

  if (isLoading) return <LoadingScreen />;
  return <LandingPage onSignIn={() => {}} onNavigate={() => {}} />;
} 