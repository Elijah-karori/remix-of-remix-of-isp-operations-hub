import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form'; // Added useFieldArray
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { InvoiceOut, InvoiceCreate, InvoiceUpdate } from '@/types/api';
import { useGenerateInvoice, useUpdateInvoice } from '@/hooks/use-finance';
import { toast } from 'sonner';
import { Trash2, PlusCircle } from 'lucide-react'; // New icons
import { cn } from '@/lib/utils'; // Added cn for conditional classnames

interface InvoiceFormProps {
  initialData?: InvoiceOut;
  onSuccess: () => void;
  onCancel: () => void;
}

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.coerce.number().min(0, 'Unit price must be non-negative'),
});

const formSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'), // Assuming customer_name is used for display
  customer_id: z.coerce.number().optional(), // If linking to a CRM customer
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one invoice item is required'),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

export function InvoiceForm({ initialData, onSuccess, onCancel }: InvoiceFormProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      issue_date: initialData.issue_date ? new Date(initialData.issue_date).toISOString().split('T')[0] : '',
      due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
      items: initialData.items.map(item => ({
        ...item,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    } : {
      customer_name: '',
      customer_id: undefined,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // 30 days from now
      items: [{ description: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        issue_date: initialData.issue_date ? new Date(initialData.issue_date).toISOString().split('T')[0] : '',
        due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
        items: initialData.items.map(item => ({
          ...item,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      });
    }
  }, [initialData, form]);

  const generateInvoiceMutation = useGenerateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      // Calculate total amount from items
      const totalAmount = values.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      if (isEditing) {
        if (!initialData?.id) {
          toast.error("Error: Invoice ID is missing for update operation.");
          return;
        }
        await updateInvoiceMutation.mutateAsync({ id: initialData.id, data: { ...values, total_amount: totalAmount } as InvoiceUpdate });
        toast.success('Invoice updated successfully!');
      } else {
        await generateInvoiceMutation.mutateAsync({ ...values, total_amount: totalAmount } as InvoiceCreate);
        toast.success('Invoice generated successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save invoice: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Optionally add customer_id field with a selection component */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">Invoice Items</h3>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 border p-2 rounded-md items-end">
              <FormField
                control={form.control}
                name={`items.${index}.description`}
                render={({ field: itemField }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className={cn(index > 0 && "sr-only")}>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Service Description" {...itemField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field: itemField }) => (
                  <FormItem>
                    <FormLabel className={cn(index > 0 && "sr-only")}>Qty</FormLabel>
                    <FormControl>
                      <Input type="number" {...itemField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.unit_price`}
                render={({ field: itemField }) => (
                  <FormItem>
                    <FormLabel className={cn(index > 0 && "sr-only")}>Unit Price</FormLabel>
                    <FormControl>
                      <Input type="number" {...itemField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || generateInvoiceMutation.isPending || updateInvoiceMutation.isPending}>
            {form.formState.isSubmitting || generateInvoiceMutation.isPending || updateInvoiceMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update Invoice'
                : 'Generate Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
