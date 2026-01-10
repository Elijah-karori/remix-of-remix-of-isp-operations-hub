import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { TasksList } from "@/components/dashboard/TasksList";
import { FinanceOverview } from "@/components/dashboard/FinanceOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TeamPerformance } from "@/components/dashboard/TeamPerformance";
import { InventoryAlert } from "@/components/dashboard/InventoryAlert";
import {
  FolderKanban,
  CheckSquare,
  Wallet,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function Index() {
  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back, John">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Projects"
          value={24}
          change={12}
          changeLabel="vs last month"
          icon={<FolderKanban className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard
          title="Pending Tasks"
          value={156}
          change={-8}
          changeLabel="vs last week"
          icon={<CheckSquare className="w-6 h-6" />}
          variant="warning"
        />
        <StatCard
          title="Monthly Revenue"
          value="KES 2.4M"
          change={23}
          changeLabel="vs last month"
          icon={<Wallet className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="Active Technicians"
          value={18}
          change={5}
          changeLabel="vs last month"
          icon={<Users className="w-6 h-6" />}
          variant="default"
        />
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
