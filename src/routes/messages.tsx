import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import Messages from '../components/Messages';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { useEffect } from 'react';

export const Route = createFileRoute('/messages')({
  component: MessagesComponent,
});

function MessagesComponent() {
  const { user, isLoading, error, refreshAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/' });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={refreshAuth} />;
  if (!user) return null;
  return <Messages onNavigate={() => {}} />;
} 