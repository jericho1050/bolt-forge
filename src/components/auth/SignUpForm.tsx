import React from 'react';
import { Mail, Lock, User, Building } from 'lucide-react';
import { SignUpFormData } from '../../lib/validations/auth';
import { useAuthValidation } from '../../hooks/useAuthValidation';
import FormField from '../FormField';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator';

interface SignUpFormProps {
  formData: SignUpFormData;
  onFormDataChange: (field: keyof SignUpFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  validation: ReturnType<typeof useAuthValidation>;
  loading: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  validation,
  loading
}) => {
  const handleUserTypeChange = (userType: 'developer' | 'company') => {
    onFormDataChange('userType')({
      target: { name: 'userType', value: userType, type: 'text' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Account Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Type *
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleUserTypeChange('developer')}
            className={`p-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${
              formData.userType === 'developer'
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
            onClick={() => handleUserTypeChange('company')}
            className={`p-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${
              formData.userType === 'company'
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
        value={formData.email}
        onChange={onFormDataChange('email')}
        error={validation.errors.email}
        placeholder="Enter your email"
        required
        disabled={loading}
        autoComplete="email"
        icon={<Mail className="w-5 h-5" />}
      />

      <FormField
        label="Username"
        name="username"
        value={formData.username}
        onChange={onFormDataChange('username')}
        error={validation.errors.username}
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
        value={formData.password}
        onChange={onFormDataChange('password')}
        error={validation.errors.password}
        placeholder="Create a strong password"
        required
        disabled={loading}
        autoComplete="new-password"
        icon={<Lock className="w-5 h-5" />}
        showPasswordToggle
      >
        <PasswordStrengthIndicator password={formData.password} />
      </FormField>

      <FormField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={onFormDataChange('confirmPassword')}
        error={validation.errors.confirmPassword}
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
        value={formData.fullName || ''}
        onChange={onFormDataChange('fullName')}
        error={validation.errors.fullName}
        placeholder="Enter your full name"
        disabled={loading}
        autoComplete="name"
      />

      {formData.userType === 'company' && (
        <FormField
          label="Company Name"
          name="companyName"
          value={formData.companyName || ''}
          onChange={onFormDataChange('companyName')}
          error={validation.errors.companyName}
          placeholder="Enter company name"
          required
          disabled={loading}
          autoComplete="organization"
        />
      )}

      <FormField
        label="Location"
        name="location"
        value={formData.location || ''}
        onChange={onFormDataChange('location')}
        error={validation.errors.location}
        placeholder="City, Country"
        disabled={loading}
        autoComplete="address-level2"
      />

      <FormField
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone || ''}
        onChange={onFormDataChange('phone')}
        error={validation.errors.phone}
        placeholder="+1 (555) 123-4567"
        disabled={loading}
        autoComplete="tel"
      />

      {/* Terms Agreement */}
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={onFormDataChange('agreeToTerms')}
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
      {validation.errors.agreeToTerms && (
        <p className="text-red-600 text-sm">{validation.errors.agreeToTerms}</p>
      )}

      <button
        type="submit"
        disabled={loading || validation.isValidating}
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
  );
};

export default SignUpForm;
