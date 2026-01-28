import { Token } from '../../types/api';

export const API_BASE_URL = import.meta.env.DEV 
  ? '' // Use relative URLs in dev to leverage Vite proxy
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000");

// Token storage keys
const STORAGE_KEY = 'access_token';
const REMEMBER_KEY = 'remember_me';

// Token management with "Remember Me" support
let accessToken: string | null = null;

// Initialize token from storage on module load
const initializeToken = (): string | null => {
  // Check if "Remember Me" was enabled
  const rememberMe = localStorage.getItem(REMEMBER_KEY) === 'true';

  if (rememberMe) {
    // Use localStorage if "Remember Me" was enabled
    return localStorage.getItem(STORAGE_KEY);
  } else {
    // Use sessionStorage by default (more secure)
    return sessionStorage.getItem(STORAGE_KEY);
  }
};

accessToken = initializeToken();

/**
 * Set access token with optional "Remember Me" functionality
 * @param token - JWT access token or null to clear
 * @param rememberMe - If true, stores token in localStorage; otherwise sessionStorage
 */
export const setAccessToken = (token: string | null, rememberMe = false) => {
  accessToken = token;

  if (token) {
    // Store based on "Remember Me" preference
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, token);
      localStorage.setItem(REMEMBER_KEY, 'true');
      // Clear from sessionStorage to avoid conflicts
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, token);
      // Clear from localStorage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  } else {
    // Clear from both storages
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
};

export const getAccessToken = () => accessToken;

/**
 * Decode JWT token to get payload (without verification)
 * Note: This is for extracting user ID, not for security validation
 */
export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Get current user ID from JWT token
 */
export const getCurrentUserId = (): number | null => {
  const token = getAccessToken();
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  return decoded?.sub ? parseInt(decoded.sub) : null;
};

/**
 * Check if "Remember Me" is currently active
 */
export const isRememberMeActive = (): boolean => {
  return localStorage.getItem(REMEMBER_KEY) === 'true';
};

// API fetch wrapper with error handling
interface ApiFetchConfig {
  handle401?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  config: ApiFetchConfig = { handle401: true }
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const currentToken = getAccessToken();
  if (currentToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${currentToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && config.handle401) {
      console.log(`apiFetch: 401 detected for ${endpoint}, attempting refresh...`);
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentToken}`
          },
        });

        if (refreshResponse.ok) {
          const data: Token = await refreshResponse.json();
          setAccessToken(data.access_token);

          const retryHeaders = {
            ...headers,
            "Authorization": `Bearer ${data.access_token}`
          };
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: retryHeaders,
          });

          if (retryResponse.ok) {
            const text = await retryResponse.text();
            return text ? JSON.parse(text) : {} as T;
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      setAccessToken(null);
      // Only redirect if we're not already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error("Session expired. Please log in again.");
    }

    const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred" }));
    // Handle list of errors or single detail string as per FastAPI standards
    const errorMessage = Array.isArray(errorData.detail)
      ? errorData.detail[0].msg
      : (errorData.detail || `HTTP error ${response.status}`);

    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}
