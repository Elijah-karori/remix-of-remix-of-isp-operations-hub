import { useState, useEffect } from 'react';
import { permissionsApi } from '@/lib/api/rbac';
import { authApi } from '@/lib/api/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, Briefcase, AlertCircle } from 'lucide-react';

interface OnboardingFormStepProps {
    onComplete: (data: any) => void;
}

export const OnboardingFormStep = ({ onComplete }: OnboardingFormStepProps) => {
    const [department, setDepartment] = useState('');
    const [role, setRole] = useState('');
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingRoles, setIsFetchingRoles] = useState(true);
    const [error, setError] = useState('');

    const departments = [
        'Finance',
        'Human Resources',
        'IT & Infrastructure',
        'Operations',
        'Sales & Marketing',
        'Customer Support'
    ];

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await permissionsApi.roles();
                setRoles(Array.isArray(rolesData) ? rolesData : []);
            } catch (err) {
                console.error('Failed to fetch roles:', err);
            } finally {
                setIsFetchingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const onboardingData = { department, requested_role: role };
            // Simulate/Trigger onboarding submission
            // In a real scenario, this might call a specific endpoint or update profile
            await authApi.updateProfile(onboardingData as any);
            onComplete(onboardingData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit onboarding details');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                <CardDescription>Tell us a bit more about your role in the organization</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                            <Select onValueChange={setDepartment} required>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Requested Role</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                            <Select onValueChange={setRole} required disabled={isFetchingRoles}>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder={isFetchingRoles ? "Loading roles..." : "Select Role"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id || r.name} value={r.name || r}>{r.name || r}</SelectItem>
                                    ))}
                                    {roles.length === 0 && !isFetchingRoles && (
                                        <SelectItem value="default">Default User</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading || isFetchingRoles}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit for Approval'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
