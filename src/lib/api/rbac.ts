import { PermissionCheckResponse, MyPermissionsResponse, RoleHierarchy, IndependentRoleOut, FuzzyMatchResult, AccessPolicyOut, FeaturePolicyRequest, UserStatusUpdateRequest } from '../../types/api';
import { apiFetch } from './base';

export const rbacApi = {
  checkPermission: async (permission: string): Promise<PermissionCheckResponse> => {
    return apiFetch<PermissionCheckResponse>(`/api/v1/rbac/check?permission=${encodeURIComponent(permission)}`);
  },

  checkBatch: async (permissions: string[]): Promise<Record<string, boolean>> => {
    return apiFetch<Record<string, boolean>>("/api/v1/rbac/check-batch", {
      method: "POST",
      body: JSON.stringify({ permissions })
    });
  },

  myPermissions: async (): Promise<MyPermissionsResponse> => {
    return apiFetch<MyPermissionsResponse>("/api/v1/rbac/my-permissions");
  },
};

export const managementApi = {
  // RBAC Hierarchy & Roles
  getRoleHierarchy: () =>
    apiFetch<RoleHierarchy[]>("/api/v1/api/v1/rbac/v2/hierarchy/tree"),

  getSortedRoles: (sortBy = "name", algorithm = "merge") =>
    apiFetch(`/api/v1/management/rbac/roles/sorted?sort_by=${sortBy}&algorithm=${algorithm}`),

  getSortedUsers: (sortBy = "email", algorithm = "quick") =>
    apiFetch(`/api/v1/management/rbac/users/sorted?sort_by=${sortBy}&algorithm=${algorithm}`),

  activateRole: (roleId: number) =>
    apiFetch(`/api/v1/management/rbac/roles/${roleId}/activate`, { method: "POST" }),

  resolveFuzzyRole: (roleName: string, threshold = 0.7) =>
    apiFetch<FuzzyMatchResult[]>(`/api/v1/management/rbac/roles/resolve-fuzzy?role_name=${encodeURIComponent(roleName)}&threshold=${threshold}`),

  analyzeIndependentRole: (roleName?: string) => {
    const params = roleName ? `?role_name=${encodeURIComponent(roleName)}` : '';
    return apiFetch<IndependentRoleOut[]>(`/api/v1/management/rbac/roles/analyze-independent${params}`);
  },

  // Access Policies
  listAccessPolicies: () =>
    apiFetch<AccessPolicyOut[]>("/api/v1/api/v1/rbac/v2/policies"),

  createAccessPolicy: (data: any) =>
    apiFetch<AccessPolicyOut>("/api/v1/management/access-policies", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getAccessPolicy: (id: number) =>
    apiFetch<AccessPolicyOut>(`/api/v1/management/access-policies/${id}`),

  updateAccessPolicy: (id: number, data: any) =>
    apiFetch<AccessPolicyOut>(`/api/v1/management/access-policies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteAccessPolicy: (id: number) =>
    apiFetch(`/api/v1/management/access-policies/${id}`, { method: "DELETE" }),

  createTimeLimitedPolicy: (data: any) =>
    apiFetch<AccessPolicyOut>("/api/v1/management/rbac/policies", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // User Management
  updateUserStatus: (userId: number, data: UserStatusUpdateRequest) =>
    apiFetch(`/api/v1/management/rbac/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),

  verifyOTP: (data: { user_id: number; code: string; purpose: string }) =>
    apiFetch("/api/v1/management/rbac/verify-otp", {
      method: "POST",
      body: JSON.stringify(data)
    }),
};

export const policyApi = {
  buildFeaturePolicy: (data: FeaturePolicyRequest) =>
    apiFetch("/api/v1/management/policies/features", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  bootstrapStandardRoles: () =>
    apiFetch("/api/v1/management/policies/bootstrap/roles", { method: "POST" }),
};

export const permissionsApi = {
  roles: () =>
    apiFetch("/api/v1/permissions/roles"),

  permissions: () =>
    apiFetch("/api/v1/permissions/permissions"),

  myPermissions: () =>
    apiFetch("/api/v1/permissions/my-permissions"),

  assignRole: (userId: number, roleId: number) =>
    apiFetch(`/api/v1/permissions/assign?user_id=${userId}&role_id=${roleId}`, { method: "POST" }),
};
