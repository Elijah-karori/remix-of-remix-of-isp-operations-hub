import { ProjectOut, ProjectCreate, ProjectUpdate, BudgetSummary } from '../../types/api';
import { apiFetch } from './base';

export const projectsApi = {
  list: async (params?: { status?: string; infrastructure_type?: string; department_id?: number }): Promise<ProjectOut[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.infrastructure_type) searchParams.append("infrastructure_type", params.infrastructure_type);
    if (params?.department_id) searchParams.append("department_id", String(params.department_id));
    return apiFetch<ProjectOut[]>(`/api/v1/projects/?${searchParams}`);
  },

  get: async (id: number): Promise<ProjectOut> => {
    return apiFetch<ProjectOut>(`/api/v1/projects/${id}`);
  },

  create: (data: ProjectCreate): Promise<ProjectOut> =>
    apiFetch<ProjectOut>("/api/v1/projects/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: ProjectUpdate): Promise<ProjectOut> =>
    apiFetch<ProjectOut>(`/api/v1/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) =>
    apiFetch(`/api/v1/projects/${id}`, { method: "DELETE" }),

  getByDepartment: (departmentId: number): Promise<ProjectOut[]> =>
    apiFetch<ProjectOut[]>(`/api/v1/projects/by-department/${departmentId}`),

  // Milestones
  createMilestone: (projectId: number, data: any) =>
    apiFetch(`/api/v1/projects/${projectId}/milestones`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getMilestones: (projectId: number) =>
    apiFetch(`/api/v1/projects/${projectId}/milestones`),

  updateMilestone: (milestoneId: number, data: any) =>
    apiFetch(`/api/v1/projects/milestones/${milestoneId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  // Budget
  createBudget: (projectId: number, data: any) =>
    apiFetch(`/api/v1/projects/${projectId}/budget`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getBudget: (projectId: number) =>
    apiFetch(`/api/v1/projects/${projectId}/budget`),

  getBudgetSummary: (projectId: number): Promise<BudgetSummary> =>
    apiFetch<BudgetSummary>(`/api/v1/projects/${projectId}/budget/summary`),

  // Team
  getTeam: (projectId: number) =>
    apiFetch(`/api/v1/projects/${projectId}/team`),
};
