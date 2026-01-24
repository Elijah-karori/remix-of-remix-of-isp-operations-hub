import { apiFetch } from './base';

export const dashboardApi = {
  // Main Dashboards
  projectsOverview: () =>
    apiFetch("/api/v1/dashboards/projects-overview"),

  taskAllocation: () =>
    apiFetch("/api/v1/dashboards/task-allocation"),

  budgetTracking: () =>
    apiFetch("/api/v1/dashboards/budget-tracking"),

  teamWorkload: () =>
    apiFetch("/api/v1/dashboards/team-workload"),

  departmentOverview: (departmentId: number) =>
    apiFetch(`/api/v1/dashboards/department/${departmentId}/overview`),

  // Management Dashboards
  adminMetrics: (days = 7) =>
    apiFetch(`/api/v1/management/dashboards/admin/metrics?days=${days}`),

  auditorHeatmap: () =>
    apiFetch("/api/v1/management/dashboards/auditor/heatmap"),

  auditorTrails: (params?: { limit?: number; resource?: string; result?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.resource) searchParams.append("resource", params.resource);
    if (params?.result) searchParams.append("result", params.result);
    return apiFetch(`/api/v1/management/dashboards/auditor/trails?${searchParams}`);
  },

  testerCoverage: () =>
    apiFetch("/api/v1/management/dashboards/tester/coverage"),
};
