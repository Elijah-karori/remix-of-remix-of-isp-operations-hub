import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const purchaseOrderFormSchema = z.object({
  supplier: z.string().min(2, { message: 'Supplier name must be at least 2 characters.' }),
  item: z.string().min(2, { message: 'Item name must be at least 2 characters.' }),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().min(1, { message: 'Quantity must be at least 1.' })
  ),
  notes: z.string().optional(),
  // Add other purchase order fields as needed
});

interface PurchaseOrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialItem?: string;
  initialQuantity?: number;
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ 
  onSuccess, 
  onCancel,
  initialItem = '',
  initialQuantity = 1,
}) => {
  const form = useForm<z.infer<typeof purchaseOrderFormSchema>>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplier: '',
      item: initialItem,
      quantity: initialQuantity,
      notes: '',
    },
  });

  const onSubmit = (values: z.infer<typeof purchaseOrderFormSchema>) => {
    console.log('Purchase Order form submitted:', values);
    // Here you would integrate with procurementApi.createOrder
    toast.success('Purchase Order created successfully (simulated)!');
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <FormControl>
                <Input placeholder="e.g., FiberPro Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="item"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 500m Fiber Optic Cable" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any specific requirements or notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Add more fields here */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Order</Button>
        </div>
      </form>
    </Form>
  );
};