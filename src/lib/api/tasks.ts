import { TaskOut, TaskCreate, TaskUpdate } from '../../types/api';
import { apiFetch } from './base';

export const tasksApi = {
  list: async (params?: {
    project_id?: number;
    status?: string;
    assigned_role?: string;
    department_id?: number;
    priority?: string;
  }): Promise<TaskOut[]> => {
    const searchParams = new URLSearchParams();
    if (params?.project_id) searchParams.append("project_id", String(params.project_id));
    if (params?.status) searchParams.append("status", params.status);
    if (params?.assigned_role) searchParams.append("assigned_role", params.assigned_role);
    if (params?.department_id) searchParams.append("department_id", String(params.department_id));
    if (params?.priority) searchParams.append("priority", params.priority);
    return apiFetch<TaskOut[]>(`/api/v1/tasks/?${searchParams}`);
  },

  myAssignments: async (): Promise<TaskOut[]> => {
    return apiFetch<TaskOut[]>("/api/v1/tasks/my-assignments");
  },

  get: async (id: number): Promise<TaskOut> => {
    return apiFetch<TaskOut>(`/api/v1/tasks/${id}`);
  },

  create: (data: TaskCreate): Promise<TaskOut> =>
    apiFetch<TaskOut>("/api/v1/tasks/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: TaskUpdate): Promise<TaskOut> =>
    apiFetch<TaskOut>(`/api/v1/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  assignByRole: (data: { task_id: number; role: string; department_id?: number }) =>
    apiFetch("/api/v1/tasks/assign-by-role", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  logHours: (id: number, hours: number, notes?: string): Promise<TaskOut> =>
    apiFetch<TaskOut>(`/api/v1/tasks/${id}/hours`, {
      method: "PUT",
      body: JSON.stringify({ task_id: id, hours, notes })
    }),

  getByDepartment: (departmentId: number): Promise<TaskOut[]> =>
    apiFetch<TaskOut[]>(`/api/v1/tasks/by-department/${departmentId}`),

  // Dependencies
  addDependency: (taskId: number, dependsOnTaskId: number, dependencyType = "finish_to_start") =>
    apiFetch(`/api/v1/tasks/${taskId}/dependencies?depends_on_task_id=${dependsOnTaskId}&dependency_type=${dependencyType}`, {
      method: "POST"
    }),

  getDependencies: (taskId: number) =>
    apiFetch(`/api/v1/tasks/${taskId}/dependencies`),
};
