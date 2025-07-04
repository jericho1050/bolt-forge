import React from 'react';
import { Github } from 'lucide-react';
import { OAuthProvider } from 'appwrite';

interface OAuthButtonsProps {
  onOAuthSignIn: (provider: OAuthProvider) => void;
  loading: boolean;
  disabled?: boolean;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ 
  onOAuthSignIn, 
  loading, 
  disabled = false 
}) => {
  const handleOAuthClick = (provider: OAuthProvider) => {
    if (loading || disabled) return;
    onOAuthSignIn(provider);
  };

  const buttonBaseClasses = `
    w-full flex items-center justify-center space-x-3 px-4 py-3 
    border border-gray-300 rounded-lg font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const githubClasses = `
    ${buttonBaseClasses}
    bg-gray-900 text-white border-gray-900 
    hover:bg-gray-800 focus:ring-gray-500
    disabled:bg-gray-400 disabled:border-gray-400
  `;

  const googleClasses = `
    ${buttonBaseClasses}
    bg-white text-gray-700 border-gray-300
    hover:bg-gray-50 focus:ring-blue-500
    disabled:bg-gray-100 disabled:border-gray-200
  `;

  return (
    <div className="space-y-3">
      {/* GitHub OAuth Button */}
      <button
        type="button"
        onClick={() => handleOAuthClick('github' as OAuthProvider)}
        disabled={loading || disabled}
        className={githubClasses}
        aria-label="Sign in with GitHub"
      >
        <Github className="w-5 h-5" />
        <span>Continue with GitHub</span>
        {loading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
        )}
      </button>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={() => handleOAuthClick('google' as OAuthProvider)}
        disabled={loading || disabled}
        className={googleClasses}
        aria-label="Sign in with Google"
      >
        {/* Google Logo SVG */}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Continue with Google</span>
        {loading && (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin ml-2"></div>
        )}
      </button>
    </div>
  );
};

export default OAuthButtons;