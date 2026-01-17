import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Bell, Mail, User, Shield, Database, Globe, CreditCard, MessageSquare } from 'lucide-react';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const notificationTypes = [
  { id: 'email', label: 'Email Notifications', icon: Mail },
  { id: 'push', label: 'Push Notifications', icon: Bell },
  { id: 'sms', label: 'SMS Alerts', icon: MessageSquare },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [autoSave, setAutoSave] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNotificationToggle = (type: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof notifications]
    }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change logic here
    console.log('Password change submitted');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-0.5 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <User className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Monitor className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <Button className="mt-4">Update Profile</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Configure your application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="EST">Eastern Time (ET)</SelectItem>
                      <SelectItem value="CST">Central Time (CT)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto-save changes</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes to the server</p>
                </div>
                <Switch 
                  id="auto-save" 
                  checked={autoSave} 
                  onCheckedChange={setAutoSave} 
                />
              </div>
              <Button className="mt-2">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize how the application looks on your device</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themes.map(({ value, label, icon: Icon }) => {
                  const isActive = theme === value;
                  return (
                    <button
                      key={value}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                        isActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent hover:border-muted-foreground/20'
                      }`}
                      onClick={() => setTheme(value)}
                    >
                      <div className="p-3 rounded-md mb-3 bg-muted">
                        <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {label}
                      </span>
                      {isActive && (
                        <span className="text-xs text-primary mt-1">Active</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="font-medium">Accent Color</h3>
                <div className="flex flex-wrap gap-2">
                  {['blue', 'green', 'violet', 'rose', 'orange', 'amber'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full bg-${color}-500 hover:opacity-80 transition-opacity`}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                      onClick={() => console.log(`Set accent color to ${color}`)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display</CardTitle>
              <CardDescription>Adjust display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="density">Density</Label>
                  <p className="text-sm text-muted-foreground">Adjust the spacing of UI elements</p>
                </div>
                <Select defaultValue="comfortable">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select density" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable (Default)</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="motion">Motion</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable animations and transitions</p>
                </div>
                <Switch id="motion" defaultChecked />
              </div>
              <Button className="mt-2">Save Display Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationTypes.map(({ id, label, icon: Icon }) => (
                <div key={id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-md bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor={id} className="text-sm font-medium">
                        {label}
                      </Label>
                    </div>
                  </div>
                  <Switch
                    id={id}
                    checked={notifications[id as keyof typeof notifications]}
                    onCheckedChange={() => handleNotificationToggle(id)}
                  />
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  {[
                    'Product updates and announcements',
                    'Security alerts',
                    'Marketing communications',
                    'Weekly reports',
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <span className="text-sm">{item}</span>
                      <Switch id={`email-${item.toLowerCase().replace(/\s+/g, '-')}`} defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  {[
                    'New messages',
                    'Task assignments',
                    'Approval requests',
                    'System alerts',
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <span className="text-sm">{item}</span>
                      <Switch id={`push-${item.toLowerCase().replace(/\s+/g, '-')}`} defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
              
              <Button className="mt-6">Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>
                <Button type="submit" className="mt-2">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    {twoFactorAuth 
                      ? 'Two-factor authentication is currently enabled.'
                      : 'Two-factor authentication adds an extra layer of security to your account.'
                    }
                  </p>
                </div>
                <Switch 
                  id="2fa" 
                  checked={twoFactorAuth} 
                  onCheckedChange={setTwoFactorAuth} 
                />
              </div>
              
              {twoFactorAuth && (
                <div className="mt-4 p-4 bg-muted/50 rounded-md">
                  <h4 className="font-medium mb-2">Two-Factor Methods</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Authenticator App</p>
                          <p className="text-sm text-muted-foreground">
                            Use an authenticator app to get verification codes
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5" />
                        <div>
                          <p className="font-medium">SMS Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Receive verification codes via SMS
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Add Phone
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                These actions are irreversible. Proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-md">
                <div>
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all of your data.
                  </p>
                </div>
                <Button variant="destructive" className="mt-2 sm:mt-0">
                  Delete Account
                </Button>
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-md">
                <div>
                  <h4 className="font-medium">Logout All Devices</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign out of all devices and invalidate all sessions.
                  </p>
                </div>
                <Button variant="outline" className="mt-2 sm:mt-0">
                  Logout Everywhere
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">Pro Plan - $29/month</p>
                  </div>
                  <Button variant="outline">Change Plan</Button>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Billing Cycle</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="monthly"
                        name="billing"
                        defaultChecked
                        className="h-4 w-4 text-primary"
                      />
                      <label htmlFor="monthly" className="text-sm">
                        Monthly Billing
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="yearly"
                        name="billing"
                        className="h-4 w-4 text-primary"
                      />
                      <label htmlFor="yearly" className="text-sm">
                        Yearly Billing (Save 20%)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Payment Method</h3>
                    <p className="text-sm text-muted-foreground">
                      Visa ending in 4242
                    </p>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-4">Billing History</h3>
                <div className="space-y-4">
                  {[
                    { id: 1, date: 'Jun 15, 2023', amount: '$29.00', status: 'Paid' },
                    { id: 2, date: 'May 15, 2023', amount: '$29.00', status: 'Paid' },
                    { id: 3, date: 'Apr 15, 2023', amount: '$29.00', status: 'Paid' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Pro Plan - {item.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.status}
                        </p>
                      </div>
                      <div className="text-sm font-medium">{item.amount}</div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="mt-4 w-full">
                  View Full Billing History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
