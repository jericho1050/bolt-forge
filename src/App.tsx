import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ProjectMarketplace from './components/ProjectMarketplace';
import Profile from './components/Profile';
import Messages from './components/Messages';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const { user, profile, loading, error, refreshAuth } = useAuth();

  useEffect(() => {
    console.log('🔄 App state update:', { 
      user: user ? 'Present' : 'None', 
      profile: profile ? 'Present' : 'None', 
      loading,
      error 
    });

    if (!loading) {
      if (user && profile) {
        setCurrentPage('dashboard');
      } else if (!user) {
        setCurrentPage('landing');
      }
    }
  }, [user, profile, loading]);

  // Auto-refresh if stuck loading for too long
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('⚠️ Loading timeout - forcing refresh');
        refreshAuth();
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    }
  }, [loading, refreshAuth]);

  const handleSignIn = (type: 'developer' | 'company') => {
    // This is now handled by the EnhancedAuthModal component
    // The useAuth hook will automatically update the user state
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Loading...</p>
          <p className="text-sm text-gray-500">
            Initializing authentication
          </p>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>User: {user ? '✅' : '❌'}</p>
              <p>Profile: {profile ? '✅' : '❌'}</p>
              <p>Error: {error || 'None'}</p>
              <button 
                onClick={refreshAuth}
                className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-xs"
              >
                Force Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshAuth}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (!user || !profile) {
      return <LandingPage onSignIn={handleSignIn} onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userType={profile.user_type} onNavigate={setCurrentPage} />;
      case 'marketplace':
        return <ProjectMarketplace onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile userType={profile.user_type} onNavigate={setCurrentPage} />;
      case 'messages':
        return <Messages onNavigate={setCurrentPage} />;
      default:
        return <Dashboard userType={profile.user_type} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
}

export default App;