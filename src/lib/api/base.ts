import { Token } from '../../types/api';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Token management
let accessToken: string | null = localStorage.getItem("access_token");

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
};

export const getAccessToken = () => accessToken;

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
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      window.location.href = '/login';
      throw new Error("Session expired. Please log in again.");
    }

    const error = await response.json().catch(() => ({ detail: "An unknown error occurred" }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}
