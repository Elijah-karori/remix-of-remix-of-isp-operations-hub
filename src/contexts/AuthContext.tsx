import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, getAccessToken, setAccessToken, rbacApi } from "@/lib/api";
import { UserOut } from "@/types/api";

// Local alias if needed, or just use UserOut
type User = UserOut;


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
        rbacApi.myPermissions() as Promise<{ permissions: { codename: string }[] }>,
      ]);
      setUser(userData);
      // Map PermissionDetail objects to codename strings
      setPermissions(permissionsData.permissions.map((p) => p.codename));
    } catch (error) {
      console.error("Failed to fetch user:", error);

      // Handle auth errors
      if (error instanceof Error) {
        if (error.message.includes("Session expired") || error.message.includes("401")) {
          setAccessToken(null);
          setUser(null);
          setPermissions([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user and permissions on mount
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
