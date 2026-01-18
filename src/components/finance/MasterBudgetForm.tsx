import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MasterBudget, MasterBudgetCreate, MasterBudgetUpdate } from '@/types/api';
import { useCreateMasterBudget, useUpdateMasterBudget } from '@/hooks/use-finance';
import { toast } from 'sonner';

interface MasterBudgetFormProps {
  initialData?: MasterBudget;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  total_amount: z.coerce.number().min(0, 'Total amount must be non-negative'),
});

type MasterBudgetFormValues = z.infer<typeof formSchema>;

export function MasterBudgetForm({ initialData, onSuccess, onCancel }: MasterBudgetFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<MasterBudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      start_date: initialData.start_date,
      end_date: initialData.end_date,
      total_amount: typeof initialData.total_amount === 'string' ? parseFloat(initialData.total_amount) : initialData.total_amount,
    } : {
      name: '',
      start_date: '',
      end_date: '',
      total_amount: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      // Format dates to YYYY-MM-DD for input type="date"
      form.reset({
        ...initialData,
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
        total_amount: typeof initialData.total_amount === 'string' ? parseFloat(initialData.total_amount) : initialData.total_amount,
      });
    }
  }, [initialData, form]);

  const createMasterBudgetMutation = useCreateMasterBudget();
  const updateMasterBudgetMutation = useUpdateMasterBudget();

  const onSubmit = async (values: MasterBudgetFormValues) => {
    try {
      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Master Budget ID is missing for update operation.");
          return;
        }
        await updateMasterBudgetMutation.mutateAsync({ id: initialData.id, data: values as MasterBudgetUpdate });
        toast.success('Master Budget updated successfully!');
      } else {
        await createMasterBudgetMutation.mutateAsync(values as MasterBudgetCreate);
        toast.success('Master Budget created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save master budget: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Name</FormLabel>
              <FormControl>
                <Input placeholder="Annual Operating Budget" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1000000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || createMasterBudgetMutation.isPending || updateMasterBudgetMutation.isPending}>
            {form.formState.isSubmitting || createMasterBudgetMutation.isPending || updateMasterBudgetMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update Master Budget'
                : 'Create Master Budget'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
