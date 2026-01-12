import { useQuery } from "@tanstack/react-query";
import { dashboardApi, tasksApi, inventoryApi, techniciansApi, financeApi } from "@/lib/api";

export interface ProjectsOverview {
  total_projects: number;
  by_status: {
    planning: number;
    in_progress: number;
    completed: number;
    on_hold: number;
    cancelled: number;
  };
  by_infrastructure: Record<string, number>;
  recent_projects: Array<{
    id: number;
    name: string;
    status: string;
    progress: number;
    customer_name: string;
    infrastructure_type: string;
    deadline?: string;
    team_size?: number;
  }>;
}

export interface TaskAllocation {
  total_tasks: number;
  by_status: {
    pending: number;
    in_progress: number;
    awaiting_approval: number;
    completed: number;
    cancelled: number;
  };
  by_priority: Record<string, number>;
  overdue_tasks: number;
  tasks_due_today: number;
}

export interface BudgetTracking {
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  utilization_percentage: number;
  by_category: Record<string, { budget: number; spent: number }>;
}

export interface TeamWorkload {
  technicians: Array<{
    id: number;
    name: string;
    assigned_tasks: number;
    completed_tasks: number;
    efficiency: number;
    rating: number;
    altitude?: string;
  }>;
  total_technicians: number;
  average_efficiency: number;
}

export interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  quantity_in_stock: number;
  reorder_level: number;
  status: "critical" | "low" | "warning";
}

export interface FinanceSnapshot {
  monthly_revenue: number;
  monthly_expenses: number;
  outstanding_invoices: number;
  overdue_amount: number;
  recent_transactions: Array<{
    id: number;
    type: "income" | "expense";
    description: string;
    amount: number;
    date: string;
  }>;
}

export function useProjectsOverview() {
  return useQuery<ProjectsOverview>({
    queryKey: ["dashboards", "projects-overview"],
    queryFn: () => dashboardApi.projectsOverview() as Promise<ProjectsOverview>,
    staleTime: 60000, // 1 minute
  });
}

export function useTaskAllocation() {
  return useQuery<TaskAllocation>({
    queryKey: ["dashboards", "task-allocation"],
    queryFn: () => dashboardApi.taskAllocation() as Promise<TaskAllocation>,
    staleTime: 60000,
  });
}

export function useBudgetTracking() {
  return useQuery<BudgetTracking>({
    queryKey: ["dashboards", "budget-tracking"],
    queryFn: () => dashboardApi.budgetTracking() as Promise<BudgetTracking>,
    staleTime: 60000,
  });
}

export function useTeamWorkload() {
  return useQuery<TeamWorkload>({
    queryKey: ["dashboards", "team-workload"],
    queryFn: () => dashboardApi.teamWorkload() as Promise<TeamWorkload>,
    staleTime: 60000,
  });
}

export function useLowStock(thresholdMultiplier = 1.5) {
  return useQuery<LowStockItem[]>({
    queryKey: ["inventory", "low-stock", thresholdMultiplier],
    queryFn: () => inventoryApi.lowStock(thresholdMultiplier) as Promise<LowStockItem[]>,
    staleTime: 120000, // 2 minutes
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: ["tasks", "my-assignments"],
    queryFn: () => tasksApi.myAssignments(),
    staleTime: 30000,
  });
}

export function useTechnicianLeaderboard(periodStart: string, limit = 5) {
  return useQuery({
    queryKey: ["technicians", "leaderboard", periodStart, limit],
    queryFn: () => techniciansApi.leaderboard(periodStart, limit),
    staleTime: 120000,
  });
}

export function useFinanceSnapshot() {
  return useQuery<FinanceSnapshot>({
    queryKey: ["finance", "snapshot"],
    queryFn: () => financeApi.snapshot() as Promise<FinanceSnapshot>,
    staleTime: 60000,
  });
}
