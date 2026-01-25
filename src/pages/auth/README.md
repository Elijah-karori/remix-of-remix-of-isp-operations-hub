# Authentication Pages - Route Configuration

Add these routes to your React Router configuration:

```typescript
import {
  LoginPage,
  PasswordlessRequestPage,
  PasswordlessVerifyOtpPage,
  RegisterRequestPage,
  RegisterVerifyPage,
  SetPasswordPage,
  MagicLinkVerify,
} from '@/pages/auth';

// In your Routes configuration:
<Routes>
  {/* Main Login */}
  <Route path="/login" element={<LoginPage />} />
  
  {/* Passwordless Login Flow */}
  <Route path="/auth/passwordless/request" element={<PasswordlessRequestPage />} />
  <Route path="/auth/passwordless/verify-otp" element={<PasswordlessVerifyOtpPage />} />
  <Route path="/auth/passwordless/verify" element={<MagicLinkVerify />} />
  
  {/* Registration Flow */}
  <Route path="/auth/register" element={<RegisterRequestPage />} />
  <Route path="/auth/register/verify" element={<RegisterVerifyPage />} />
  
  {/* Password Management */}
  <Route path="/auth/set-password" element={<SetPasswordPage />} />
  
  {/* Other routes... */}
</Routes>
```

## Page Flow Diagrams

### Standard Login Flow
```
/login
  ↓ (email + password)
/ (dashboard)
```

### Passwordless Login Flow
```
/login → Click "Sign in without password"
  ↓
/auth/passwordless/request
  ↓ (sends magic link + OTP)
/auth/passwordless/verify-otp
  ↓ (verifies OTP)
/ (dashboard)

OR

Email Magic Link → /auth/passwordless/verify?token=xxx
  ↓ (verifies token)
/ (dashboard)
```

### Registration Flow
```
/login → Click "Create one"
  ↓
/auth/register
  ↓ (creates PENDING_OTP user, sends OTP)
/auth/register/verify
  ↓ (activates user, auto-login)
/login?success=Account created successfully!
  ↓ (user logs in with password or passwordless)
/ (dashboard)
```

### Password Reset Flow
```
/login → Click "Forgot password?"
  ↓
/auth/passwordless/request
  ↓ (same as passwordless login)
/auth/passwordless/verify-otp
  ↓
/ (dashboard)
  ↓
/auth/set-password (optional: set new password)
```

## API Endpoints Used

| Page | Endpoint | Method | Description |
|------|----------|--------|-------------|
| PasswordlessRequestPage | `/api/v1/auth/passwordless/request` | POST | Request magic link + OTP |
| PasswordlessVerifyOtpPage | `/api/v1/auth/passwordless/verify-otp` | POST | Verify OTP for passwordless login |
| MagicLinkVerify | `/api/v1/auth/passwordless/verify` | GET | Verify magic link token |
| RegisterRequestPage | `/api/v1/auth/register/otp/request` | POST | Create PENDING_OTP user |
| RegisterVerifyPage | `/api/v1/auth/register/otp/verify` | POST | Activate user & auto-login |
| SetPasswordPage | `/api/v1/auth/set-password` | POST | Set password (requires auth) |

## Features

### PasswordlessRequestPage
- Email input
- Sends both magic link and OTP
- Auto-redirects to OTP verification page
- Back button to login

### PasswordlessVerifyOtpPage
- 6-digit OTP input
- Email pre-filled from query params
- Auto-redirect to dashboard on success
- Tip about using magic link instead

### RegisterRequestPage
- Full name, email, phone inputs
- Creates PENDING_OTP user
- Shows account status warning
- Auto-redirects to verification page

### RegisterVerifyPage
- 6-digit OTP input
- Shows PENDING_OTP status
- Activates account on verification
- Auto-redirects to set password page
- Can skip password setup

### SetPasswordPage
- Password strength indicator (5 levels)
- Show/hide password toggle
- Confirm password validation
- Optional skip button (from registration)
- Auto-redirect to dashboard

### MagicLinkVerify
- Automatic token verification
- Loading, success, error states
- Auto-redirect on success/error
- No user interaction needed
