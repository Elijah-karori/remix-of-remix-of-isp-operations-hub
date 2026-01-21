import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";
import { MilestoneOut, ProjectCreate, ProjectOut, ProjectUpdate } from "@/types/api"; // Added MilestoneOut, ProjectCreate, ProjectUpdate types

export interface Project {
  id: number;
  name: string;
  customer_name?: string; // Made optional
  customer_email?: string; // Made optional
  customer_phone?: string; // Made optional
  infrastructure_type?: "fiber" | "wireless" | "ppoe" | "hotspot" | "hybrid" | "network_infrastructure"; // Made optional
  status?: "planning" | "in_progress" | "completed" | "on_hold" | "cancelled"; // Made optional
  priority?: "low" | "medium" | "high" | "critical"; // Made optional
  progress?: number; // Made optional
  team_size?: number;
  budget?: number; // Changed to number
  spent?: number;
  start_date?: string;
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
  return useQuery<ProjectOut[]>({ // Changed to ProjectOut[]
    queryKey: ["projects", filters],
    queryFn: () => projectsApi.list(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useProject(id: number) {
  return useQuery<ProjectOut>({ // Changed to ProjectOut
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  });
}

// New hook for fetching project milestones
export function useMilestones(projectId: number) {
    return useQuery<MilestoneOut[]>({
        queryKey: ["projectMilestones", projectId],
        queryFn: () => projectsApi.getMilestones(projectId) as Promise<MilestoneOut[]>,
        enabled: !!projectId,
    });
}

// New hook for creating a milestone
export function useCreateMilestone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: number; data: Partial<MilestoneOut> }) => projectsApi.createMilestone(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectMilestones"] });
        },
    });
}

// New hook for updating a milestone
export function useUpdateMilestone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ milestoneId, data }: { milestoneId: number; data: Partial<MilestoneOut> }) => projectsApi.updateMilestone(milestoneId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projectMilestones"] });
        },
    });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
