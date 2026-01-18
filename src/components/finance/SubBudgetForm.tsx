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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubBudget, SubBudgetCreate, SubBudgetUpdate, FinancialAccount } from '@/types/api';
import { useCreateSubBudget, useUpdateSubBudget } from '@/hooks/use-finance';
import { financeApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SubBudgetFormProps {
  masterBudgetId: number;
  initialData?: SubBudget;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Sub-budget name is required'),
  amount: z.coerce.number().min(0, 'Amount must be non-negative'),
  financial_account_id: z.coerce.number().optional(),
});

type SubBudgetFormValues = z.infer<typeof formSchema>;

export function SubBudgetForm({ masterBudgetId, initialData, onSuccess, onCancel }: SubBudgetFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<SubBudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      amount: typeof initialData.amount === 'string' ? parseFloat(initialData.amount) : initialData.amount,
      financial_account_id: initialData.financial_account_id || undefined,
    } : {
      name: '',
      amount: 0,
      financial_account_id: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        amount: typeof initialData.amount === 'string' ? parseFloat(initialData.amount) : initialData.amount,
        financial_account_id: initialData.financial_account_id || undefined,
      });
    }
  }, [initialData, form]);

  const { data: financialAccounts } = useQuery<FinancialAccount[]>({
    queryKey: ['finance', 'financial-accounts'],
    queryFn: () => financeApi.financialAccounts(),
  });

  const createSubBudgetMutation = useCreateSubBudget();
  const updateSubBudgetMutation = useUpdateSubBudget();

  const onSubmit = async (values: SubBudgetFormValues) => {
    try {
      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Sub Budget ID is missing for update operation.");
          return;
        }
        await updateSubBudgetMutation.mutateAsync({ id: initialData.id, data: values as SubBudgetUpdate });
        toast.success('Sub Budget updated successfully!');
      } else {
        await createSubBudgetMutation.mutateAsync({ masterBudgetId, data: values as SubBudgetCreate });
        toast.success('Sub Budget created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save sub budget: ${error.message || 'Unknown error'}`);
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
              <FormLabel>Sub-budget Name</FormLabel>
              <FormControl>
                <Input placeholder="Marketing Campaign" {...field} />
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
              <FormLabel>Allocated Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="50000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="financial_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Financial Account (Optional)</FormLabel>
              <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString() || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a financial account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {financialAccounts?.map(account => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      {account.name} ({account.balance} {account.currency})
                    </SelectItem>
                  ))}
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
          <Button type="submit" disabled={form.formState.isSubmitting || createSubBudgetMutation.isPending || updateSubBudgetMutation.isPending}>
            {form.formState.isSubmitting || createSubBudgetMutation.isPending || updateSubBudgetMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update Sub Budget'
                : 'Create Sub Budget'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
