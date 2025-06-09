import React from 'react';
import { calculatePasswordStrength } from '../lib/validations/auth';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showDetails = true,
}) => {
  const { score, feedback, strength } = calculatePasswordStrength(password);

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'fair': return 'bg-orange-500';
      case 'good': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      {/* Strength Bar */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(score / 6) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${
          strength === 'weak' ? 'text-red-600' :
          strength === 'fair' ? 'text-orange-600' :
          strength === 'good' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {getStrengthText()}
        </span>
      </div>

      {/* Detailed Feedback */}
      {showDetails && (
        <div className="space-y-1">
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className={`flex items-center space-x-1 ${
              password.length >= 8 ? 'text-green-600' : 'text-gray-500'
            }`}>
              {password.length >= 8 ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              <span>At least 8 characters</span>
            </div>
            
            <div className={`flex items-center space-x-1 ${
              /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'
            }`}>
              {/[a-z]/.test(password) ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              <span>Lowercase letter</span>
            </div>
            
            <div className={`flex items-center space-x-1 ${
              /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'
            }`}>
              {/[A-Z]/.test(password) ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              <span>Uppercase letter</span>
            </div>
            
            <div className={`flex items-center space-x-1 ${
              /\d/.test(password) ? 'text-green-600' : 'text-gray-500'
            }`}>
              {/\d/.test(password) ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              <span>Number</span>
            </div>
            
            <div className={`flex items-center space-x-1 ${
              /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-500'
            }`}>
              {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              <span>Special character</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;