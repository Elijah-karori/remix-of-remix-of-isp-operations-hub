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
import { Deal, DealCreate, DealUpdate } from '@/types/api';
import { useCreateDeal, useUpdateDeal } from '@/hooks/use-crm';
import { toast } from 'sonner';

interface DealFormProps {
  initialData?: Deal;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  amount: z.coerce.number().min(0, 'Amount must be non-negative'),
  stage: z.enum(['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
  close_date: z.string().optional(), // ISO date string
  lead_id: z.number().optional(),
  owner_id: z.number().optional(),
  description: z.string().optional(),
});

type DealFormValues = z.infer<typeof formSchema>;

export function DealForm({ initialData, onSuccess, onCancel }: DealFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<DealFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      amount: initialData.amount || initialData.value || 0,
      stage: (initialData.stage as any) || 'Prospecting',
      close_date: initialData.close_date || initialData.expected_close_date,
      lead_id: initialData.lead_id,
      owner_id: initialData.owner_id,
      description: initialData.description || '',
    } : {
      name: '',
      amount: 0,
      stage: 'Prospecting',
      close_date: undefined,
      lead_id: undefined,
      owner_id: undefined,
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData as any);
    }
  }, [initialData, form]);

  const createDealMutation = useCreateDeal();
  const updateDealMutation = useUpdateDeal();

  const onSubmit = async (values: DealFormValues) => {
    try {
      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Deal ID is missing for update operation.");
          return;
        }
        await updateDealMutation.mutateAsync({ id: initialData.id, data: values as DealUpdate });
        toast.success('Deal updated successfully!');
      } else {
        await createDealMutation.mutateAsync(values as DealCreate);
        toast.success('Deal created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save deal: ${error.message || 'Unknown error'}`);
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
              <FormLabel>Deal Name</FormLabel>
              <FormControl>
                <Input placeholder="Project X Implementation" {...field} />
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
                <Input type="number" placeholder="10000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stage</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Prospecting">Prospecting</SelectItem>
                  <SelectItem value="Qualification">Qualification</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Closed Won">Closed Won</SelectItem>
                  <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="close_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Close Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} /> {/* Consider a date picker component */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Potentially add fields for lead_id and owner_id if selection is implemented */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Details about the deal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || createDealMutation.isPending || updateDealMutation.isPending}>
            {form.formState.isSubmitting || createDealMutation.isPending || updateDealMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update Deal'
                : 'Create Deal'}
          </Button>
        </div>
      </form>
    </Form>
  );
}