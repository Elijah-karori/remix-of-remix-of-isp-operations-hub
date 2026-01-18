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
import { Checkbox } from '@/components/ui/checkbox';
import { FinancialAccount, FinancialAccountCreate, FinancialAccountUpdate } from '@/types/api';
import { useCreateFinancialAccount, useUpdateFinancialAccount } from '@/hooks/use-finance';
import { toast } from 'sonner';
import { FormDescription } from '@/components/ui/form'; // Added FormDescription

interface FinancialAccountFormProps {
  initialData?: FinancialAccount;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.string().min(1, 'Account type is required'),
  balance: z.coerce.number().min(0, 'Balance must be non-negative'),
  currency: z.string().min(1, 'Currency is required'),
  is_active: z.boolean().optional(),
});

type FinancialAccountFormValues = z.infer<typeof formSchema>;

export function FinancialAccountForm({ initialData, onSuccess, onCancel }: FinancialAccountFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<FinancialAccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      type: 'Bank', // Default type
      balance: 0,
      currency: 'KES', // Default currency
      is_active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        balance: typeof initialData.balance === 'string' ? parseFloat(initialData.balance) : initialData.balance,
      });
    }
  }, [initialData, form]);

  const createFinancialAccountMutation = useCreateFinancialAccount();
  const updateFinancialAccountMutation = useUpdateFinancialAccount();

  const onSubmit = async (values: FinancialAccountFormValues) => {
    try {
      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Financial Account ID is missing for update operation.");
          return;
        }
        await updateFinancialAccountMutation.mutateAsync({ id: initialData.id, data: values as FinancialAccountUpdate });
        toast.success('Financial Account updated successfully!');
      } else {
        await createFinancialAccountMutation.mutateAsync(values as FinancialAccountCreate);
        toast.success('Financial Account created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save financial account: ${error.message || 'Unknown error'}`);
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
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="Main Bank Account" {...field} />
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
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Balance</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Is Active
                </FormLabel>
                <FormDescription>
                  Mark this account as active or inactive.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || createFinancialAccountMutation.isPending || updateFinancialAccountMutation.isPending}>
            {form.formState.isSubmitting || createFinancialAccountMutation.isPending || updateFinancialAccountMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update Account'
                : 'Create Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
