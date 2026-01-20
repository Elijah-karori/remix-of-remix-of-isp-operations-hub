import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useCreateTask } from '@/hooks/use-tasks'; // Import the new hook
import { TaskCreate } from '@/types/api'; // Import TaskCreate type
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useProjects } from '@/hooks/use-projects'; // To get list of projects
import { useUsers } from '@/hooks/use-users'; // Assuming this hook exists or will be created


const taskFormSchema = z.object({
  title: z.string().min(2, { message: 'Task title must be at least 2 characters.' }),
  description: z.string().optional(),
  project_id: z.coerce.number().int().optional().refine(val => val === undefined || val > 0, {
    message: "Project is required.",
  }),
  assigned_to_id: z.coerce.number().int().optional().refine(val => val === undefined || val > 0, {
    message: "Assignee is required.",
  }),
  scheduled_date: z.date().optional(),
  status: z.enum(["pending", "in_progress", "awaiting_approval", "completed", "cancelled"], {
    required_error: "Status is required.",
  }).default("pending"),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Priority is required.",
  }).default("medium"),
});

interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<TaskCreate>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const createTaskMutation = useCreateTask();
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const { data: usersData, isLoading: loadingUsers } = useUsers();

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      project_id: initialData?.project_id || undefined,
      assigned_to_id: initialData?.assigned_to_id || undefined,
      scheduled_date: initialData?.scheduled_date ? new Date(initialData.scheduled_date) : undefined,
      status: initialData?.status || "pending",
      priority: initialData?.priority || "medium",
    },
  });

  const onSubmit = async (values: z.infer<typeof taskFormSchema>) => {
    try {
      const taskData: TaskCreate = {
        title: values.title,
        description: values.description,
        project_id: values.project_id,
        assigned_to_id: values.assigned_to_id,
        scheduled_date: values.scheduled_date ? format(values.scheduled_date, 'yyyy-MM-dd') : undefined,
        status: values.status,
        priority: values.priority,
      };
      await createTaskMutation.mutateAsync(taskData);
      toast.success('Task created successfully!');
      onSuccess?.();
    } catch (err: any) {
      toast.error(`Failed to create task: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Install new fiber line" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed description of the task" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="project_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select onValueChange={value => field.onChange(parseInt(value))} value={field.value ? String(field.value) : ""}>
                <FormControl>
                  <SelectTrigger disabled={loadingProjects}>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingProjects ? (
                    <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                  ) : (
                    projectsData?.map((project) => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assigned_to_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <Select onValueChange={value => field.onChange(parseInt(value))} value={field.value ? String(field.value) : ""}>
                <FormControl>
                  <SelectTrigger disabled={loadingUsers}>
                    <SelectValue placeholder="Select an assignee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingUsers ? (
                    <SelectItem value="loading" disabled>Loading users...</SelectItem>
                  ) : (
                    usersData?.users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scheduled_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Scheduled Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTaskMutation.isPending}>
            {createTaskMutation.isPending && <LoadingSpinner className="mr-2" />}
            Create Task
          </Button>
        </div>
      </form>
    </Form>
  );
};