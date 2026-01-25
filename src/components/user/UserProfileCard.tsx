import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, Shield, LogOut } from 'lucide-react';
import { RoleBadge } from '../permissions/PermissionBadge';

export const UserProfileCard = () => {
    const { user, logout, getUserRoles } = useAuth();

    if (!user) return null;

    const roles = getUserRoles();
    const initials = user.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'U';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{user.full_name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {user.is_superuser && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Superuser
                            </Badge>
                        )}
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Contact Info */}
                {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone}</span>
                    </div>
                )}

                {/* Created Date */}
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>

                <Separator />

                {/* Roles */}
                <div>
                    <h3 className="text-sm font-semibold mb-2">Roles</h3>
                    <div className="flex flex-wrap gap-2">
                        {roles.length > 0 ? (
                            roles.map((role) => <RoleBadge key={role} role={role} />)
                        ) : (
                            <p className="text-sm text-muted-foreground">No roles assigned</p>
                        )}
                    </div>
                </div>

                {/* Department */}
                {user.department_id && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Department</h3>
                            <p className="text-sm">Department ID: {user.department_id}</p>
                        </div>
                    </>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => { }}>
                        Edit Profile
                    </Button>
                    <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
