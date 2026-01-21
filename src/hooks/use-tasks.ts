import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api";
import { TaskOut, TaskCreate, TaskUpdate } from "@/types/api";

export function useTasks(filters?: {
  project_id?: number;
  status?: string;
  assigned_role?: string;
  department_id?: number;
  priority?: string;
}) {
  return useQuery<TaskOut[]>({
    queryKey: ["tasks", filters],
    queryFn: () => tasksApi.list(filters),
    staleTime: 30000,
  });
}

export function useTask(id: number) {
  return useQuery<TaskOut>({
    queryKey: ["task", id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskCreate) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) => tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksApi.update(id, { status: 'cancelled' as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
