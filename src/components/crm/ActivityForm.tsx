import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, ActivityCreate, ActivityUpdate } from '@/types/api';
import { useLogActivity, useUpdateActivity } from '@/hooks/use-crm';
import { toast } from 'sonner';

interface ActivityFormProps {
  initialData?: Activity;
  onSuccess: () => void;
  onCancel: () => void;
  // Optional props to pre-fill lead_id or deal_id if the form is opened from a Lead/Deal detail page
  presetLeadId?: number;
  presetDealId?: number;
}

const formSchema = z.object({
  activity_type: z.enum(['Call', 'Meeting', 'Email', 'Task'], { message: "Activity type is required" }),
  due_date: z.string().optional(), // ISO date string or empty
  status: z.enum(['Pending', 'Completed', 'Cancelled']),
  notes: z.string().optional(),
  lead_id: z.coerce.number().optional(), // Coerce to number, then optional
  deal_id: z.coerce.number().optional(), // Coerce to number, then optional
  assigned_to_id: z.coerce.number().optional(),
});

type ActivityFormValues = z.infer<typeof formSchema>;

export function ActivityForm({ initialData, onSuccess, onCancel, presetLeadId, presetDealId }: ActivityFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      lead_id: initialData.lead_id || undefined, // Ensure number or undefined
      deal_id: initialData.deal_id || undefined,
      assigned_to_id: initialData.assigned_to_id || undefined,
    } : {
      activity_type: 'Task', // Default to Task
      due_date: undefined,
      status: 'Pending',
      notes: '',
      lead_id: presetLeadId || undefined,
      deal_id: presetDealId || undefined,
      assigned_to_id: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        lead_id: initialData.lead_id || undefined,
        deal_id: initialData.deal_id || undefined,
        assigned_to_id: initialData.assigned_to_id || undefined,
      });
    }
  }, [initialData, form]);

  const logActivityMutation = useLogActivity();
  const updateActivityMutation = useUpdateActivity();

  const onSubmit = async (values: ActivityFormValues) => {
    try {
      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Activity ID is missing for update operation.");
          return;
        }
        await updateActivityMutation.mutateAsync({ id: initialData.id, data: values as ActivityUpdate });
        toast.success('Activity updated successfully!');
      } else {
        await logActivityMutation.mutateAsync(values as ActivityCreate);
        toast.success('Activity logged successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save activity: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="activity_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Details about the activity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Fields for lead_id, deal_id, assigned_to_id could be dynamic or based on context */}
        {!presetLeadId && (
          <FormField
            control={form.control}
            name="lead_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Lead ID</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Optional Lead ID" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {!presetDealId && (
          <FormField
            control={form.control}
            name="deal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Deal ID</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Optional Deal ID" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {/* Assigned To ID field could be a user select component */}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || logActivityMutation.isPending || updateActivityMutation.isPending}>
            {form.formState.isSubmitting || logActivityMutation.isPending || updateActivityMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update Activity'
                : 'Log Activity'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
