import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { TasksList } from "@/components/dashboard/TasksList";
import { FinanceOverview } from "@/components/dashboard/FinanceOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TeamPerformance } from "@/components/dashboard/TeamPerformance";
import { InventoryAlert } from "@/components/dashboard/InventoryAlert";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  useProjectsOverview,
  useTaskAllocation,
  useBudgetTracking,
} from "@/hooks/use-dashboard";
import {
  FolderKanban,
  CheckSquare,
  Wallet,
  Users,
} from "lucide-react";

export default function Index() {
  const { data: projectsOverview, isLoading: loadingProjects, error: projectsError, refetch: refetchProjects } = useProjectsOverview();
  const { data: taskAllocation, isLoading: loadingTasks, error: tasksError, refetch: refetchTasks } = useTaskAllocation();
  const { data: budgetTracking, isLoading: loadingBudget, error: budgetError, refetch: refetchBudget } = useBudgetTracking();

  const isStatsLoading = loadingProjects || loadingTasks || loadingBudget;
  const statsError = projectsError || tasksError || budgetError;

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(1)}M`;
    }
    return `KES ${amount.toLocaleString()}`;
  };

  // Calculate changes (mock for now - could come from API comparison)
  const getActiveProjects = () => projectsOverview?.by_status?.in_progress || 0;
  const getPendingTasks = () => (taskAllocation?.by_status?.pending || 0) + (taskAllocation?.by_status?.in_progress || 0);
  const getMonthlyRevenue = () => budgetTracking?.total_budget || 0;
  const getTotalTechnicians = () => projectsOverview?.total_projects || 0;

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back, John">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isStatsLoading ? (
          <LoadingSkeleton variant="stat" count={4} />
        ) : statsError ? (
          <div className="col-span-4">
            <ErrorState
              message="Failed to load dashboard statistics"
              onRetry={() => {
                refetchProjects();
                refetchTasks();
                refetchBudget();
              }}
            />
          </div>
        ) : (
          <>
            <StatCard
              title="Active Projects"
              value={getActiveProjects()}
              change={12}
              changeLabel="vs last month"
              icon={<FolderKanban className="w-6 h-6" />}
              variant="primary"
            />
            <StatCard
              title="Pending Tasks"
              value={getPendingTasks()}
              change={-8}
              changeLabel="vs last week"
              icon={<CheckSquare className="w-6 h-6" />}
              variant="warning"
            />
            <StatCard
              title="Monthly Budget"
              value={formatCurrency(getMonthlyRevenue())}
              change={23}
              changeLabel="vs last month"
              icon={<Wallet className="w-6 h-6" />}
              variant="success"
            />
            <StatCard
              title="Total Projects"
              value={projectsOverview?.total_projects || 0}
              change={5}
              changeLabel="vs last month"
              icon={<Users className="w-6 h-6" />}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Projects & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <RecentProjects />
          <TasksList />
        </div>

        {/* Right Column - Finance, Team, Inventory */}
        <div className="space-y-6">
          <FinanceOverview />
          <TeamPerformance />
          <InventoryAlert />
        </div>
      </div>
    </DashboardLayout>
  );
}
