import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Building, Github, Chrome, AlertTriangle } from 'lucide-react';
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
import FormField from './FormField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

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
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading || rateLimit.isBlocked}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome className="w-5 h-5 text-blue-600" />
              <span>Continue with Google</span>
            </button>
            
            <button
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading || rateLimit.isBlocked}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github className="w-5 h-5 text-gray-800" />
              <span>Continue with GitHub</span>
            </button>
          </div>

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
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setSignUpData(prev => ({ ...prev, userType: 'developer' }))}
                    className={`p-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${
                      signUpData.userType === 'developer'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <User className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Developer</div>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setSignUpData(prev => ({ ...prev, userType: 'company' }))}
                    className={`p-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${
                      signUpData.userType === 'company'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Building className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Company</div>
                  </button>
                </div>
              </div>

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={signUpData.email}
                onChange={handleSignUpChange('email')}
                error={signUpValidation.errors.email}
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="email"
                icon={<Mail className="w-5 h-5" />}
              />

              <FormField
                label="Username"
                name="username"
                value={signUpData.username}
                onChange={handleSignUpChange('username')}
                error={signUpValidation.errors.username}
                placeholder="Choose a username"
                required
                disabled={loading}
                autoComplete="username"
                icon={<User className="w-5 h-5" />}
              />

              <FormField
                label="Password"
                name="password"
                type="password"
                value={signUpData.password}
                onChange={handleSignUpChange('password')}
                error={signUpValidation.errors.password}
                placeholder="Create a strong password"
                required
                disabled={loading}
                autoComplete="new-password"
                icon={<Lock className="w-5 h-5" />}
                showPasswordToggle
              >
                <PasswordStrengthIndicator password={signUpData.password} />
              </FormField>

              <FormField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={signUpData.confirmPassword}
                onChange={handleSignUpChange('confirmPassword')}
                error={signUpValidation.errors.confirmPassword}
                placeholder="Confirm your password"
                required
                disabled={loading}
                autoComplete="new-password"
                icon={<Lock className="w-5 h-5" />}
                showPasswordToggle
              />

              <FormField
                label="Full Name"
                name="fullName"
                value={signUpData.fullName || ''}
                onChange={handleSignUpChange('fullName')}
                error={signUpValidation.errors.fullName}
                placeholder="Enter your full name"
                disabled={loading}
                autoComplete="name"
              />

              {signUpData.userType === 'company' && (
                <FormField
                  label="Company Name"
                  name="companyName"
                  value={signUpData.companyName || ''}
                  onChange={handleSignUpChange('companyName')}
                  error={signUpValidation.errors.companyName}
                  placeholder="Enter company name"
                  required
                  disabled={loading}
                  autoComplete="organization"
                />
              )}

              <FormField
                label="Location"
                name="location"
                value={signUpData.location || ''}
                onChange={handleSignUpChange('location')}
                error={signUpValidation.errors.location}
                placeholder="City, Country"
                disabled={loading}
                autoComplete="address-level2"
              />

              <FormField
                label="Phone Number"
                name="phone"
                type="tel"
                value={signUpData.phone || ''}
                onChange={handleSignUpChange('phone')}
                error={signUpValidation.errors.phone}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
                autoComplete="tel"
              />

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={signUpData.agreeToTerms}
                  onChange={handleSignUpChange('agreeToTerms')}
                  disabled={loading}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {signUpValidation.errors.agreeToTerms && (
                <p className="text-red-600 text-sm">{signUpValidation.errors.agreeToTerms}</p>
              )}

              <button
                type="submit"
                disabled={loading || signUpValidation.isValidating}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <FormField
                label="Email or Username"
                name="emailOrUsername"
                value={signInData.emailOrUsername}
                onChange={handleSignInChange('emailOrUsername')}
                error={signInValidation.errors.emailOrUsername}
                placeholder="Enter email or username"
                required
                disabled={loading}
                autoComplete="username"
                icon={<Mail className="w-5 h-5" />}
              />

              <FormField
                label="Password"
                name="password"
                type="password"
                value={signInData.password}
                onChange={handleSignInChange('password')}
                error={signInValidation.errors.password}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
                icon={<Lock className="w-5 h-5" />}
                showPasswordToggle
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={signInData.rememberMe || false}
                    onChange={handleSignInChange('rememberMe')}
                    disabled={loading}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-purple-600 hover:text-purple-700">
                  Forgot password?
                </a>
              </div>

              {!rateLimit.canAttempt && (
                <p className="text-sm text-gray-600">
                  {rateLimit.attemptsRemaining} attempts remaining
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !rateLimit.canAttempt || signInValidation.isValidating}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
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