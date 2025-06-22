import { z } from 'zod';

// Password validation schema with strength requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Username validation schema
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(20, 'Username must be no more than 20 characters long')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

// Phone number validation schema
const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits')
  .optional()
  .or(z.literal(''));

// Sign up schema
export const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    phone: phoneSchema,
    userType: z.enum(['developer', 'company'], {
      required_error: 'Please select an account type',
    }),
    companyName: z.string().optional(),
    location: z.string().optional(),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    data => {
      if (data.userType === 'company') {
        return data.companyName && data.companyName.length >= 2;
      }
      return true;
    },
    {
      message: 'Company name is required for company accounts',
      path: ['companyName'],
    }
  );

// Sign in schema
export const signInSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .refine(
      value => {
        // Check if it's a valid email or valid username
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return emailRegex.test(value) || usernameRegex.test(value);
      },
      {
        message: 'Please enter a valid email address or username',
      }
    ),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

// Export TypeScript types
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Password strength calculation
export function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  if (password.length >= 12) score += 1;

  const strength = score <= 2 ? 'weak' : score <= 3 ? 'fair' : score <= 4 ? 'good' : 'strong';

  return { score, feedback, strength };
}