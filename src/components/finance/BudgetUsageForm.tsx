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
import { BudgetUsage, BudgetUsageCreate, BudgetUsageUpdate, BudgetUsageType } from '@/types/api';
import { useCreateBudgetUsage, useUpdateBudgetUsage } from '@/hooks/use-finance';
import { toast } from 'sonner';

interface BudgetUsageFormProps {
  subBudgetId: number;
  initialData?: BudgetUsage;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().min(0, 'Amount must be non-negative'),
  type: z.enum(['expense', 'allocation', 'adjustment']),
  transaction_date: z.string().min(1, 'Transaction date is required'),
});

type BudgetUsageFormValues = z.infer<typeof formSchema>;

export function BudgetUsageForm({ subBudgetId, initialData, onSuccess, onCancel }: BudgetUsageFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<BudgetUsageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      amount: typeof initialData.amount === 'string' ? parseFloat(initialData.amount) : initialData.amount,
      transaction_date: initialData.transaction_date ? new Date(initialData.transaction_date).toISOString().split('T')[0] : '',
    } : {
      description: '',
      amount: 0,
      type: 'expense', // Default type
      transaction_date: new Date().toISOString().split('T')[0], // Default to today
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        amount: typeof initialData.amount === 'string' ? parseFloat(initialData.amount) : initialData.amount,
        transaction_date: initialData.transaction_date ? new Date(initialData.transaction_date).toISOString().split('T')[0] : '',
      });
    }
  }, [initialData, form]);

  const createBudgetUsageMutation = useCreateBudgetUsage();
  const updateBudgetUsageMutation = useUpdateBudgetUsage();

  const onSubmit = async (values: BudgetUsageFormValues) => {
    try {
      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Budget Usage ID is missing for update operation.");
          return;
        }
        await updateBudgetUsageMutation.mutateAsync({ id: initialData.id, data: values as BudgetUsageUpdate });
        toast.success('Budget Usage updated successfully!');
      } else {
        await createBudgetUsageMutation.mutateAsync({ ...values, sub_budget_id: subBudgetId } as BudgetUsageCreate);
        toast.success('Budget Usage created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save budget usage: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Spent on office supplies" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select usage type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="allocation">Allocation</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || createBudgetUsageMutation.isPending || updateBudgetUsageMutation.isPending}>
            {form.formState.isSubmitting || createBudgetUsageMutation.isPending || updateBudgetUsageMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update Usage'
                : 'Create Usage'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
