import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rbacApi, managementApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
<<<<<<< HEAD
import { Search, Plus, Pencil, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export default function Permissions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: '1',
      name: 'user:read',
      description: 'View user information',
      resource: 'users',
      action: 'read'
    },
    {
      id: '2',
      name: 'user:write',
      description: 'Create and update users',
      resource: 'users',
      action: 'write'
    },
    {
      id: '3',
      name: 'settings:manage',
      description: 'Manage system settings',
      resource: 'settings',
      action: 'manage'
    }
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Permission>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newPermission, setNewPermission] = useState<Omit<Permission, 'id'>>({
    name: '',
    description: '',
    resource: '',
    action: ''
  });
=======
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Shield, Users, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleHierarchyOut, IndependentRoleOut, PermissionV2Out } from '@/types/api';

export default function Permissions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleHierarchyOut | IndependentRoleOut | null>(null);
>>>>>>> 2df108fa25cf4dbfbce67ffbe09ad63f18244f71

  const { data: myPermissions, isLoading: loadingMyPerms } = useQuery({
    queryKey: ['rbac', 'my-permissions'],
    queryFn: () => rbacApi.myPermissions(),
    staleTime: 60000,
  });

<<<<<<< HEAD
  const handleSave = (id: string) => {
    setPermissions(permissions.map(p => 
      p.id === id ? { ...p, ...editForm } as Permission : p
    ));
    setEditingId(null);
    toast.success("Permission saved successfully");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this permission?")) {
      setPermissions(permissions.filter(p => p.id !== id));
      toast.success("Permission deleted successfully");
    }
  };

  const handleAdd = () => {
    if (newPermission.name && newPermission.description && newPermission.resource && newPermission.action) {
      setPermissions([...permissions, { ...newPermission, id: `${permissions.length + 1}` }]);
      setNewPermission({ name: '', description: '', resource: '', action: '' });
      setIsAdding(false);
      toast.success("Permission added successfully");
    } else {
      toast.error("Please fill all fields");
    }
  };
=======
  const { data: hierarchy, isLoading: loadingHierarchy, refetch: refetchHierarchy } = useQuery<RoleHierarchyOut[]>({
    queryKey: ['management', 'rbac', 'hierarchy'],
    queryFn: () => managementApi.getHierarchy(),
    staleTime: 60000,
  });

  const { data: independentRoles, isLoading: loadingIndependent } = useQuery<IndependentRoleOut[]>({
    queryKey: ['management', 'rbac', 'independent-roles'],
    queryFn: () => managementApi.getIndependentRoles(),
    staleTime: 60000,
  });
>>>>>>> 2df108fa25cf4dbfbce67ffbe09ad63f18244f71

  const filteredPermissions = myPermissions?.permissions?.filter(permission => 
    permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.codename?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

<<<<<<< HEAD
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Permissions Management</h1>
          <p className="text-muted-foreground">
            Manage system permissions and access controls
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="mr-2 h-4 w-4" />
          {isAdding ? "Cancel" : "Add Permission"}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Permission</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              placeholder="Name (e.g., user:read)"
              value={newPermission.name}
              onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newPermission.description}
              onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
            />
            <Input
              placeholder="Resource"
              value={newPermission.resource}
              onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value })}
            />
            <Input
              placeholder="Action"
              value={newPermission.action}
              onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value })}
            />
            <Button onClick={handleAdd}>Save</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Manage and configure system permissions
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">
                    {editingId === permission.id ? (
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    ) : (
                      permission.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === permission.id ? (
                      <Input
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      />
                    ) : (
                      permission.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === permission.id ? (
                      <Input
                        value={editForm.resource || ''}
                        onChange={(e) => setEditForm({...editForm, resource: e.target.value})}
                      />
                    ) : (
                      permission.resource
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === permission.id ? (
                      <Input
                        value={editForm.action || ''}
                        onChange={(e) => setEditForm({...editForm, action: e.target.value})}
                      />
                    ) : (
                      permission.action
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {editingId === permission.id ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleSave(permission.id)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(permission)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(permission.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
=======
  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    const [category] = perm.codename?.split(':') || ['other'];
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, typeof filteredPermissions>);

  const renderRoleNode = (node: RoleHierarchyOut, depth: number = 0) => (
    <div key={node.role.id} className="mb-2">
      <div 
        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
          selectedRole && 'role' in selectedRole && selectedRole.role?.id === node.role.id ? 'bg-primary/10 border-primary' : ''
        }`}
        style={{ marginLeft: `${depth * 24}px` }}
        onClick={() => setSelectedRole(node)}
      >
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-medium">{node.role.name}</span>
        {node.role.scopes?.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {node.role.scopes.length} scopes
          </Badge>
        )}
        {node.children?.length > 0 && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      {node.children?.map(child => renderRoleNode(child, depth + 1))}
>>>>>>> 2df108fa25cf4dbfbce67ffbe09ad63f18244f71
    </div>
  );

  const isLoading = loadingMyPerms || loadingHierarchy || loadingIndependent;

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

                  {independentRoles && independentRoles.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground">Independent Roles</h4>
                      <div className="space-y-2">
                        {independentRoles.map(role => (
                          <div 
                            key={role.id}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedRole && 'id' in selectedRole && selectedRole.id === role.id ? 'bg-primary/10 border-primary' : ''
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
                  )}
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
                          {selectedRole.role.scopes?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Scopes</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedRole.role.scopes.map((scope, idx) => (
                                  <Badge key={idx} variant="secondary">{scope}</Badge>
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
                          {selectedRole.permissions?.length > 0 && (
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}