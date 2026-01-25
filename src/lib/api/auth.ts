import { Token, UserCreate, UserOut, UserUpdate } from '../../types/api';
import { apiFetch, setAccessToken, API_BASE_URL } from './base';

export const authApi = {
  login: async (email: string, password: string, rememberMe = false): Promise<Token> => {
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
      if (response.status === 401) {
        throw new Error("Invalid email or password");
      }
      if (response.status === 403) {
        throw new Error("Account is inactive. Please contact administrator.");
      }
      throw new Error(error.detail || "Login failed");
    }

    const data: Token = await response.json();
    setAccessToken(data.access_token, rememberMe);
    return data;
  },

  register: async (data: UserCreate): Promise<UserOut> => {
    return apiFetch<UserOut>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  requestRegistrationOTP: async (email: string, full_name?: string, phone?: string) => {
    return apiFetch("/api/v1/auth/register/otp/request", {
      method: "POST",
      body: JSON.stringify({ email, full_name, phone }),
    });
  },

  verifyRegistrationOTP: async (email: string, otp: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append("email", email);
    searchParams.append("otp", otp);

    const response = await apiFetch<Token>(`/api/v1/auth/register/otp/verify?${searchParams.toString()}`, {
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
    const searchParams = new URLSearchParams();
    searchParams.append("email", email);
    searchParams.append("otp", otp);

    const response = await apiFetch<Token>(`/api/v1/auth/passwordless/verify-otp?${searchParams.toString()}`, {
      method: "POST",
    }, { handle401: false });
    setAccessToken(response.access_token);
    return response;
  },

  verifyMagicLink: async (token: string): Promise<Token> => {
    return apiFetch<Token>(`/api/v1/auth/passwordless/verify?token=${encodeURIComponent(token)}`).then(data => {
      setAccessToken(data.access_token);
      return data;
    });
  },

  me: async (): Promise<UserOut> => {
    return apiFetch<UserOut>("/api/v1/auth/me");
  },

  updateProfile: async (data: UserUpdate): Promise<UserOut> => {
    return apiFetch<UserOut>("/api/v1/auth/me", {
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
    return apiFetch<Token>("/api/v1/auth/refresh", {
      method: "POST",
    }).then(data => {
      setAccessToken(data.access_token);
      return data;
    });
  },

  setPassword: async (newPassword: string, confirmPassword: string) => {
    return apiFetch("/api/v1/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword }),
    });
  },

  requestPasswordReset: async (email: string) => {
    return apiFetch(`/api/v1/auth/passwordless/request?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    return apiFetch("/api/v1/auth/set-password", {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
        new_password: newPassword,
        confirm_password: newPassword
      }),
    });
  },

  logout: () => setAccessToken(null),
};
