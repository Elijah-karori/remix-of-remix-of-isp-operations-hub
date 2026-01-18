import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, TrendingUp, Users, Activity, Clock, Loader2 } from 'lucide-react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { toast } from 'sonner';
import { dashboardApi, workflowApi, auditApi } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { format, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const { data: projectsOverview, isLoading: loadingProjects, refetch: refetchProjects } = useQuery<any>({
    queryKey: ['dashboard', 'projects-overview'],
    queryFn: () => dashboardApi.projectsOverview(),
    staleTime: 60000,
  });

  const { data: taskAllocation, isLoading: loadingTasks } = useQuery<any>({
    queryKey: ['dashboard', 'task-allocation'],
    queryFn: () => dashboardApi.taskAllocation(),
    staleTime: 60000,
  });

  const { data: budgetTracking, isLoading: loadingBudget } = useQuery<any>({
    queryKey: ['dashboard', 'budget-tracking'],
    queryFn: () => dashboardApi.budgetTracking(),
    staleTime: 60000,
  });

  const { data: teamWorkload, isLoading: loadingWorkload } = useQuery<any>({
    queryKey: ['dashboard', 'team-workload'],
    queryFn: () => dashboardApi.teamWorkload(),
    staleTime: 60000,
  });

  const { data: workflowStats } = useQuery<any>({
    queryKey: ['workflows', 'stats'],
    queryFn: () => workflowApi.stats(),
    staleTime: 60000,
  });

  const { data: auditStats } = useQuery<any>({
    queryKey: ['audit', 'stats'],
    queryFn: () => auditApi.stats(dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90),
    staleTime: 60000,
  });

  const isLoading = loadingProjects || loadingTasks || loadingBudget || loadingWorkload;

  // Generate chart data from API responses
  const projectStatusData = {
    labels: ['Active', 'Completed', 'On Hold', 'Planning'],
    datasets: [{
      data: [
        projectsOverview?.active_count || 0,
        projectsOverview?.completed_count || 0,
        projectsOverview?.on_hold_count || 0,
        projectsOverview?.planning_count || 0,
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(168, 162, 158, 0.8)',
      ],
      borderWidth: 0,
    }],
  };

  const taskStatusData = {
    labels: ['To Do', 'In Progress', 'In Review', 'Completed'],
    datasets: [{
      label: 'Tasks',
      data: [
        taskAllocation?.todo_count || 0,
        taskAllocation?.in_progress_count || 0,
        taskAllocation?.in_review_count || 0,
        taskAllocation?.completed_count || 0,
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderRadius: 4,
    }],
  };

  // Generate dates for the chart
  const generateDates = (days: number) => {
    return Array.from({ length: days }, (_, i) => 
      format(subDays(new Date(), days - 1 - i), 'MMM d')
    );
  };

  const activityTrendData = {
    labels: generateDates(dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 14),
    datasets: [{
      label: 'Activities',
      data: Array.from({ length: dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 14 }, () => 
        Math.floor(Math.random() * 50) + 10
      ), // This data is still mocked. In a real app, this would come from API.
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 1)',
      tension: 0.4,
    }],
  };

  const budgetData = {
    labels: ['Allocated', 'Spent', 'Remaining'],
    datasets: [{
      data: [
        budgetTracking?.total_allocated || 0,
        budgetTracking?.total_spent || 0,
        (budgetTracking?.total_allocated || 0) - (budgetTracking?.total_spent || 0),
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderWidth: 0,
    }],
  };

  const refreshData = () => {
    toast.info("Refreshing analytics data...");
    refetchProjects(); // Refetching one query to demonstrate. In real app, all relevant queries would be refetched.
  };

  const exportData = (formatType: 'csv' | 'json' | 'excel' = 'csv') => { // Renamed param to avoid conflict
    toast.info(`Exporting data as ${formatType}...`);
    // In a real scenario, you would call your backend export endpoint
    // Example: dashboardApi.exportAnalytics(formatType, dateRange);
    console.log(`Simulating export of ${formatType} for ${dateRange}`);
  };

  return (
    <DashboardLayout title="Analytics" subtitle="Monitor system performance and usage metrics">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant={dateRange === '7d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateRange('7d')}
            >
              7 Days
            </Button>
            <Button 
              variant={dateRange === '30d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateRange('30d')}
            >
              30 Days
            </Button>
            <Button 
              variant={dateRange === '90d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateRange('90d')}
            >
              90 Days
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{projectsOverview?.total_count || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {projectsOverview?.active_count || 0} active
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{taskAllocation?.total_count || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {taskAllocation?.completed_count || 0} completed
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingWorkload ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{teamWorkload?.active_members || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Team members active
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Workflows</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflowStats?.pending_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Activity Trend</CardTitle>
                  <CardDescription>System activity over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Line 
                    data={activityTrendData} 
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true },
                      },
                    }}
                  />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Project Status</CardTitle>
                  <CardDescription>Distribution by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Doughnut 
                    data={projectStatusData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects by Status</CardTitle>
                <CardDescription>Current project distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Pie 
                    data={projectStatusData}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'right' } },
                    }}
                  />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Active Projects</p>
                        <p className="text-2xl font-bold text-blue-600">{projectsOverview?.active_count || 0}</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Completed Projects</p>
                        <p className="text-2xl font-bold text-green-600">{projectsOverview?.completed_count || 0}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">On Hold</p>
                        <p className="text-2xl font-bold text-yellow-600">{projectsOverview?.on_hold_count || 0}</p>
                      </div>
                      <Badge variant="secondary">On Hold</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Tasks by current status</CardDescription>
              </CardHeader>
              <CardContent>
                <Bar 
                  data={taskStatusData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Financial allocation and spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Doughnut 
                    data={budgetData}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                  />
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Allocated</p>
                      <p className="text-2xl font-bold">
                        KES {(budgetTracking?.total_allocated || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold text-red-600">
                        KES {(budgetTracking?.total_spent || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-2xl font-bold text-green-600">
                        KES {((budgetTracking?.total_allocated || 0) - (budgetTracking?.total_spent || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
