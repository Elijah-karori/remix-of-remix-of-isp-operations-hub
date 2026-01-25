/**
 * Authentication Pages Index
 * Export all authentication-related pages
 */

export { LoginPage } from './LoginPage';
export { PasswordlessRequestPage } from './PasswordlessRequestPage';
export { PasswordlessVerifyOtpPage } from './PasswordlessVerifyOtpPage';
export { RegisterRequestPage } from './RegisterRequestPage';
export { RegisterVerifyPage } from './RegisterVerifyPage';
export { SetPasswordPage } from './SetPasswordPage';

// Re-export MagicLinkVerify from components for consistency
export { MagicLinkVerify } from '@/components/auth/MagicLinkVerify';
