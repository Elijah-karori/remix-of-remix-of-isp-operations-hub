import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, getAccessToken, setAccessToken, rbacApi, API_BASE_URL } from "@/lib/api";
import { checkBackendAndSetDemoMode, getDemoMode, clearDemoMode } from "@/lib/demo-mode";

interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  department_id?: number;
}

interface AuthContextType {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchUserAndPermissions = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const [userData, permissionsData] = await Promise.all([
        authApi.me() as Promise<User>,
        rbacApi.myPermissions() as Promise<{ permissions: string[] }>,
      ]);
      setUser(userData);
      setPermissions(permissionsData.permissions || []);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Only clear token on auth errors, not network errors
      if (error instanceof Error && error.message.includes("401")) {
        setAccessToken(null);
      }
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check backend availability and set demo mode on mount
  useEffect(() => {
    const initializeApp = async () => {
      const isDemo = await checkBackendAndSetDemoMode(API_BASE_URL);
      setIsDemoMode(isDemo);
      await fetchUserAndPermissions();
    };
    initializeApp();
  }, [fetchUserAndPermissions]);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    setIsDemoMode(getDemoMode());
    await fetchUserAndPermissions();
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setPermissions([]);
  };

  const exitDemoMode = () => {
    clearDemoMode();
    setIsDemoMode(false);
    logout();
    window.location.reload();
  };

  const hasPermission = (permission: string) => {
    return permissions.includes(permission) || permissions.includes("*");
  };

  const refreshUser = async () => {
    await fetchUserAndPermissions();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        isAuthenticated: !!user,
        isDemoMode,
        login,
        logout,
        hasPermission,
        refreshUser,
        exitDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
