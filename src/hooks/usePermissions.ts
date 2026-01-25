/**
 * Comprehensive permission hooks library
 */

import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

/**
 * Check if user has a specific permission
 */
export const usePermission = (permission: string): boolean => {
    const { hasPermission } = useAuth();
    return hasPermission(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const useAnyPermission = (permissions: string[]): boolean => {
    const { hasPermission } = useAuth();
    return useMemo(
        () => permissions.some((p) => hasPermission(p)),
        [permissions, hasPermission]
    );
};

/**
 * Check if user has all of the specified permissions
 */
export const useAllPermissions = (permissions: string[]): boolean => {
    const { hasPermission } = useAuth();
    return useMemo(
        () => permissions.every((p) => hasPermission(p)),
        [permissions, hasPermission]
    );
};

/**
 * Get all permissions for a specific resource
 */
export const useResourcePermissions = (resource: string) => {
    const { hasPermission } = useAuth();

    return useMemo(
        () => ({
            canCreate: hasPermission(`${resource}:create`) || hasPermission(`${resource}:create:all`),
            canRead: hasPermission(`${resource}:read`) || hasPermission(`${resource}:read:all`),
            canUpdate: hasPermission(`${resource}:update`) || hasPermission(`${resource}:update:all`),
            canDelete: hasPermission(`${resource}:delete`) || hasPermission(`${resource}:delete:all`),
            canManage: hasPermission(`${resource}:manage`) || hasPermission(`${resource}:manage:all`),
        }),
        [resource, hasPermission]
    );
};

/**
 * Check if user has a specific role
 */
export const useRoleCheck = (roleName: string): boolean => {
    const { user } = useAuth();

    return useMemo(() => {
        if (!user) return false;

        // Check RBAC v2 roles
        if (user.roles_v2?.some((role) => role.name === roleName)) {
            return true;
        }

        // Check legacy roles
        if (user.roles?.some((role) => role.name === roleName)) {
            return true;
        }

        // Check single role field
        if (user.role?.name === roleName) {
            return true;
        }

        return false;
    }, [user, roleName]);
};

/**
 * Get all user roles
 */
export const useUserRoles = (): string[] => {
    const { user } = useAuth();

    return useMemo(() => {
        if (!user) return [];

        const roles: string[] = [];

        // Add RBAC v2 roles
        user.roles_v2?.forEach((role) => roles.push(role.name));

        // Add legacy roles
        user.roles?.forEach((role) => roles.push(role.name));

        // Add single role
        if (user.role?.name && !roles.includes(user.role.name)) {
            roles.push(user.role.name);
        }

        return [...new Set(roles)]; // Remove duplicates
    }, [user]);
};

/**
 * Common permission checks for typical resources
 */
export const useCommonPermissions = () => {
    const { hasPermission } = useAuth();

    return useMemo(
        () => ({
            // User management
            canManageUsers: hasPermission('users:manage:all') || hasPermission('users:*'),
            canCreateUsers: hasPermission('users:create:all'),
            canViewUsers: hasPermission('users:read:all'),

            // Finance
            canManageFinance: hasPermission('finance:manage:all') || hasPermission('finance:*'),
            canApproveTransactions: hasPermission('finance:approve:all'),
            canViewFinancials: hasPermission('finance:read:all'),

            // Projects
            canManageProjects: hasPermission('project:manage:all') || hasPermission('project:*'),
            canCreateProjects: hasPermission('project:create:all'),
            canViewProjects: hasPermission('project:read:all'),

            // Inventory
            canManageInventory: hasPermission('inventory:manage:all') || hasPermission('inventory:*'),
            canUpdateInventory: hasPermission('inventory:update:all'),
            canViewInventory: hasPermission('inventory:read:all'),

            // HR
            canManageHR: hasPermission('hr:manage:all') || hasPermission('hr:*'),
            canViewPayroll: hasPermission('hr:payroll:read'),
            canApproveLeave: hasPermission('hr:leave:approve'),

            // Audit
            canViewAudit: hasPermission('audit:read:all') || hasPermission('audit:*'),
            canExportAudit: hasPermission('audit:export'),

            // Workflows
            canManageWorkflows: hasPermission('workflow:manage:all') || hasPermission('workflow:*'),
            canExecuteWorkflows: hasPermission('workflow:execute'),

            // System
            canManageRoles: hasPermission('rbac:manage:all'),
            canManagePermissions: hasPermission('rbac:permissions:manage'),
            canViewSystemSettings: hasPermission('system:settings:read'),
        }),
        [hasPermission]
    );
};

/**
 * Check if user is superuser
 */
export const useIsSuperuser = (): boolean => {
    const { user } = useAuth();
    return user?.is_superuser ?? false;
};

/**
 * Check if user is active
 */
export const useIsActive = (): boolean => {
    const { user } = useAuth();
    return user?.is_active ?? false;
};

/**
 * Get user department ID
 */
export const useUserDepartment = (): number | undefined => {
    const { user } = useAuth();
    return user?.department_id;
};
