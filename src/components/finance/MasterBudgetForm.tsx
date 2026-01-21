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
import { MasterBudgetOut, MasterBudgetCreate, MasterBudgetUpdate } from '@/types/api';
import { useCreateMasterBudget, useUpdateMasterBudget } from '@/hooks/use-finance';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';

interface MasterBudgetFormProps {
  initialData?: MasterBudgetOut;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Budget name is required.'),
  description: z.string().optional(),
  total_amount: z.coerce.number().min(0, 'Total amount must be non-negative.'),
  allocated_amount: z.coerce.number().min(0, 'Allocated amount must be non-negative.').optional(),
  start_date: z.date({ required_error: "Start date is required." }),
  end_date: z.date({ required_error: "End date is required." }),
  status: z.string(),
});

type MasterBudgetFormValues = z.infer<typeof formSchema>;

export function MasterBudgetForm({ initialData, onSuccess, onCancel }: MasterBudgetFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<MasterBudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: '',
      total_amount: initialData?.total_amount || 0,
      allocated_amount: initialData?.allocated_amount || 0,
      start_date: initialData?.start_date ? new Date(initialData.start_date) : new Date(),
      end_date: initialData?.end_date ? new Date(initialData.end_date) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: initialData?.status || 'Planned',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: '',
        total_amount: initialData.total_amount,
        allocated_amount: initialData.allocated_amount || 0,
        start_date: new Date(initialData.start_date),
        end_date: new Date(initialData.end_date),
        status: initialData.status || 'Planned',
      });
    }
  }, [initialData, form]);

  const createBudgetMutation = useCreateMasterBudget();
  const updateBudgetMutation = useUpdateMasterBudget();

  const onSubmit = async (values: MasterBudgetFormValues) => {
    try {
      const budgetData = {
        ...values,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
      };

      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Master Budget ID is missing for update operation.");
          return;
        }
        await updateBudgetMutation.mutateAsync({ id: initialData.id, data: budgetData as unknown as MasterBudgetUpdate });
        toast.success('Master Budget updated successfully!');
      } else {
        await createBudgetMutation.mutateAsync(budgetData as unknown as MasterBudgetCreate);
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
                <Input placeholder="e.g., Annual Operating Budget" {...field} />
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
                <Textarea placeholder="Brief description of this budget" {...field} />
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
                <Input type="number" placeholder="e.g., 1000000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allocated_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allocated Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 750000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
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
          name="end_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
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
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
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
          <Button type="submit" disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}>
            {createBudgetMutation.isPending || updateBudgetMutation.isPending ? <LoadingSpinner className="mr-2" /> : null}
            {isEditing ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Form>
  );
}