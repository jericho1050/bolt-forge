import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { OAuthProvider } from 'appwrite';
import { useAuth } from '../contexts/AuthContext';
import { useAuthValidation } from '../hooks/useAuthValidation';
import { useRateLimit } from '../hooks/useRateLimit';
import { 
  signUpSchema, 
  signInSchema, 
  SignUpFormData, 
  SignInFormData
} from '../lib/validations/auth';
import SignUpForm from './auth/SignUpForm';
import SignInForm from './auth/SignInForm';
import OAuthButtons from './auth/OAuthButtons';

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserType?: 'developer' | 'company';
}

const EnhancedAuthModal: React.FC<EnhancedAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultUserType = 'developer' 
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Form data
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    userType: defaultUserType,
    companyName: '',
    location: '',
    agreeToTerms: false,
  });

  const [signInData, setSignInData] = useState<SignInFormData>({
    emailOrUsername: '',
    password: '',
    rememberMe: false,
  });

  // Validation hooks
  const signUpValidation = useAuthValidation(signUpSchema);
  const signInValidation = useAuthValidation(signInSchema);

  // Rate limiting for sign in attempts
  const rateLimit = useRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block
  });

  const { signIn, signUp, signInWithOAuth, user, isInitialized } = useAuth();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close modal when user is authenticated
  useEffect(() => {
    if (user && isOpen && isInitialized) {
      console.log('✅ User authenticated, closing modal and redirecting...');
      onClose();
    }
  }, [user, isOpen, isInitialized, onClose]);

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setAuthError(null);
      setLoading(false);
      signUpValidation.clearErrors();
      signInValidation.clearErrors();
    }
  }, [isOpen, isSignUp]);

  if (!isOpen) return null;

  // Enhanced error categorization
  const categorizeError = (error: string): { type: 'network' | 'credentials' | 'server' | 'validation' | 'oauth'; message: string } => {
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('oauth') || lowerError.includes('authorization')) {
      return {
        type: 'oauth',
        message: 'OAuth authentication failed. Please try again or use email/password login.'
      };
    }
    
    if (lowerError.includes('network') || lowerError.includes('connection') || lowerError.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection error. Please check your internet connection and try again.'
      };
    }
    
    if (lowerError.includes('invalid') || lowerError.includes('wrong') || lowerError.includes('credentials') || lowerError.includes('password')) {
      return {
        type: 'credentials',
        message: 'Invalid email/username or password. Please check your credentials and try again.'
      };
    }
    
    if (lowerError.includes('server') || lowerError.includes('500') || lowerError.includes('503')) {
      return {
        type: 'server',
        message: 'Server temporarily unavailable. Please try again in a few moments.'
      };
    }
    
    return {
      type: 'validation',
      message: error
    };
  };

  const handleSignUpChange = (field: keyof SignUpFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSignUpData(prev => ({ ...prev, [field]: value }));
    
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError(null);
    }
  };

  const handleSignInChange = (field: keyof SignInFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSignInData(prev => ({ ...prev, [field]: value }));
    
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError(null);
    }
  };

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    if (loading || !isOnline) return;
    
    setLoading(true);
    setAuthError(null);

    try {
      console.log(`🔄 Starting OAuth sign in with ${provider}`);
      await signInWithOAuth(provider);
      // OAuth will redirect, so we don't need to handle success here
    } catch (err) {
      console.error(`❌ OAuth sign in error with ${provider}:`, err);
      const { message } = categorizeError(err instanceof Error ? err.message : 'OAuth sign in failed');
      setAuthError(message);
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || !isOnline) return;
    
    setLoading(true);
    setAuthError(null);

    try {
      console.log('🔄 Starting sign up validation and submission');
      
      // Validate form first
      const { isValid, errors } = await signUpValidation.validateForm(signUpData);
      
      if (!isValid) {
        console.log('❌ Form validation failed:', errors);
        setLoading(false);
        return;
      }

      console.log('✅ Form validation passed, creating account...');
      
      // Attempt sign up
      await signUp(signUpData);
      
      console.log('✅ Sign up successful - modal will close and redirect automatically');
      
    } catch (err) {
      console.error('❌ Sign up error:', err);
      const { message } = categorizeError(err instanceof Error ? err.message : 'Sign up failed');
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rateLimit.canAttempt || loading || !isOnline) {
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      console.log('🔄 Starting sign in validation and submission');
      
      // Validate form first
      const { isValid } = await signInValidation.validateForm(signInData);
      
      if (!isValid) {
        console.log('❌ Form validation failed');
        setLoading(false);
        return;
      }

      console.log('✅ Form validation passed, signing in...');
      
      // Attempt sign in
      await signIn(signInData);
      
      console.log('✅ Sign in successful - modal will close and redirect automatically');
      rateLimit.reset();
      
    } catch (err) {
      console.error('❌ Sign in error:', err);
      rateLimit.recordAttempt();
      const { message } = categorizeError(err instanceof Error ? err.message : 'Sign in failed');
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    if (loading) return;
    setIsSignUp(!isSignUp);
    setAuthError(null);
    signUpValidation.clearErrors();
    signInValidation.clearErrors();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h2>
              {/* Online status indicator */}
              <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Offline Warning */}
          {!isOnline && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center space-x-2">
              <WifiOff className="w-5 h-5" />
              <div>
                <p className="font-medium">No Internet Connection</p>
                <p className="text-sm">Please check your connection and try again.</p>
              </div>
            </div>
          )}

          {/* Rate Limit Warning */}
          {rateLimit.isBlocked && (
            <div className="mb-4 p-3 bg-orange-100 border border-orange-300 text-orange-700 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">Too Many Failed Attempts</p>
                <p className="text-sm">Please wait {rateLimit.remainingTime} seconds before trying again.</p>
              </div>
            </div>
          )}

          {/* OAuth Buttons */}
          {!isSignUp && (
            <div className="mb-6">
              <OAuthButtons 
                onOAuthSignIn={handleOAuthSignIn}
                loading={loading}
                disabled={!isOnline || rateLimit.isBlocked}
              />
              
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Forms */}
          {isSignUp ? (
            <SignUpForm
              formData={signUpData}
              onFormDataChange={handleSignUpChange}
              onSubmit={handleSignUpSubmit}
              validation={signUpValidation}
              loading={loading}
            />
          ) : (
            <SignInForm
              formData={signInData}
              onFormDataChange={handleSignInChange}
              onSubmit={handleSignInSubmit}
              validation={signInValidation}
              rateLimit={rateLimit}
              loading={loading}
              authError={authError}
            />
          )}

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              disabled={loading}
              className="text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              🔒 Your data is protected with industry-standard encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAuthModal;