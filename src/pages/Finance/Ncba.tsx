import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, CreditCard, RefreshCw } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNcbaPay } from '@/hooks/use-finance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- NCBA Pay Form (within Dialog) ---
const ncbaPaySchema = z.object({
  account_number: z.string().min(1, 'Account number is required'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  currency: z.string().optional(),
});
type NcbaPayValues = z.infer<typeof ncbaPaySchema>;

function NcbaPayForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<NcbaPayValues>({
    resolver: zodResolver(ncbaPaySchema),
    defaultValues: { account_number: '', amount: 0, currency: 'KES' },
  });
  const ncbaPayMutation = useNcbaPay();
  const onSubmit = async (values: NcbaPayValues) => {
    await ncbaPayMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="account_number" render={({ field }) => (<FormItem><FormLabel>Recipient Account Number</FormLabel><FormControl><Input placeholder="1234567890" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl><SelectContent><SelectItem value="KES">KES</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={ncbaPayMutation.isPending}>{ncbaPayMutation.isPending ? 'Processing...' : 'Make Payment'}</Button>
      </form>
    </Form>
  );
}


export default function Ncba() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');

  const handleOpenDialog = (content: React.ReactNode, title: string, description: string) => {
    setDialogContent(content);
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogContent(null);
  };

  const handleRefresh = () => {
    // No specific data to refetch for NCBA Pay page without a transactions list
    toast.info('Refreshing NCBA Bank data (if available)...');
  };

  return (
    <DashboardLayout title="NCBA Bank Management" subtitle="Manage NCBA Bank integrations and payments">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>NCBA Bank Operations</CardTitle>
                <CardDescription>Initiate payments via NCBA Bank.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
                <Button size="sm" onClick={() => handleOpenDialog(<NcbaPayForm onSuccess={handleCloseDialog} />, 'Initiate NCBA Payment', 'Make a direct payment via NCBA Bank.')}>
                  <Banknote className="h-4 w-4 mr-2" /> Make Payment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Direct Payments</p>
                  <p className="text-2xl font-bold">Secure Bank Transfers</p>
                </div>
                <CreditCard className="h-6 w-6 text-primary" />
              </Card>
              {/* Future: Add more NCBA specific features or status displays here */}
            </div>
            <p className="mt-4 text-muted-foreground">
              Note: Full transaction history and additional features for NCBA Bank would require more extensive API endpoints.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Dialog for NCBA Forms */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          {dialogContent}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
