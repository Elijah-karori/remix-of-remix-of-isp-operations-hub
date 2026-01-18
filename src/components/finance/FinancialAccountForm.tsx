import React from 'react';
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
import { FinancialAccount, FinancialAccountCreate, FinancialAccountUpdate } from '@/types/api';
import { useCreateFinancialAccount, useUpdateFinancialAccount } from '@/hooks/use-finance';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/loading-spinner';

interface FinancialAccountFormProps {
  initialData?: FinancialAccount;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Account name is required.'),
  account_number: z.string().min(1, 'Account number is required.'),
  bank_name: z.string().min(1, 'Bank name is required.'),
  account_type: z.enum(['Checking', 'Savings', 'Credit Card', 'Investment', 'Other']),
  balance: z.coerce.number().min(0, 'Balance must be non-negative.'),
  currency: z.string().min(1, 'Currency is required.').default('KES'),
});

type FinancialAccountFormValues = z.infer<typeof formSchema>;

export function FinancialAccountForm({ initialData, onSuccess, onCancel }: FinancialAccountFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<FinancialAccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      account_number: '',
      bank_name: '',
      account_type: 'Checking',
      balance: 0,
      currency: 'KES',
    },
  });

  const createAccountMutation = useCreateFinancialAccount();
  const updateAccountMutation = useUpdateFinancialAccount();

  const onSubmit = async (values: FinancialAccountFormValues) => {
    try {
      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Account ID is missing for update operation.");
          return;
        }
        await updateAccountMutation.mutateAsync({ id: initialData.id, data: values as FinancialAccountUpdate });
        toast.success('Financial Account updated successfully!');
      } else {
        await createAccountMutation.mutateAsync(values as FinancialAccountCreate);
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
                <Input placeholder="e.g., KCB Main Account" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="account_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 0123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., KCB Bank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="account_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
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
              <FormLabel>Initial Balance</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 100000" {...field} />
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
              <FormControl>
                <Input placeholder="e.g., KES" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createAccountMutation.isPending || updateAccountMutation.isPending}>
            {createAccountMutation.isPending || updateAccountMutation.isPending ? <LoadingSpinner className="mr-2" /> : null}
            {isEditing ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}