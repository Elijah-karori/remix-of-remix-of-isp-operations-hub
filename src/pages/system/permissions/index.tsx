import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  const handleEdit = (permission: Permission) => {
    setEditingId(permission.id);
    setEditForm(permission);
  };

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

  const filteredPermissions = permissions.filter(permission => 
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    </div>
  );
}
