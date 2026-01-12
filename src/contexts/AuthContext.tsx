import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, getAccessToken, setAccessToken, rbacApi } from "@/lib/api";

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setAccessToken(null);
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAndPermissions();
  }, [fetchUserAndPermissions]);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    await fetchUserAndPermissions();
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setPermissions([]);
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
        login,
        logout,
        hasPermission,
        refreshUser,
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
