import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { rbacApi, managementApi, permissionsApi, usersApi } from '@/lib/api';
import {
  PermissionCheckResponse,
  MyPermissionsResponse,
  RoleHierarchyOut,
  IndependentRoleOut,
  PermissionV2Out, // Assuming this is for listing all permissions
  UserOut, // For assigning roles to users
  AccessPolicyOut, AccessPolicyCreate, AccessPolicyUpdate // For policies
} from '@/types/api';
import { toast } from 'sonner';

// --- RBAC General Hooks ---

export const useMyPermissions = () => {
  return useQuery<MyPermissionsResponse>({
    queryKey: ['rbac', 'my-permissions'],
    queryFn: () => rbacApi.myPermissions(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useCheckPermission = (permission: string) => {
  return useQuery<PermissionCheckResponse>({
    queryKey: ['rbac', 'check-permission', permission],
    queryFn: () => rbacApi.checkPermission(permission),
    staleTime: 5 * 60 * 1000,
    enabled: !!permission, // Only run query if permission is provided
  });
};

export const useCheckPermissionsBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissions: string[]) => rbacApi.checkBatch(permissions),
    onSuccess: () => {
      // Invalidate relevant queries if batch check implies a state change
      queryClient.invalidateQueries({ queryKey: ['rbac', 'my-permissions'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to check permissions batch: ${error.message || 'Unknown error'}`);
    },
  });
};

// --- Role Management Hooks ---

export const useRoleHierarchy = () => {
  return useQuery<RoleHierarchyOut[]>({
    queryKey: ['management', 'rbac', 'role-hierarchy'],
    queryFn: () => managementApi.getRoleHierarchy(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useIndependentRoles = () => {
  return useQuery<IndependentRoleOut[]>({
    queryKey: ['management', 'rbac', 'independent-roles'],
    queryFn: () => managementApi.analyzeIndependentRole(), // Assuming this lists all independent roles
    staleTime: 5 * 60 * 1000,
  });
};

// Assuming managementApi or permissionsApi would have CRUD for roles, if not, these are stubs
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (newRole: any) => managementApi.createRole(newRole), // Placeholder
    mutationFn: (newRole: any) => { console.warn("Placeholder: Role creation API not defined."); return Promise.resolve(newRole); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'rbac', 'role-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['management', 'rbac', 'independent-roles'] });
      toast.success('Role created successfully (placeholder).');
    },
    onError: (error: any) => {
      toast.error(`Failed to create role: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ id, data }: { id: number; data: any }) => managementApi.updateRole(id, data), // Placeholder
    mutationFn: ({ id, data }: { id: number; data: any }) => { console.warn("Placeholder: Role update API not defined."); return Promise.resolve(data); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'rbac', 'role-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['management', 'rbac', 'independent-roles'] });
      toast.success('Role updated successfully (placeholder).');
    },
    onError: (error: any) => {
      toast.error(`Failed to update role: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (id: number) => managementApi.deleteRole(id), // Placeholder
    mutationFn: (id: number) => { console.warn("Placeholder: Role deletion API not defined."); return Promise.resolve(id); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'rbac', 'role-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['management', 'rbac', 'independent-roles'] });
      toast.success('Role deleted successfully (placeholder).');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete role: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useActivateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: number) => managementApi.activateRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'rbac', 'role-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['management', 'rbac', 'independent-roles'] });
      toast.success('Role activated successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to activate role: ${error.message || 'Unknown error'}`);
    },
  });
};

// --- Permissions Hooks (for all available permissions) ---

export const usePermissions = () => {
  return useQuery<PermissionV2Out[]>({
    queryKey: ['permissions', 'all'],
    queryFn: () => permissionsApi.permissions(),
    staleTime: 5 * 60 * 1000,
  });
};

// --- User-Role Assignment Hooks ---

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) => permissionsApi.assignRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate user list to reflect role changes
      toast.success('Role assigned successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to assign role: ${error.message || 'Unknown error'}`);
    },
  });
};

// Assuming there might be an unassign role endpoint or it's handled via user update
export const useUnassignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) => permissionsApi.unassignRole(userId, roleId), // Placeholder
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) => { console.warn("Placeholder: Role unassignment API not defined."); return Promise.resolve({ userId, roleId }); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role unassigned successfully (placeholder).');
    },
    onError: (error: any) => {
      toast.error(`Failed to unassign role: ${error.message || 'Unknown error'}`);
    },
  });
};

// --- Access Policy Hooks ---

export const useListAccessPolicies = () => {
  return useQuery<AccessPolicyOut[]>({
    queryKey: ['management', 'access-policies'],
    queryFn: () => managementApi.listAccessPolicies(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAccessPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPolicy: AccessPolicyCreate) => managementApi.createAccessPolicy(newPolicy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'access-policies'] });
      toast.success('Access Policy created successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to create access policy: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateAccessPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccessPolicyUpdate }) => managementApi.updateAccessPolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'access-policies'] });
      toast.success('Access Policy updated successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to update access policy: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteAccessPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => managementApi.deleteAccessPolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'access-policies'] });
      toast.success('Access Policy deleted successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete access policy: ${error.message || 'Unknown error'}`);
    },
  });
};

// --- User Hooks (for use in assignment) ---
export const useUsersList = (skip = 0, limit = 100) => {
  return useQuery<UserOut[]>({
    queryKey: ['users', 'list', skip, limit],
    queryFn: () => usersApi.list().then(response => response.users), // Assuming usersApi.list returns { users: UserOut[] }
    staleTime: 5 * 60 * 1000,
  });
};

// --- Other Policy Hooks ---

export const useCreateTimeLimitedPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policyData: any) => managementApi.createTimeLimitedPolicy(policyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'access-policies'] });
      toast.success('Time-limited policy created successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to create time-limited policy: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useBuildFeaturePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (featurePolicy: any) => policyApi.buildFeaturePolicy(featurePolicy), // Corrected API call
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'access-policies'] });
      toast.success('Feature policy built successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to build feature policy: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useBootstrapStandardRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => policyApi.bootstrapStandardRoles(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'rbac', 'role-hierarchy'] });
      toast.success('Standard roles bootstrapped successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to bootstrap standard roles: ${error.message || 'Unknown error'}`);
    },
  });
};