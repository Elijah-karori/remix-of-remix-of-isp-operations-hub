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
import { SubBudgetOut, SubBudgetCreate, SubBudgetUpdate } from '@/types/api';
import { useCreateSubBudget, useUpdateSubBudget } from '@/hooks/use-finance';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';

interface SubBudgetFormProps {
  masterBudgetId: number;
  initialData?: SubBudgetOut;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Sub-budget name is required.'),
  description: z.string().optional(),
  allocated_amount: z.coerce.number().min(0, 'Allocated amount must be non-negative.'),
  spent_amount: z.coerce.number().min(0, 'Spent amount must be non-negative.').optional(),
  start_date: z.date({ required_error: "Start date is required." }),
  end_date: z.date({ required_error: "End date is required." }),
  status: z.string(),
  category: z.string().min(1, 'Category is required.'),
});

type SubBudgetFormValues = z.infer<typeof formSchema>;

export function SubBudgetForm({ masterBudgetId, initialData, onSuccess, onCancel }: SubBudgetFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<SubBudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: '',
      allocated_amount: initialData?.allocated_amount || 0,
      spent_amount: initialData?.spent_amount || 0,
      start_date: initialData?.start_date ? new Date(initialData.start_date) : new Date(),
      end_date: initialData?.end_date ? new Date(initialData.end_date) : new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: initialData?.status || 'Planned',
      category: initialData?.category || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: '',
        allocated_amount: initialData.allocated_amount || 0,
        spent_amount: initialData.spent_amount || 0,
        start_date: initialData.start_date ? new Date(initialData.start_date) : new Date(),
        end_date: initialData.end_date ? new Date(initialData.end_date) : new Date(new Date().setMonth(new Date().getMonth() + 3)),
        status: initialData.status || 'Planned',
        category: initialData.category || '',
      });
    }
  }, [initialData, form]);

  const createSubBudgetMutation = useCreateSubBudget();
  const updateSubBudgetMutation = useUpdateSubBudget();

  const onSubmit = async (values: SubBudgetFormValues) => {
    try {
      const subBudgetData = {
        ...values,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
      };

      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Sub-budget ID is missing for update operation.");
          return;
        }
        await updateSubBudgetMutation.mutateAsync({ id: initialData.id, data: subBudgetData as unknown as SubBudgetUpdate });
        toast.success('Sub-budget updated successfully!');
      } else {
        const createData = { ...subBudgetData, master_budget_id: masterBudgetId };
        await createSubBudgetMutation.mutateAsync({ masterBudgetId, data: createData as unknown as SubBudgetCreate });
        toast.success('Sub-budget created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save sub-budget: ${error.message || 'Unknown error'}`);
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
                <Input placeholder="e.g., Marketing Campaign Q1" {...field} />
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
                <Textarea placeholder="Brief description of this sub-budget" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Marketing, Operations, HR" {...field} />
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
                <Input type="number" placeholder="e.g., 50000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="spent_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spent Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 20000" {...field} />
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
          <Button type="submit" disabled={createSubBudgetMutation.isPending || updateSubBudgetMutation.isPending}>
            {createSubBudgetMutation.isPending || updateSubBudgetMutation.isPending ? <LoadingSpinner className="mr-2" /> : null}
            {isEditing ? 'Update Sub-budget' : 'Create Sub-budget'}
          </Button>
        </div>
      </form>
    </Form>
  );
}