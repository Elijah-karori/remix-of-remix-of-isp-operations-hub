import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * A component that only renders its children if the current user has the specified permission.
 * Supports both single string and wildcard permissions.
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
    const { hasPermission, isLoading } = useAuth();

    if (isLoading) return null;

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}

/**
 * A hook that provides a collection of permission checking utilities.
 */
export function usePermissions() {
    const { hasPermission, permissions } = useAuth();

    return {
        hasPermission,
        allPermissions: permissions,
        canManageUsers: hasPermission("users:manage") || hasPermission("users:*"),
        canManageFinance: hasPermission("finance:manage") || hasPermission("finance:*"),
        canManageInventory: hasPermission("inventory:manage") || hasPermission("inventory:*"),
        canManageWorkflows: hasPermission("workflow:manage") || hasPermission("workflow:*"),
        canViewAudit: hasPermission("audit:read") || hasPermission("audit:*"),
    };
}
