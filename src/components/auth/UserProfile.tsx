import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, User, Shield, Key, RefreshCw } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, permissions, getProfile, getUserRoles, hasPermission } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = await getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please log in to view your profile
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>User Profile</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          <CardDescription>Your account information and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg">{user.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="text-lg">#{user.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={user.is_active ? "default" : "secondary"}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          {user.phone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-lg">{user.phone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Roles</CardTitle>
          </div>
          <CardDescription>Your assigned roles in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {profile?.roles && profile.roles.length > 0 ? (
              profile.roles.map((role: any, index: number) => (
                <Badge key={index} variant="outline" className="mr-2">
                  {role.name || role}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No roles assigned</p>
            )}
            
            {profile?.rolesV2 && profile.rolesV2.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">RBAC v2 Roles:</h4>
                {profile.rolesV2.map((role: any, index: number) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {role.name || role}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <CardTitle>Permissions</CardTitle>
          </div>
          <CardDescription>Your system permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Total Permissions: {permissions.length}</h4>
              <div className="flex flex-wrap gap-2">
                {permissions.slice(0, 20).map((permission, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
                {permissions.length > 20 && (
                  <Badge variant="secondary" className="text-xs">
                    +{permissions.length - 20} more
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Permission Check Examples */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Permission Check Examples:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">project:create:all</span>
                  <Badge variant={hasPermission("project:create:all") ? "default" : "secondary"}>
                    {hasPermission("project:create:all") ? "Granted" : "Denied"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">user:read:all</span>
                  <Badge variant={hasPermission("user:read:all") ? "default" : "secondary"}>
                    {hasPermission("user:read:all") ? "Granted" : "Denied"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">system:admin</span>
                  <Badge variant={hasPermission("system:admin") ? "default" : "secondary"}>
                    {hasPermission("system:admin") ? "Granted" : "Denied"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
