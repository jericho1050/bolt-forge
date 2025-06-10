import React from 'react';
import { Github, Chrome } from 'lucide-react';
import { OAuthProvider } from '../../lib/validations/auth';

interface OAuthButtonsProps {
  onOAuthSignIn: (provider: OAuthProvider) => void;
  loading: boolean;
  disabled: boolean;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ 
  onOAuthSignIn, 
  loading, 
  disabled 
}) => {
  return (
    <div className="space-y-3 mb-6">
      <button
        onClick={() => onOAuthSignIn('google')}
        disabled={loading || disabled}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Chrome className="w-5 h-5 text-blue-600" />
        <span>Continue with Google</span>
      </button>
      
      <button
        onClick={() => onOAuthSignIn('github')}
        disabled={loading || disabled}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Github className="w-5 h-5 text-gray-800" />
        <span>Continue with GitHub</span>
      </button>
    </div>
  );
};

export default OAuthButtons;
