import { useAuth } from '@/contexts/AuthContext';
import { useCommonPermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGate } from '../auth/PermissionGate';
import {
    BarChart3,
    DollarSign,
    Package,
    Users,
    Briefcase,
    FileText,
    TrendingUp,
    Activity,
} from 'lucide-react';

// Widget components
const ProjectsWidget = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
        </CardContent>
    </Card>
);

const FinanceWidget = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
    </Card>
);

const InventoryWidget = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">Items in stock</p>
        </CardContent>
    </Card>
);

const HRWidget = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">54</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
        </CardContent>
    </Card>
);

const AnalyticsWidget = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">New customers this month</p>
        </CardContent>
    </Card>
);

const PerformanceWidget = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">System uptime</p>
        </CardContent>
    </Card>
);

const TasksWidget = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Pending tasks</p>
        </CardContent>
    </Card>
);

const ActivityWidget = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Actions today</p>
        </CardContent>
    </Card>
);

/**
 * Role-based dashboard that shows different widgets based on user permissions
 */
export const RoleBasedDashboard = () => {
    const { user } = useAuth();
    const permissions = useCommonPermissions();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-muted-foreground">
                    Here's what's happening with your organization today.
                </p>
            </div>

            {/* Widgets Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Projects Widget */}
                <PermissionGate permission="project:read:all">
                    <ProjectsWidget />
                </PermissionGate>

                {/* Finance Widget */}
                <PermissionGate permission="finance:read:all">
                    <FinanceWidget />
                </PermissionGate>

                {/* Inventory Widget */}
                <PermissionGate permission="inventory:read:all">
                    <InventoryWidget />
                </PermissionGate>

                {/* HR Widget */}
                <PermissionGate permission="hr:read:all">
                    <HRWidget />
                </PermissionGate>

                {/* Analytics Widget */}
                {permissions.canViewProjects && <AnalyticsWidget />}

                {/* Performance Widget */}
                {user?.is_superuser && <PerformanceWidget />}

                {/* Tasks Widget */}
                <TasksWidget />

                {/* Activity Widget */}
                <ActivityWidget />
            </div>

            {/* Additional sections based on permissions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <PermissionGate permission="finance:read:all">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Financial Overview</CardTitle>
                            <CardDescription>
                                Your financial performance for this month
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Financial charts and data would go here
                            </p>
                        </CardContent>
                    </Card>
                </PermissionGate>

                <PermissionGate permission="project:read:all">
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Projects</CardTitle>
                            <CardDescription>Latest project updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Project list would go here
                            </p>
                        </CardContent>
                    </Card>
                </PermissionGate>
            </div>
        </div>
    );
};
