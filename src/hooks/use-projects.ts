import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";

export interface Project {
  id: number;
  name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  infrastructure_type: "fiber" | "wireless" | "ppoe" | "hotspot" | "hybrid" | "network_infrastructure";
  status: "planning" | "in_progress" | "completed" | "on_hold" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  team_size?: number;
  budget: number;
  spent?: number;
  start_date: string;
  end_date?: string;
  location?: string;
  project_type?: string;
  department_id?: number;
  project_manager_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectsFilters {
  status?: string;
  infrastructure_type?: string;
  department_id?: number;
}

export function useProjects(filters?: ProjectsFilters) {
  return useQuery<Project[]>({
    queryKey: ["projects", filters],
    queryFn: () => projectsApi.list(filters) as Promise<Project[]>,
    staleTime: 30000, // 30 seconds
  });
}

export function useProject(id: number) {
  return useQuery<Project>({
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id) as Promise<Project>,
    enabled: !!id,
  });
}
