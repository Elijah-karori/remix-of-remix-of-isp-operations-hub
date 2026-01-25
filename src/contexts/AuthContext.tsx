import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, getAccessToken, setAccessToken, rbacApi } from "@/lib/api";
import { UserOut } from "@/types/api";

type User = UserOut;

interface AuthContextType {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  refreshUser: () => Promise<void>;
  getUserRoles: () => string[];
  getFilteredMenus: () => MenuItem[];
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

        const perms = permissionsData.permissions.map((p: any) => p.name || p.codename);
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

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      // 1. Get token from login
      await authApi.login(email, password, rememberMe);

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

  const parseV2Permissions = (user: User | null): string[] => {
    if (!user || !user.roles_v2) return [];

    const v2Permissions = new Set<string>();

    // Direct permissions
    user.permissions_v2?.forEach(p => v2Permissions.add(p.name));

    // Permissions from roles
    user.roles_v2.forEach(role => {
      role.permissions?.forEach(p => v2Permissions.add(p.name));
    });

    return Array.from(v2Permissions);
  };

  const hasPermission = (permission: string) => {
    // V2 Permissions Check
    const v2Permissions = parseV2Permissions(user);
    if (v2Permissions.includes(permission)) return true;

    // Legacy Permissions Check
    if (permissions.includes("*")) return true;
    if (permissions.includes(permission)) return true;

    const parts = permission.split(':');
    if (parts.length >= 2) {
      const resource = parts[0];
      const action = parts[1];

      if (permissions.includes(`${resource}:${action}:all`)) return true;
      if (permissions.includes(`${resource}:manage:all`)) return true; // Broader manage permission
    }

    return false;
  };

  const refreshUser = async () => {
    await fetchUserAndPermissions();
  };

  const hasAnyPermission = (permissionsToCheck: string[]) => {
    return permissionsToCheck.some(permission => hasPermission(permission));
  };

  const getUserRoles = (): string[] => {
    if (!user) return [];
    const roles: string[] = [];

    // RBAC v2 roles
    user.roles_v2?.forEach(role => roles.push(role.name));

    // Legacy roles
    user.roles?.forEach(role => roles.push(role.name));

    // Single role
    if (user.role?.name && !roles.includes(user.role.name)) {
      roles.push(user.role.name);
    }

    return [...new Set(roles)];
  };

  const getFilteredMenus = (): MenuItem[] => {
    return user?.menus || [];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        isAuthenticated: !!user,
        isAuthChecked,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        refreshUser,
        getUserRoles,
        getFilteredMenus,
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