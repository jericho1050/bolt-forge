import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { SignInFormData } from '../../lib/validations/auth';
import { useAuthValidation } from '../../hooks/useAuthValidation';
import { useRateLimit } from '../../hooks/useRateLimit';
import FormField from '../FormField';

interface SignInFormProps {
  formData: SignInFormData;
  onFormDataChange: (field: keyof SignInFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  validation: ReturnType<typeof useAuthValidation>;
  rateLimit: ReturnType<typeof useRateLimit>;
  loading: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  validation,
  rateLimit,
  loading
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField
        label="Email or Username"
        name="emailOrUsername"
        value={formData.emailOrUsername}
        onChange={onFormDataChange('emailOrUsername')}
        error={validation.errors.emailOrUsername}
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
        value={formData.password}
        onChange={onFormDataChange('password')}
        error={validation.errors.password}
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
            checked={formData.rememberMe || false}
            onChange={onFormDataChange('rememberMe')}
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
        disabled={loading || !rateLimit.canAttempt || validation.isValidating}
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
  );
};

export default SignInForm;
