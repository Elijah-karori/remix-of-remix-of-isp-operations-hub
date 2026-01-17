import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";

export const useProjectsOverview = () => {
  return useQuery({
    queryKey: ["dashboard", "projectsOverview"],
    queryFn: dashboardApi.projectsOverview,
    staleTime: 30000,
  });
};

export const useTaskAllocation = () => {
  return useQuery({
    queryKey: ["dashboard", "taskAllocation"],
    queryFn: dashboardApi.taskAllocation,
    staleTime: 30000,
  });
};

export const useBudgetTracking = () => {
  return useQuery({
    queryKey: ["dashboard", "budgetTracking"],
    queryFn: dashboardApi.budgetTracking,
    staleTime: 30000,
  });
};

export const useTeamWorkload = () => {
  return useQuery({
    queryKey: ["dashboard", "teamWorkload"],
    queryFn: dashboardApi.teamWorkload,
    staleTime: 30000,
  });
};
