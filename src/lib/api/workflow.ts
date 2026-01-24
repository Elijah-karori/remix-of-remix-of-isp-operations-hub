import { WorkflowDefinitionRead, WorkflowGraphCreate, WorkflowInstanceRead } from '../../types/api';
import { apiFetch } from './base';

export const workflowApi = {
  // Workflow Definitions
  list: (statusFilter?: string): Promise<WorkflowDefinitionRead[]> => {
    const params = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiFetch<WorkflowDefinitionRead[]>(`/api/v1/workflow/${params}`);
  },

  get: (id: number) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}`),

  delete: (id: number) =>
    apiFetch(`/api/v1/workflow/${id}`, { method: "DELETE" }),

  // Graph Operations
  createGraph: (data: WorkflowGraphCreate) =>
    apiFetch<WorkflowDefinitionRead>("/api/v1/workflow/graph", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateGraph: (id: number, data: WorkflowGraphCreate) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}/graph`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  publish: (id: number) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}/publish`, { method: "POST" }),

  clone: (id: number, newName: string) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}/clone?new_name=${encodeURIComponent(newName)}`, {
      method: "POST"
    }),

  // Workflow Instances
  start: (data: { workflow_id: number; related_model: string; related_id: number; initiated_by: number }) =>
    apiFetch<WorkflowInstanceRead>("/api/v1/workflow/start", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  performAction: (instanceId: number, action: string, comment?: string) => {
    const params = comment ? `?action=${action}&comment=${encodeURIComponent(comment)}` : `?action=${action}`;
    return apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/instances/${instanceId}/actions${params}`, {
      method: "POST"
    });
  },

  approve: (instanceId: number, comment?: string) => {
    const params = comment ? `?comment=${encodeURIComponent(comment)}` : '';
    return apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/${instanceId}/approve${params}`, {
      method: "POST"
    });
  },

  reject: (instanceId: number, comment?: string) => {
    const params = comment ? `?comment=${encodeURIComponent(comment)}` : '';
    return apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/${instanceId}/reject${params}`, {
      method: "POST"
    });
  },

  comment: (instanceId: number, comment: string) =>
    apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/${instanceId}/comment?comment=${encodeURIComponent(comment)}`, {
      method: "POST"
    }),

  // Queries
  myApprovals: (): Promise<WorkflowInstanceRead[]> =>
    apiFetch<WorkflowInstanceRead[]>("/api/v1/workflow/my-approvals"),

  pending: () =>
    apiFetch<WorkflowInstanceRead[]>("/api/v1/workflow/pending"),

  stats: () =>
    apiFetch("/api/v1/workflow/stats"),
};
