import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Shield, Users, ChevronRight, Loader2, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleHierarchyOut, IndependentRoleOut, PermissionV2Out, UserOut, AccessPolicyOut } from '@/types/api';
import {
  useMyPermissions,
  useRoleHierarchy,
  useIndependentRoles,
  usePermissions as useAllPermissions,
  useUsersList,
  useAssignRole, useUnassignRole,
  useListAccessPolicies, useCreateAccessPolicy, useUpdateAccessPolicy, useDeleteAccessPolicy,
  useCreateRole, useUpdateRole, useDeleteRole, useActivateRole
} from '@/hooks/use-rbac';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define AccessPolicyCreate interface
interface AccessPolicyCreate {
  name: string;
  description?: string;
  resource: string;
  action: string;
  priority: number;
  is_active: boolean;
  // Add other properties if they exist in your API for creating policies
  // For example:
  // required_roles?: number[];
  // required_permissions?: number[];
  // conditions?: string;
}

export default function Permissions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleHierarchyOut | IndependentRoleOut | null>(null);

  const { data: myPermissions, isLoading: loadingMyPerms, refetch: refetchMyPerms } = useMyPermissions();
  const { data: hierarchy, isLoading: loadingHierarchy, refetch: refetchHierarchy } = useRoleHierarchy();
  const { data: independentRoles, isLoading: loadingIndependent, refetch: refetchIndependentRoles } = useIndependentRoles();
  
  const filteredPermissions = myPermissions?.permissions?.filter(permission =>
    permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.codename?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    const [category] = perm.codename?.split(':') || ['other'];
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, typeof filteredPermissions>);

  const renderRoleNode = (node: RoleHierarchyOut, depth: number = 0) => (
    <div key={node.role.id} className="mb-2">
      <div
        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${selectedRole && 'role' in selectedRole && selectedRole.role?.id === node.role.id ? 'bg-primary/10 border-primary' : ''
          }`}
        style={{ marginLeft: `${depth * 24}px` }}
        onClick={() => setSelectedRole(node)}
      >
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-medium">{node.role.name}</span>
        {node.role.scopes && node.role.scopes.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {node.role.scopes.length} scopes
          </Badge>
        )}
        {node.children && node.children.length > 0 && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      {node.children && node.children.map((child, idx) => renderRoleNode(child, depth + 1))}
    </div>
  );

  const isLoading = loadingMyPerms || loadingHierarchy || loadingIndependent;

  // State for Role Management
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<IndependentRoleOut | null>(null);
  const [isDeleteRoleAlertDialogOpen, setIsDeleteRoleAlertDialogOpen] = useState(false);
  const [roleToDeleteId, setRoleToDeleteId] = useState<number | null>(null);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleScopes, setNewRoleScopes] = useState<string[]>([]);
  const [newRoleParentId, setNewRoleParentId] = useState<number | null>(null);

  const [editRoleForm, setEditRoleForm] = useState<{
    id: number;
    name: string;
    description: string;
    scopes: string[];
    parentId: number | null;
  } | null>(null);

  // Hooks for Role Management
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const activateRoleMutation = useActivateRole();
  const { data: allPermissionsData } = useAllPermissions(); // Renamed to avoid confusion with `permissionsArray`

  // Combined list of roles for management UI
  const allRoles = useMemo(() => {
    const hierarchical = hierarchy?.map(node => node.role) || [];
    const independent = independentRoles || [];
    return [...hierarchical, ...independent].filter((role, index, self) =>
      index === self.findIndex((r) => r.id === role.id)
    );
  }, [hierarchy, independentRoles]);

  // State and Hooks for User-Role Assignment
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<UserOut | null>(null);
  const [rolesToAssign, setRolesToAssign] = useState<number[]>([]);
  const [rolesToUnassign, setRolesToUnassign] = useState<number[]>([]);

  const { data: usersData, isLoading: loadingUsers } = useUsersList();
  const assignRoleMutation = useAssignRole();
  const unassignRoleMutation = useUnassignRole();

  const filteredUsers = usersData?.filter(user =>
    user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  ) || [];

  const handleAssignRoles = async () => {
    if (!selectedUserForAssignment || rolesToAssign.length === 0) {
      toast.error("Please select a user and roles to assign.");
      return;
    }
    try {
      for (const roleId of rolesToAssign) {
        await assignRoleMutation.mutateAsync({ userId: selectedUserForAssignment.id, roleId });
      }
      toast.success(`Roles assigned to ${selectedUserForAssignment.full_name || selectedUserForAssignment.email}`);
      setRolesToAssign([]);
      setSelectedUserForAssignment(prev => prev ? { ...prev, roles_v2: [...(prev.roles_v2 || []), ...allRoles.filter(r => rolesToAssign.includes(r.id)).map(r => ({ id: r.id, name: r.name, scopes: r.scopes }))] } : null);
    } catch (error: any) {
      toast.error(`Failed to assign roles: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUnassignRoles = async () => {
    if (!selectedUserForAssignment || rolesToUnassign.length === 0) {
      toast.error("Please select a user and roles to unassign.");
      return;
    }
    try {
      for (const roleId of rolesToUnassign) {
        await unassignRoleMutation.mutateAsync({ userId: selectedUserForAssignment.id, roleId });
      }
      toast.success(`Roles unassigned from ${selectedUserForAssignment.full_name || selectedUserForAssignment.email}`);
      setSelectedUserForAssignment(prev => prev ? { ...prev, roles_v2: (prev.roles_v2 || []).filter(r => !rolesToUnassign.includes(r.id)) } : null);
    } catch (error: any) {
      toast.error(`Failed to unassign roles: ${error.message || 'Unknown error'}`);
    }
  };

  // State for Access Policy Management
  const [isCreatePolicyDialogOpen, setIsCreatePolicyDialogOpen] = useState(false);
  const [isEditPolicyDialogOpen, setIsEditPolicyDialogOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState<AccessPolicyOut | null>(null);
  const [isDeletePolicyAlertDialogOpen, setIsDeletePolicyAlertDialogOpen] = useState(false);
  const [policyToDeleteId, setPolicyToDeleteId] = useState<number | null>(null);

  const [newPolicyForm, setNewPolicyForm] = useState<AccessPolicyCreate>({
    name: '',
    description: '',
    resource: '',
    action: '',
    priority: 0,
    is_active: true,
  });

  const [editPolicyForm, setEditPolicyForm] = useState<AccessPolicyOut | null>(null);

  // Hooks for Access Policy Management
  const { data: policiesData, isLoading: loadingPolicies, refetch: refetchPolicies } = useListAccessPolicies();
  const createAccessPolicyMutation = useCreateAccessPolicy();
  const updateAccessPolicyMutation = useUpdateAccessPolicy();
  const deleteAccessPolicyMutation = useDeleteAccessPolicy();

  const handleCreatePolicy = async () => {
    try {
      await createAccessPolicyMutation.mutateAsync(newPolicyForm);
      toast.success('Access Policy created successfully.');
      setIsCreatePolicyDialogOpen(false);
      setNewPolicyForm({
        name: '',
        description: '',
        resource: '',
        action: '',
        priority: 0,
        is_active: true,
      });
    } catch (error: any) {
      toast.error(`Failed to create policy: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEditPolicy = async () => {
    if (!editPolicyForm) return;
    try {
      await updateAccessPolicyMutation.mutateAsync({ id: editPolicyForm.id, data: editPolicyForm });
      toast.success('Access Policy updated successfully.');
      setIsEditPolicyDialogOpen(false);
      setEditPolicyForm(null);
    } catch (error: any) {
      toast.error(`Failed to update policy: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeletePolicy = async () => {
    if (!policyToDeleteId) return;
    try {
      await deleteAccessPolicyMutation.mutateAsync(policyToDeleteId);
      toast.success('Access Policy deleted successfully.');
      setIsDeletePolicyAlertDialogOpen(false);
      setPolicyToDeleteId(null);
    } catch (error: any) {
      toast.error(`Failed to delete policy: ${error.message || 'Unknown error'}`);
    }
  };

  // Initialize editRoleForm when roleToEdit changes
  useEffect(() => {
    if (roleToEdit && isEditRoleDialogOpen) {
      setEditRoleForm({
        id: roleToEdit.id,
        name: roleToEdit.name,
        description: roleToEdit.description || '',
        scopes: roleToEdit.scopes || [],
        parentId: null, // You may need to adjust this based on your data structure
      });
    }
  }, [roleToEdit, isEditRoleDialogOpen]);

  // Initialize editPolicyForm when policyToEdit changes
  useEffect(() => {
    if (policyToEdit && isEditPolicyDialogOpen) {
      setEditPolicyForm(policyToEdit);
    }
  }, [policyToEdit, isEditPolicyDialogOpen]);

  // Get permissions array from allPermissions (handle both array and object structures)
  const permissionsArray = useMemo(() => {
    if (!allPermissionsData) return [];
    if (Array.isArray(allPermissionsData)) return allPermissionsData;
    if (allPermissionsData.permissions && Array.isArray(allPermissionsData.permissions)) {
      return allPermissionsData.permissions;
    }
    return [];
  }, [allPermissionsData]);

  return (
    <DashboardLayout title="Permissions" subtitle="Manage roles and access control">
      <div className="space-y-6">
        <Tabs defaultValue="my-permissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              My Permissions
            </TabsTrigger>
            <TabsTrigger value="role-hierarchy" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Role Hierarchy
            </TabsTrigger>
            <TabsTrigger value="role-management" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role Management
            </TabsTrigger>
            <TabsTrigger value="user-role-assignment" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User-Role Assignment
            </TabsTrigger>
            <TabsTrigger value="access-policies" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Access Policies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Permissions</CardTitle>
                    <CardDescription>
                      {myPermissions?.count || 0} permissions assigned to your account
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search permissions..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingMyPerms ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : Object.keys(groupedPermissions).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium capitalize text-sm text-muted-foreground">
                          {category.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {perms.map((perm) => (
                            <Badge key={perm.codename} variant="secondary" className="font-mono text-xs">
                              {perm.codename}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No permissions found matching your search.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="role-hierarchy" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Role Hierarchy</CardTitle>
                      <CardDescription>
                        Hierarchical view of all roles in the system
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetchHierarchy()}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingHierarchy ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : hierarchy?.length ? (
                    <div className="space-y-2">
                      {hierarchy.map(node => renderRoleNode(node))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      No role hierarchy found.
                    </p>
                  )}

                  {independentRoles && independentRoles.length > 0 ? (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground">Independent Roles</h4>
                      <div className="space-y-2">
                        {independentRoles.map(role => (
                          <div
                            key={role.id}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${selectedRole && 'id' in selectedRole && selectedRole.id === role.id ? 'bg-primary/10 border-primary' : ''
                              }`}
                            onClick={() => setSelectedRole(role)}
                          >
                            <Shield className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">{role.name}</span>
                            <Badge variant="outline" className="ml-auto">
                              Level {role.level}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : independentRoles && independentRoles.length === 0 ? (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-center py-8 text-muted-foreground">No independent roles found.</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role Details</CardTitle>
                  <CardDescription>
                    {selectedRole ? 'View role information and permissions' : 'Select a role to view details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRole ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Role Name</h4>
                        <p className="text-lg font-semibold">
                          {'role' in selectedRole ? selectedRole.role.name : selectedRole.name}
                        </p>
                      </div>

                      {'role' in selectedRole ? (
                        <>
                          {selectedRole.role.description && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                              <p>{selectedRole.role.description}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Depth</h4>
                            <p>Level {selectedRole.depth}</p>
                          </div>
                          {selectedRole.role.scopes && selectedRole.role.scopes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Scopes</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedRole.role.scopes.map((scope, idx) => (
                                  <Badge key={`${scope}-${idx}`} variant="secondary">{scope}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {selectedRole.description && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                              <p>{selectedRole.description}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Level</h4>
                              <p>{selectedRole.level}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                              <Badge variant={selectedRole.status === 'active' ? 'default' : 'secondary'}>
                                {selectedRole.status}
                              </Badge>
                            </div>
                          </div>
                          {selectedRole.permissions && selectedRole.permissions.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Permissions ({selectedRole.permissions.length})</h4>
                              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                                {selectedRole.permissions.map((perm: PermissionV2Out) => (
                                  <Badge key={perm.id} variant="outline" className="font-mono text-xs">
                                    {perm.codename}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <p>Click on a role to view its details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="role-management" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>Create, update, and delete roles.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsCreateRoleDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> New Role
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : allRoles && allRoles.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell>{role.description || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={role.status === 'active' ? 'default' : 'secondary'}>
                                {role.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{role.level}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => { setRoleToEdit(role); setIsEditRoleDialogOpen(true); }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setRoleToDeleteId(role.id); setIsDeleteRoleAlertDialogOpen(true); }}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => activateRoleMutation.mutate(role.id)}>
                                  {role.status === 'active' ? 'Deactivate' : 'Activate'}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No roles found. Create a new role to get started.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-role-assignment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User-Role Assignment</CardTitle>
                <CardDescription>Assign and unassign roles to users.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                    </div>
                    {loadingUsers ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredUsers && filteredUsers.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredUsers.map(user => (
                          <div
                            key={user.id}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${selectedUserForAssignment?.id === user.id ? 'bg-primary/10 border-primary' : ''
                              }`}
                            onClick={() => setSelectedUserForAssignment(user)}
                          >
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{user.full_name || user.email}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">No users found.</p>
                    )}
                  </div>

                  {selectedUserForAssignment && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Selected User</h4>
                        <p className="text-lg font-semibold">{selectedUserForAssignment.full_name || selectedUserForAssignment.email}</p>
                        <p className="text-sm text-muted-foreground">{selectedUserForAssignment.email}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Roles</h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedUserForAssignment.roles_v2 || []).length > 0 ? (
                            (selectedUserForAssignment.roles_v2 || []).map(role => (
                              <Badge key={role.id} variant="default">{role.name}</Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">No roles assigned.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Available Roles</h4>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto rounded-md border p-2">
                          {allRoles.map(role => (
                            <Badge
                              key={role.id}
                              variant={rolesToAssign.includes(role.id) ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => {
                                setRolesToAssign(prev =>
                                  prev.includes(role.id)
                                    ? prev.filter(r => r !== role.id)
                                    : [...prev, role.id]
                                );
                              }}
                            >
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button onClick={handleAssignRoles} disabled={assignRoleMutation.isPending || rolesToAssign.length === 0}>
                        {assignRoleMutation.isPending ? "Assigning..." : "Assign Selected Roles"}
                      </Button>
                      <Button variant="outline" onClick={handleUnassignRoles} disabled={unassignRoleMutation.isPending || rolesToUnassign.length === 0}>
                        {unassignRoleMutation.isPending ? "Unassigning..." : "Unassign Selected Roles"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access-policies" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Access Policies</CardTitle>
                  <CardDescription>Manage fine-grained access policies.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsCreatePolicyDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> New Policy
                </Button>
              </CardHeader>
              <CardContent>
                {loadingPolicies ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : policiesData && policiesData.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Resource</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(policiesData || []).map((policy) => (
                          <TableRow key={policy.id}>
                            <TableCell className="font-medium">{policy.name}</TableCell>
                            <TableCell>{policy.resource}</TableCell>
                            <TableCell>{policy.action}</TableCell>
                            <TableCell>{policy.priority}</TableCell>
                            <TableCell>
                              <Badge variant={policy.is_active ? 'default' : 'secondary'}>
                                {policy.is_active ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => { setPolicyToEdit(policy); setIsEditPolicyDialogOpen(true); }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setPolicyToDeleteId(policy.id); setIsDeletePolicyAlertDialogOpen(true); }}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No access policies found. Create a new policy to get started.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Define a new role with its permissions and hierarchy.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newRoleName" className="text-right">Name</Label>
              <Input
                id="newRoleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newRoleDescription" className="text-right">Description</Label>
              <Input
                id="newRoleDescription"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Parent Role</Label>
              <Select value={newRoleParentId?.toString() || ""} onValueChange={(value) => setNewRoleParentId(parseInt(value) || null)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select parent role (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">No Parent</SelectItem>
                  {allRoles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Scopes/Permissions</Label>
              <div className="col-span-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto rounded-md border p-2">
                {permissionsArray.map((perm, idx) => (
                  <Badge
                    key={`${perm.codename}-${idx}`}
                    variant={newRoleScopes.includes(perm.codename) ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => {
                      setNewRoleScopes(prev =>
                        prev.includes(perm.codename)
                          ? prev.filter(s => s !== perm.codename)
                          : [...prev, perm.codename]
                      );
                    }}
                  >
                    {perm.codename}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => createRoleMutation.mutate({
                name: newRoleName,
                description: newRoleDescription,
                scopes: newRoleScopes,
                parent_id: newRoleParentId,
              })}
              disabled={createRoleMutation.isPending || !newRoleName}
            >
              {createRoleMutation.isPending ? "Creating..." : "Create Role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the role's information and permissions.</DialogDescription>
          </DialogHeader>
          {editRoleForm && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRoleName" className="text-right">Name</Label>
                <Input
                  id="editRoleName"
                  value={editRoleForm.name}
                  onChange={(e) => setEditRoleForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRoleDescription" className="text-right">Description</Label>
                <Input
                  id="editRoleDescription"
                  value={editRoleForm.description}
                  onChange={(e) => setEditRoleForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Parent Role</Label>
                <Select value={editRoleForm.parentId?.toString() || "null"} onValueChange={(value) => setEditRoleForm(prev => prev ? { ...prev, parentId: parseInt(value) || null } : null)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select parent role (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">No Parent</SelectItem>
                    {allRoles.filter(role => role.id !== editRoleForm.id).map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Scopes/Permissions</Label>
                <div className="col-span-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto rounded-md border p-2">
                  {permissionsArray.map((perm, idx) => (
                    <Badge
                      key={`${perm.codename}-${idx}`}
                      variant={editRoleForm.scopes.includes(perm.codename) ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => {
                        setEditRoleForm(prev => {
                          if (!prev) return null;
                          const updatedScopes = prev.scopes.includes(perm.codename)
                            ? prev.scopes.filter(s => s !== perm.codename)
                            : [...prev.scopes, perm.codename];
                          return { ...prev, scopes: updatedScopes };
                        });
                      }}
                    >
                      {perm.codename}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              onClick={() => editRoleForm && updateRoleMutation.mutate({
                id: editRoleForm.id,
                data: {
                  name: editRoleForm.name,
                  description: editRoleForm.description,
                  scopes: editRoleForm.scopes,
                  parent_id: editRoleForm.parentId,
                }
              })}
              disabled={updateRoleMutation.isPending || !editRoleForm?.name}
            >
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Role Alert Dialog */}
      <AlertDialog open={isDeleteRoleAlertDialogOpen} onOpenChange={setIsDeleteRoleAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role and potentially affect users assigned to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => roleToDeleteId && deleteRoleMutation.mutate(roleToDeleteId)} disabled={deleteRoleMutation.isPending}>
              {deleteRoleMutation.isPending ? "Deleting..." : "Delete Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Policy Dialog */}
      <Dialog open={isCreatePolicyDialogOpen} onOpenChange={setIsCreatePolicyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Access Policy</DialogTitle>
            <DialogDescription>Define a new access policy to control system resources.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPolicyName" className="text-right">Name</Label>
              <Input
                id="newPolicyName"
                value={newPolicyForm.name}
                onChange={(e) => setNewPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPolicyDescription" className="text-right">Description</Label>
              <Input
                id="newPolicyDescription"
                value={newPolicyForm.description || ''}
                onChange={(e) => setNewPolicyForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPolicyResource" className="text-right">Resource</Label>
              <Input
                id="newPolicyResource"
                value={newPolicyForm.resource}
                onChange={(e) => setNewPolicyForm(prev => ({ ...prev, resource: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPolicyAction" className="text-right">Action</Label>
              <Input
                id="newPolicyAction"
                value={newPolicyForm.action}
                onChange={(e) => setNewPolicyForm(prev => ({ ...prev, action: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPolicyPriority" className="text-right">Priority</Label>
              <Input
                id="newPolicyPriority"
                type="number"
                value={newPolicyForm.priority}
                onChange={(e) => setNewPolicyForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPolicyIsActive" className="text-right">Active</Label>
              <input
                type="checkbox"
                id="newPolicyIsActive"
                checked={newPolicyForm.is_active}
                onChange={(e) => setNewPolicyForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreatePolicy} disabled={createAccessPolicyMutation.isPending || !newPolicyForm.name}>
              {createAccessPolicyMutation.isPending ? "Creating..." : "Create Policy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={isEditPolicyDialogOpen} onOpenChange={setIsEditPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Access Policy</DialogTitle>
            <DialogDescription>Update the access policy's details.</DialogDescription>
          </DialogHeader>
          {editPolicyForm && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPolicyName" className="text-right">Name</Label>
                <Input
                  id="editPolicyName"
                  value={editPolicyForm.name}
                  onChange={(e) => setEditPolicyForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPolicyDescription" className="text-right">Description</Label>
                <Input
                  id="editPolicyDescription"
                  value={editPolicyForm.description || ''}
                  onChange={(e) => setEditPolicyForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPolicyResource" className="text-right">Resource</Label>
                <Input
                  id="editPolicyResource"
                  value={editPolicyForm.resource}
                  onChange={(e) => setEditPolicyForm(prev => prev ? { ...prev, resource: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPolicyAction" className="text-right">Action</Label>
                <Input
                  id="editPolicyAction"
                  value={editPolicyForm.action}
                  onChange={(e) => setEditPolicyForm(prev => prev ? { ...prev, action: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPolicyPriority" className="text-right">Priority</Label>
                <Input
                  id="editPolicyPriority"
                  type="number"
                  value={editPolicyForm.priority}
                  onChange={(e) => setEditPolicyForm(prev => prev ? { ...prev, priority: parseInt(e.target.value) || 0 } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPolicyIsActive" className="text-right">Active</Label>
                <input
                  type="checkbox"
                  id="editPolicyIsActive"
                  checked={editPolicyForm.is_active}
                  onChange={(e) => setEditPolicyForm(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleEditPolicy} disabled={updateAccessPolicyMutation.isPending || !editPolicyForm?.name}>
              {updateAccessPolicyMutation.isPending ? "Updating..." : "Update Policy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Policy Alert Dialog */}
      <AlertDialog open={isDeletePolicyAlertDialogOpen} onOpenChange={setIsDeletePolicyAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the access policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeletePolicy()} disabled={deleteAccessPolicyMutation.isPending}>
              {deleteAccessPolicyMutation.isPending ? "Deleting..." : "Delete Policy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}