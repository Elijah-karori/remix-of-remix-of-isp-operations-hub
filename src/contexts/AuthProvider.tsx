import React, { useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api/auth";
import { rbacApi } from "@/lib/api/rbac";
import { getAccessToken, setAccessToken } from "@/lib/api/base";
import { UserOut } from "@/types/api";
import { AuthContext, AuthContextType } from "./AuthContext";

type User = UserOut;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    const fetchUserAndPermissions = useCallback(async (): Promise<boolean> => {
        const token = getAccessToken();
        if (!token) {
            setIsLoading(false);
            setIsAuthChecked(true);
            return false;
        }

        try {
            setIsLoading(true);
            
            // Use the new getProfile function to get all data at once
            const profileData = await authApi.getProfile();
            
            // Set user data
            setUser(profileData.user);
            
            // Set permissions (flatten the permissions array)
            const perms = profileData.permissions.map((p: any) => p.name || p.codename || p);
            setPermissions(perms);
            
            return true;
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
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
            setIsAuthChecked(true);
        }
    }, []);

    useEffect(() => {
        fetchUserAndPermissions();
    }, [fetchUserAndPermissions]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(email, password);
            setIsLoading(false);
            return response;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const requestOTP = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authApi.requestOTP(email, password);
            setIsLoading(false);
            return response;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const verifyOTP = async (email: string, otp: string, rememberMe = false) => {
        setIsLoading(true);
        try {
            await authApi.verifyOTPLogin(email, otp, rememberMe);
            const success = await fetchUserAndPermissions();
            if (!success) {
                throw new Error("Failed to fetch user data after OTP verification");
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
        setIsAuthChecked(true);
    };

    const parseV2Permissions = (userData: User | null): string[] => {
        if (!userData) return [];
        const v2Permissions = new Set<string>();
        userData.permissions_v2?.forEach(p => v2Permissions.add(p.name));
        userData.roles?.forEach(role => {
            role.permissions?.forEach(p => v2Permissions.add(p));
        });
        if (userData.role?.permissions) {
            userData.role.permissions.forEach(p => v2Permissions.add(p));
        }
        return Array.from(v2Permissions);
    };

    const hasPermission = (permission: string) => {
        if (!user) return false;
        if (user.is_superuser) return true;
        const v2Permissions = parseV2Permissions(user);
        const allPermissions = [...new Set([...v2Permissions, ...permissions])];
        if (allPermissions.includes("*") || allPermissions.includes(permission)) return true;
        const parts = permission.split(':');
        if (parts.length < 2) return false;
        const resource = parts[0];
        const action = parts[1];
        const requestedScope = parts[2] || 'all';
        if (allPermissions.includes(`${resource}:manage:all`)) return true;
        if (allPermissions.includes(`${resource}:manage:${requestedScope}`)) return true;
        if (allPermissions.includes(`${resource}:${action}:all`)) return true;
        if (requestedScope === 'own' && (
            allPermissions.includes(`${resource}:${action}:department`) ||
            allPermissions.includes(`${resource}:${action}:assigned`)
        )) return true;
        if (allPermissions.includes(`${resource}:${action}`)) return true;
        return false;
    };

    const refreshUser = async () => {
        await fetchUserAndPermissions();
    };

    const getProfile = async () => {
        return await authApi.getProfile();
    };

    const hasAnyPermission = (permissionsToCheck: string[]) => {
        return permissionsToCheck.some(permission => hasPermission(permission));
    };

    const getUserRoles = (): string[] => {
        if (!user) return [];
        const roles: string[] = [];
        user.roles_v2?.forEach(role => roles.push(role.name));
        user.roles?.forEach(role => roles.push(role.name));
        if (user.role?.name && !roles.includes(user.role.name)) {
            roles.push(user.role.name);
        }
        return [...new Set(roles)];
    };

    const getFilteredMenus = (): any[] => {
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
                requestOTP,
                verifyOTP,
                logout,
                hasPermission,
                hasAnyPermission,
                refreshUser,
                getProfile,
                getUserRoles,
                getFilteredMenus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
