import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, getAccessToken, setAccessToken, rbacApi } from "@/lib/api";
import { UserOut } from "@/types/api";

type User = UserOut;

interface AuthContextType {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthChecked: boolean; // New: track if auth check is complete
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
  const [isAuthChecked, setIsAuthChecked] = useState(false); // Track if initial auth check is done

  const fetchUserAndPermissions = useCallback(async (): Promise<boolean> => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      setIsAuthChecked(true);
      return false;
    }

    try {
      setIsLoading(true);
      // Fetch user and permissions in sequence to ensure we have both
      const userData = await authApi.me() as User;
      console.log("Auth System - User Data (auth/me):", userData);
      setUser(userData);

      try {
        const permissionsData = await rbacApi.myPermissions();
        console.log("Auth System - Auth Token:", token);
        console.log("Auth System - RBAC Permissions Response:", permissionsData);

        const perms = permissionsData.permissions.map((p) => p.codename);
        console.log("Auth System - Parsed Permissions:", perms);
        setPermissions(perms);
      } catch (permError) {
        console.warn("Auth System - Failed to fetch permissions, using empty array:", permError);
        setPermissions([]);
      }

      return true;
    } catch (error) {
      console.error("Failed to fetch user:", error);

      // Clear invalid token
      if (error instanceof Error &&
        (error.message.includes("Session expired") ||
          error.message.includes("401") ||
          error.message.includes("Unauthorized"))) {
        setAccessToken(null);
        setUser(null);
        setPermissions([]);
      }
      return false;
    } finally {
      setIsLoading(false);
      setIsAuthChecked(true); // Mark auth check as complete
    }
  }, []);

  // Fetch user and permissions on mount
  useEffect(() => {
    fetchUserAndPermissions();
  }, [fetchUserAndPermissions]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Get token from login
      await authApi.login(email, password);

      // 2. Fetch user data and permissions
      const success = await fetchUserAndPermissions();
      if (!success) {
        throw new Error("Failed to fetch user data after login");
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setPermissions([]);
    setIsAuthChecked(true); // Still mark as checked
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
        isAuthChecked, // Expose this
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