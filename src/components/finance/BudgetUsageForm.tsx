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
import { BudgetUsageOut, BudgetUsageCreate, BudgetUsageUpdate } from '@/types/api';
import { useCreateBudgetUsage, useUpdateBudgetUsage } from '@/hooks/use-finance';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { useSubBudgets } from '@/hooks/use-finance';

interface BudgetUsageFormProps {
  subBudgetId?: number;
  initialData?: BudgetUsageOut;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  sub_budget_id: z.coerce.number().int().min(1, 'Sub-budget is required.'),
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().min(0, 'Amount must be non-negative.'),
  transaction_date: z.date({ required_error: "Date is required." }),
  type: z.enum(['expense', 'allocation', 'adjustment']).default('expense'),
  status: z.enum(['approved', 'pending', 'rejected']),
});

type BudgetUsageFormValues = z.infer<typeof formSchema>;

export function BudgetUsageForm({ subBudgetId, initialData, onSuccess, onCancel }: BudgetUsageFormProps) {
  const isEditing = !!initialData?.id;

  // Assuming a masterBudgetId is passed for context if not editing
  // For simplicity, we'll fetch all sub-budgets. In a real app, you might filter by masterBudgetId
  const { data: subBudgets, isLoading: loadingSubBudgets } = useSubBudgets(subBudgetId || 0, 0, 1000);

  const form = useForm<BudgetUsageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      sub_budget_id: initialData.sub_budget_id,
      description: initialData.description,
      amount: initialData.amount,
      transaction_date: new Date(initialData.transaction_date),
      type: initialData.type || 'expense',
      status: initialData.status,
    } : {
      sub_budget_id: subBudgetId || undefined,
      description: '',
      amount: 0,
      transaction_date: new Date(),
      type: 'expense',
      status: 'pending',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        sub_budget_id: initialData.sub_budget_id,
        description: initialData.description,
        amount: initialData.amount,
        transaction_date: new Date(initialData.transaction_date),
        type: initialData.type || 'expense',
        status: initialData.status,
      });
    }
  }, [initialData, form]);

  const createUsageMutation = useCreateBudgetUsage();
  const updateUsageMutation = useUpdateBudgetUsage();

  const onSubmit = async (values: BudgetUsageFormValues) => {
    try {
      const usageData: BudgetUsageCreate = {
        sub_budget_id: values.sub_budget_id,
        description: values.description,
        amount: values.amount,
        type: values.type,
        transaction_date: format(values.transaction_date, 'yyyy-MM-dd'),
      };

      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Budget Usage ID is missing for update operation.");
          return;
        }
        await updateUsageMutation.mutateAsync({ id: initialData.id, data: usageData as BudgetUsageUpdate });
        toast.success('Budget Usage updated successfully!');
      } else {
        await createUsageMutation.mutateAsync(usageData);
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
          name="sub_budget_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-budget</FormLabel>
              <Select onValueChange={value => field.onChange(parseInt(value))} value={field.value ? String(field.value) : ""}>
                <FormControl>
                  <SelectTrigger disabled={loadingSubBudgets}>
                    <SelectValue placeholder="Select a sub-budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingSubBudgets ? (
                    <SelectItem value="loading" disabled>Loading sub-budgets...</SelectItem>
                  ) : (
                    subBudgets?.map((subBudget) => (
                      <SelectItem key={subBudget.id} value={String(subBudget.id)}>
                        {subBudget.name}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Purchased new equipment" {...field} />
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
                <Input type="number" placeholder="e.g., 5000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createUsageMutation.isPending || updateUsageMutation.isPending}>
            {createUsageMutation.isPending || updateUsageMutation.isPending ? <LoadingSpinner className="mr-2" /> : null}
            {isEditing ? 'Update Usage' : 'Create Usage'}
          </Button>
        </div>
      </form>
    </Form>
  );
}