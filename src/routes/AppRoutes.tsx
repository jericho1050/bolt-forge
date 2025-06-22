import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import ProjectMarketplace from '../components/ProjectMarketplace';
import Profile from '../components/Profile';
import Messages from '../components/Messages';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

function AppRoutes() {
  const { user, profile, isLoading, error, refreshAuth } = useAuth();

  // Show loading screen while initializing auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen if there's an auth error
  if (error) {
    return <ErrorScreen error={error} onRetry={refreshAuth} />;
  }

  // Show landing page if not authenticated
  if (!user || !profile) {
    return <LandingPage />;
  }

  // Protected routes for authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard userType={profile.user_type} />
    </div>
  );
}

export default AppRoutes; 