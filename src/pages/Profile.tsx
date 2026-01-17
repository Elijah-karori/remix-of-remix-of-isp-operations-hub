import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  User,
  Lock,
  Shield,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  Building2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, permissions, refreshUser } = useAuth();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    phone_number: user?.phone_number || "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    setIsUpdatingProfile(true);

    try {
      await authApi.updateProfile(profileData);
      console.log("Profile updated:", profileData);
      setProfileSuccess(true);
      await refreshUser();
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (err: any) {
      console.error("Profile update failed:", err);
      setProfileError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      await authApi.changePassword(passwordData.current_password, passwordData.new_password);
      console.log("Password changed successfully");
      setPasswordSuccess(true);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    } catch (err: any) {
      console.error("Password change failed:", err);
      setPasswordError(err.message || "Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const [category] = perm.split(":");
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="font-medium">{user?.email || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Department ID
                    </Label>
                    <p className="font-medium">{user?.department_id || "Not assigned"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      <Badge variant={user?.is_active ? "default" : "destructive"}>
                        {user?.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="font-medium font-mono text-sm">{user?.id || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {profileError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{profileError}</AlertDescription>
                    </Alert>
                  )}

                  {profileSuccess && (
                    <Alert className="bg-green-500/10 border-green-500/30">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-600">
                        Profile updated successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        disabled={isUpdatingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone_number"
                          type="tel"
                          value={profileData.phone_number}
                          onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                          disabled={isUpdatingProfile}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  {passwordSuccess && (
                    <Alert className="bg-green-500/10 border-green-500/30">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-600">
                        Password changed successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input
                        id="current_password"
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        required
                        disabled={isChangingPassword}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        required
                        disabled={isChangingPassword}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        required
                        disabled={isChangingPassword}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Permissions
                </CardTitle>
                <CardDescription>
                  These are the actions you're authorized to perform in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {permissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No permissions assigned to your account.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium capitalize text-sm text-muted-foreground">
                          {category.replace(/_/g, " ")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {perms.map((perm) => (
                            <Badge key={perm} variant="secondary" className="font-mono text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
