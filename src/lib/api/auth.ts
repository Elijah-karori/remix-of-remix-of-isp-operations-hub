import { Token, UserCreate, UserOut, UserUpdate } from '../../types/api';
import { apiFetch, setAccessToken, API_BASE_URL } from './base';

export const authApi = {
  /**
   * Phase 1: Verify Password
   * Returns successful status but not the final JWT if 2FA is required.
   */
  login: async (email: string, password: string): Promise<{ status: string }> => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Invalid credentials");
    }

    return response.json();
  },

  /**
   * Phase 2: Request OTP after password verification
   */
  requestOTP: async (email: string): Promise<void> => {
    const formData = new URLSearchParams();
    formData.append("email", email);

    return apiFetch("/api/v1/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
  },

  /**
   * Phase 3: OTP Verification and Token Issuance
   */
  verifyOTPLogin: async (email: string, otp: string, rememberMe = false): Promise<Token> => {
    const response = await apiFetch<Token>(`/api/v1/auth/otp/login?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
      method: "POST",
    }, { handle401: false });

    if (response.access_token) {
      setAccessToken(response.access_token, rememberMe);
    }
    return response;
  },

  register: async (data: UserCreate): Promise<UserOut> => {
    return apiFetch<UserOut>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  requestRegistrationOTP: async (data: any) => {
    return apiFetch("/api/v1/auth/register/otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyRegistrationOTP: async (email: string, otp: string) => {
    const response = await apiFetch<Token>(`/api/v1/auth/register/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
      method: "POST",
    }, { handle401: false });

    if (response.access_token) {
      setAccessToken(response.access_token);
    }
    return response;
  },

  requestPasswordlessLogin: async (email: string) => {
    return apiFetch(`/api/v1/auth/passwordless/request?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  },

  verifyPasswordlessOTP: async (email: string, otp: string) => {
    return apiFetch<Token>(`/api/v1/auth/passwordless/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
      method: "POST",
    }, { handle401: false });
  },

  verifyMagicLink: async (token: string): Promise<Token> => {
    return apiFetch<Token>(`/api/v1/auth/passwordless/verify?token=${encodeURIComponent(token)}`).then(data => {
      setAccessToken(data.access_token);
      return data;
    });
  },

  me: async (): Promise<UserOut> => {
    return apiFetch<UserOut>("/api/v1/users/me/");
  },

  updateProfile: async (data: UserUpdate): Promise<UserOut> => {
    return apiFetch<UserOut>("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiFetch("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },

  refresh: async (): Promise<Token> => {
    return apiFetch<Token>("/api/v1/auth/refresh/", {
      method: "POST",
    }).then(data => {
      setAccessToken(data.access_token);
      return data;
    });
  },

  requestPasswordReset: async (email: string) => {
    return apiFetch(`/api/v1/auth/passwordless/request?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  },

  logout: async () => {
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Backend logout failed", e);
    } finally {
      setAccessToken(null);
    }
  },

  setPassword: async (data: { new_password: string; confirm_password: string }) => {
    return apiFetch("/api/v1/auth/set-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
