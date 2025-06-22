import React from 'react';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  // Determine error type and appropriate messaging
  const isNetworkError = error.toLowerCase().includes('network') || 
                        error.toLowerCase().includes('connection') ||
                        error.toLowerCase().includes('fetch');
  
  const errorIcon = isNetworkError ? '🌐' : '⚠️';
  const errorTitle = isNetworkError ? 'Connection Error' : 'Authentication Error';
  const errorBgColor = isNetworkError ? 'bg-blue-100' : 'bg-red-100';
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className={`w-16 h-16 ${errorBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className="text-2xl">{errorIcon}</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {errorTitle}
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        {isNetworkError && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Please check your internet connection and try again.
            </p>
          </div>
        )}
        <button
          onClick={onRetry}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          {isNetworkError ? 'Retry Connection' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}

export default ErrorScreen; 