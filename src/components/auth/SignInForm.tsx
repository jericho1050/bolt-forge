import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { SignInFormData } from '../../lib/validations/auth';
import { useAuthValidation } from '../../hooks/useAuthValidation';
import { useRateLimit } from '../../hooks/useRateLimit';

interface SignInFormProps {
  formData: SignInFormData;
  onFormDataChange: (field: keyof SignInFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  validation: ReturnType<typeof useAuthValidation>;
  rateLimit: ReturnType<typeof useRateLimit>;
  loading: boolean;
  authError?: string | null;
}

const SignInForm: React.FC<SignInFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  validation,
  rateLimit,
  loading,
  authError
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Enhanced field change handler with immediate validation for touched fields
  const handleFieldChange = (field: keyof SignInFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange(field)(e);
    
    // If user has attempted to submit or field was previously touched, validate immediately
    if (attemptedSubmit || validation.touched[field]) {
      validation.markFieldTouched(field);
      validation.validateField(field, e.target.value, formData);
    }
  };

  // Enhanced blur handler
  const handleFieldBlur = (field: keyof SignInFormData) => () => {
    validation.markFieldTouched(field);
    if (formData[field]) {
      validation.validateField(field, formData[field], formData);
    }
  };

  // Enhanced submit handler with proper validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    // Prevent submission if already loading or rate limited
    if (loading || !rateLimit.canAttempt) {
      return;
    }

    // Mark all fields as touched for validation display
    validation.markFieldTouched('emailOrUsername');
    validation.markFieldTouched('password');

    // Validate form before submission
    const { isValid } = await validation.validateForm(formData);
    
    if (!isValid) {
      console.log('❌ Form validation failed, preventing submission');
      return;
    }

    // Call the actual submit handler
    onSubmit(e);
  };

  // Determine if form can be submitted
  const canSubmit = !loading && rateLimit.canAttempt && !validation.isValidating;

  // Get field error (only show if touched or after submit attempt)
  const getFieldError = (field: keyof SignInFormData) => {
    return (validation.touched[field] || attemptedSubmit) ? validation.errors[field] : undefined;
  };

  // Get field status for visual feedback
  const getFieldStatus = (field: keyof SignInFormData) => {
    const error = getFieldError(field);
    const hasValue = formData[field] && formData[field].length > 0;
    const isTouched = validation.touched[field] || attemptedSubmit;
    
    if (!isTouched) return 'default';
    if (error) return 'error';
    if (hasValue) return 'success';
    return 'default';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Email/Username Field */}
      <div className="space-y-1">
        <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700">
          Email or Username
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Mail className="w-5 h-5" />
          </div>
          
          <input
            id="emailOrUsername"
            name="emailOrUsername"
            type="text"
            value={formData.emailOrUsername}
            onChange={handleFieldChange('emailOrUsername')}
            onBlur={handleFieldBlur('emailOrUsername')}
            placeholder="Enter email or username"
            required
            disabled={loading}
            autoComplete="username"
            aria-describedby={getFieldError('emailOrUsername') ? 'emailOrUsername-error' : undefined}
            className={`
              w-full pl-10 pr-10 py-3 border rounded-lg transition-all duration-200 focus:outline-none
              ${getFieldStatus('emailOrUsername') === 'error' 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                : getFieldStatus('emailOrUsername') === 'success'
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white'
              }
              ${loading ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}
              focus:ring-2 focus:ring-opacity-20
            `}
          />
          
          {/* Status icon */}
          {getFieldStatus('emailOrUsername') !== 'default' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getFieldStatus('emailOrUsername') === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        
        {getFieldError('emailOrUsername') && (
          <div id="emailOrUsername-error" className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{getFieldError('emailOrUsername')}</span>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Lock className="w-5 h-5" />
          </div>
          
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleFieldChange('password')}
            onBlur={handleFieldBlur('password')}
            placeholder="Enter your password"
            required
            disabled={loading}
            autoComplete="current-password"
            aria-describedby={getFieldError('password') ? 'password-error' : undefined}
            className={`
              w-full pl-10 pr-20 py-3 border rounded-lg transition-all duration-200 focus:outline-none
              ${getFieldStatus('password') === 'error' 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                : getFieldStatus('password') === 'success'
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50'
                : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white'
              }
              ${loading ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}
              focus:ring-2 focus:ring-opacity-20
            `}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Status icon */}
            {getFieldStatus('password') !== 'default' && (
              <div>
                {getFieldStatus('password') === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            )}
            
            {/* Password toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {getFieldError('password') && (
          <div id="password-error" className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{getFieldError('password')}</span>
          </div>
        )}
      </div>

      {/* Remember me and forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="rememberMe"
            checked={formData.rememberMe || false}
            onChange={handleFieldChange('rememberMe')}
            disabled={loading}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-700">
            Remember me
          </label>
        </div>
        <button
          type="button"
          className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
          disabled={loading}
        >
          Forgot password?
        </button>
      </div>

      {/* Rate limiting warning */}
      {!rateLimit.canAttempt && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-orange-800">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">
              Too many failed attempts. Please wait {rateLimit.remainingTime} seconds before trying again.
            </p>
          </div>
          <p className="text-xs text-orange-600 mt-1">
            {rateLimit.attemptsRemaining} attempts remaining after cooldown
          </p>
        </div>
      )}

      {/* Authentication error */}
      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm font-medium">Authentication Failed</p>
          </div>
          <p className="text-sm text-red-700 mt-1">{authError}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200
          flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${canSubmit 
            ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 transform hover:scale-[1.02] active:scale-[0.98]' 
            : 'bg-gray-400 cursor-not-allowed'
          }
        `}
        aria-describedby="submit-status"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Signing In...</span>
          </>
        ) : !rateLimit.canAttempt ? (
          <>
            <AlertCircle className="w-5 h-5" />
            <span>Please Wait</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>

      {/* Form status for screen readers */}
      <div id="submit-status" className="sr-only">
        {loading && "Authentication in progress"}
        {!rateLimit.canAttempt && "Form temporarily disabled due to failed attempts"}
        {authError && `Authentication error: ${authError}`}
      </div>
    </form>
  );
};

export default SignInForm;