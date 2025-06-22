import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function LoadingScreen() {
  const { user, profile, refreshAuth } = useAuth();

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

export default LoadingScreen; 