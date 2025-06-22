import * as React from 'react';
import {
  createRoute,
  createRouter,
  useNavigate,
} from '@tanstack/react-router';
import { rootRoute } from './__root';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import ProjectMarketplace from '../components/ProjectMarketplace';
import Profile from '../components/Profile';
import Messages from '../components/Messages';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, refreshAuth } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/' });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={refreshAuth} />;
  return <>{children}</>;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const { user, profile, isLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
      if (!isLoading && user && profile) {
        navigate({ to: '/dashboard', replace: true });
      }
    }, [user, profile, isLoading, navigate]);

    if (isLoading) return <LoadingScreen />;
    return <LandingPage onSignIn={() => {}} onNavigate={() => {}} />;
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <Dashboard userType={useAuth().profile?.user_type ?? 'developer'} />
    </ProtectedRoute>
  ),
});

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: () => (
    <ProtectedRoute>
      <ProjectMarketplace onNavigate={() => {}} />
    </ProtectedRoute>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <ProtectedRoute>
      <Profile userType={useAuth().profile?.user_type ?? 'developer'} onNavigate={() => {}} />
    </ProtectedRoute>
  ),
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: () => (
    <ProtectedRoute>
      <Messages onNavigate={() => {}} />
    </ProtectedRoute>
  ),
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => (
    <div className="min-h-screen flex items-center justify-center text-2xl">
      404 Not Found
    </div>
  ),
});

rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  marketplaceRoute,
  profileRoute,
  messagesRoute,
  notFoundRoute,
]);

export const router = createRouter({ routeTree: rootRoute }); 