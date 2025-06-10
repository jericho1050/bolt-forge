import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthValidation } from '../hooks/useAuthValidation';
import { useRateLimit } from '../hooks/useRateLimit';
import { 
  signUpSchema, 
  signInSchema, 
  SignUpFormData, 
  SignInFormData,
  OAuthProvider 
} from '../lib/validations/auth';
import OAuthButtons from './auth/OAuthButtons';
import SignUpForm from './auth/SignUpForm';
import SignInForm from './auth/SignInForm';

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
  const [generalError, setGeneralError] = useState<string | null>(null);
  
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

  const { signIn, signUp, signInWithOAuth, user } = useAuth();

  // Close modal when user is authenticated
  useEffect(() => {
    if (user && isOpen) {
      console.log('✅ User authenticated, closing modal');
      onClose();
    }
  }, [user, isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setGeneralError(null);
      setLoading(false);
      signUpValidation.clearErrors();
      signInValidation.clearErrors();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignUpChange = (field: keyof SignUpFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSignUpData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (value) {
      signUpValidation.validateField(field, value, signUpData);
    } else {
      signUpValidation.clearFieldError(field);
    }
  };

  const handleSignInChange = (field: keyof SignInFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSignInData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (value) {
      signInValidation.validateField(field, value, signInData);
    } else {
      signInValidation.clearFieldError(field);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setGeneralError(null);

    try {
      console.log('🔄 Starting sign up process');
      
      const { isValid, errors } = await signUpValidation.validateForm(signUpData);
      
      if (!isValid) {
        console.log('❌ Form validation failed:', errors);
        setLoading(false);
        return;
      }

      const userData = {
        user_type: signUpData.userType,
        full_name: signUpData.fullName || '',
        location: signUpData.location || '',
        phone: signUpData.phone || '',
        ...(signUpData.userType === 'company' && { 
          company_name: signUpData.companyName || '' 
        }),
      };

      console.log('🔄 Calling signUp with data:', { email: signUpData.email, userData });
      
      const { error } = await signUp(signUpData.email, signUpData.password, userData);
      
      if (error) {
        console.error('❌ Sign up error:', error);
        setGeneralError(error.message);
      } else {
        console.log('✅ Sign up successful');
        // Modal will close automatically when user state updates
      }
    } catch (err) {
      console.error('❌ Sign up exception:', err);
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rateLimit.canAttempt || loading) {
      return;
    }

    setLoading(true);
    setGeneralError(null);

    try {
      console.log('🔄 Starting sign in process');
      
      const { isValid } = await signInValidation.validateForm(signInData);
      
      if (!isValid) {
        console.log('❌ Form validation failed');
        setLoading(false);
        return;
      }

      // For now, assume input is email (Supabase requires email for auth)
      const email = signInData.emailOrUsername;
      
      console.log('🔄 Calling signIn with email:', email);
      
      const { error } = await signIn(email, signInData.password);
      
      if (error) {
        console.error('❌ Sign in error:', error);
        rateLimit.recordAttempt();
        setGeneralError(error.message);
      } else {
        console.log('✅ Sign in successful');
        rateLimit.reset();
        // Modal will close automatically when user state updates
      }
    } catch (err) {
      console.error('❌ Sign in exception:', err);
      rateLimit.recordAttempt();
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setGeneralError(null);
      
      console.log('🔄 Starting OAuth sign in with:', provider);
      
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        console.error('❌ OAuth error:', error);
        setGeneralError(error.message);
        setLoading(false);
      } else {
        console.log('✅ OAuth redirect initiated');
        // Don't set loading to false - user will be redirected
      }
    } catch (err) {
      console.error('❌ OAuth exception:', err);
      setGeneralError('OAuth sign in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Rate Limit Warning */}
          {rateLimit.isBlocked && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">Too many failed attempts</p>
                <p className="text-sm">Please wait {rateLimit.remainingTime} seconds before trying again.</p>
              </div>
            </div>
          )}

          {/* General Error */}
          {generalError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {generalError}
            </div>
          )}

          {/* OAuth Buttons */}
          <OAuthButtons
            onOAuthSignIn={handleOAuthSignIn}
            loading={loading}
            disabled={rateLimit.isBlocked}
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

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
            />
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (loading) return;
                setIsSignUp(!isSignUp);
                setGeneralError(null);
                signUpValidation.clearErrors();
                signInValidation.clearErrors();
              }}
              disabled={loading}
              className="text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAuthModal;
