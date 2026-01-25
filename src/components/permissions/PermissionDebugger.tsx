import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Check, X, Info } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

/**
 * Development-only component for debugging permissions
 * Shows all user permissions and allows testing permission checks
 */
export const PermissionDebugger = () => {
    const { user, permissions, hasPermission, getUserRoles } = useAuth();
    const [testPermission, setTestPermission] = useState('');

    // Only show in development
    if (import.meta.env.PROD) {
        return null;
    }

    const roles = getUserRoles();
    const v2Permissions = user?.permissions_v2 || [];
    const rolePermissions = user?.roles_v2?.flatMap(role => role.permissions || []) || [];

    return (
        <Card className="border-2 border-yellow-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Permission Debugger
                    <Badge variant="outline" className="ml-auto">DEV ONLY</Badge>
                </CardTitle>
                <CardDescription>
                    Debug permission checks and view all user permissions
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* User Info */}
                <div>
                    <h3 className="font-semibold mb-2">User Info</h3>
                    <div className="space-y-1 text-sm">
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Name:</strong> {user?.full_name}</p>
                        <p><strong>Superuser:</strong> {user?.is_superuser ? 'Yes' : 'No'}</p>
                        <p><strong>Active:</strong> {user?.is_active ? 'Yes' : 'No'}</p>
                    </div>
                </div>

                <Separator />

                {/* Roles */}
                <div>
                    <h3 className="font-semibold mb-2">Roles ({roles.length})</h3>
                    <div className="flex flex-wrap gap-2">
                        {roles.length > 0 ? (
                            roles.map((role) => (
                                <Badge key={role} variant="secondary">
                                    {role}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No roles assigned</p>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Permission Test */}
                <div>
                    <h3 className="font-semibold mb-2">Test Permission</h3>
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., project:read:all"
                            value={testPermission}
                            onChange={(e) => setTestPermission(e.target.value)}
                        />
                        {testPermission && (
                            <Badge
                                variant={hasPermission(testPermission) ? 'default' : 'destructive'}
                                className="flex items-center gap-1"
                            >
                                {hasPermission(testPermission) ? (
                                    <>
                                        <Check className="h-3 w-3" />
                                        Granted
                                    </>
                                ) : (
                                    <>
                                        <X className="h-3 w-3" />
                                        Denied
                                    </>
                                )}
                            </Badge>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Legacy Permissions */}
                <div>
                    <h3 className="font-semibold mb-2">Legacy Permissions ({permissions.length})</h3>
                    <ScrollArea className="h-32 rounded border p-2">
                        <div className="space-y-1">
                            {permissions.length > 0 ? (
                                permissions.map((perm, idx) => (
                                    <div key={idx} className="text-xs font-mono">
                                        {perm}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No legacy permissions</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* RBAC v2 Direct Permissions */}
                <div>
                    <h3 className="font-semibold mb-2">RBAC v2 Direct Permissions ({v2Permissions.length})</h3>
                    <ScrollArea className="h-32 rounded border p-2">
                        <div className="space-y-1">
                            {v2Permissions.length > 0 ? (
                                v2Permissions.map((perm, idx) => (
                                    <div key={idx} className="text-xs font-mono">
                                        {perm.name}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No direct v2 permissions</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* RBAC v2 Role Permissions */}
                <div>
                    <h3 className="font-semibold mb-2">RBAC v2 Role Permissions ({rolePermissions.length})</h3>
                    <ScrollArea className="h-32 rounded border p-2">
                        <div className="space-y-1">
                            {rolePermissions.length > 0 ? (
                                rolePermissions.map((perm, idx) => (
                                    <div key={idx} className="text-xs font-mono">
                                        {perm.name}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No role permissions</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded text-sm">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-blue-800">
                        This debugger is only visible in development mode and will not appear in production builds.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
