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
import { Lead, LeadCreate, LeadUpdate } from '@/types/api';
import { useCreateLead, useUpdateLead } from '@/hooks/use-crm'; // Assuming these hooks will be created soon
import { toast } from 'sonner';

interface LeadFormProps {
  initialData?: Lead;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Unqualified']),
  source: z.string().optional(),
  description: z.string().optional(),
  owner_id: z.number().optional(), // Assuming owner_id is a number
});

type LeadFormValues = z.infer<typeof formSchema>;

export function LeadForm({ initialData, onSuccess, onCancel }: LeadFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      status: 'New',
      source: '',
      description: '',
      owner_id: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  const onSubmit = async (values: LeadFormValues) => {
    try {
      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Lead ID is missing for update operation.");
          return;
        }
        await updateLeadMutation.mutateAsync({ id: initialData.id, data: values as LeadUpdate });
        toast.success('Lead updated successfully!');
      } else {
        await createLeadMutation.mutateAsync(values as LeadCreate);
        toast.success('Lead created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save lead: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+254712345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" {...field} />
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
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Unqualified">Unqualified</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Input placeholder="Website, Referral, etc." {...field} />
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
                <Textarea placeholder="Additional notes about the lead" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Potentially add a Field for owner_id if user selection is implemented */}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || createLeadMutation.isPending || updateLeadMutation.isPending}>
            {form.formState.isSubmitting || createLeadMutation.isPending || updateLeadMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update Lead'
                : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
