import React, { createContext, useContext } from "react";
import { UserOut } from "@/types/api";

type User = UserOut;

export interface AuthContextType {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  login: (email: string, password: string) => Promise<{ status: string }>;
  requestOTP: (email: string, password: string) => Promise<{ message: string }>;
  verifyOTP: (email: string, otp: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  refreshUser: () => Promise<void>;
  getProfile: () => Promise<any>;
  getUserRoles: () => string[];
  getFilteredMenus: () => any[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
