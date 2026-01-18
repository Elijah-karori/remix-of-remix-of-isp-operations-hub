import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Search,
  Plus,
  ArrowRightLeft,
  Banknote,
  QrCode,
  PhoneCall,
  Mail,
  Users as UsersIcon, // Renamed to avoid conflict
  CreditCard, // For B2B
  FilePenLine, // For Ratiba
  Clock, // For status
  CheckCircle2, // For reconcile
} from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { MpesaTransactionOut } from '@/types/api';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  useMpesaTransactions,
  useCheckMpesaBalance,
  useRegisterC2BUrls,
  useSimulateC2B,
  useStkPush,
  useB2CPay,
  useB2BPay,
  useRemitTax,
  useCreateRatiba,
  useGenerateDynamicQR,
  useReverseMpesaTransaction,
  useCheckMpesaTransactionStatus,
  useReconcileMpesa
} from '@/hooks/use-finance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- M-Pesa Forms (within Dialogs) ---

// C2B Simulate Form
const c2bSimulateSchema = z.object({
  phone_number: z.string().min(10, 'Phone number is required').max(12, 'Phone number must be 10-12 digits'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  bill_ref_number: z.string().min(1, 'Bill reference is required'),
});
type C2BSimulateValues = z.infer<typeof c2bSimulateSchema>;

function C2BSimulateForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<C2BSimulateValues>({
    resolver: zodResolver(c2bSimulateSchema),
    defaultValues: { phone_number: '', amount: 10, bill_ref_number: '' },
  });
  const simulateMutation = useSimulateC2B();
  const onSubmit = async (values: C2BSimulateValues) => {
    await simulateMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="phone_number" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="254712345678" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="bill_ref_number" render={({ field }) => (<FormItem><FormLabel>Bill Reference</FormLabel><FormControl><Input placeholder="Invoice-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={simulateMutation.isPending}>{simulateMutation.isPending ? 'Simulating...' : 'Simulate C2B'}</Button>
      </form>
    </Form>
  );
}

// STK Push Form
const stkPushSchema = z.object({
  phone_number: z.string().min(10, 'Phone number is required').max(12, 'Phone number must be 10-12 digits'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  account_reference: z.string().min(1, 'Account reference is required'),
  description: z.string().optional(),
});
type STKPushValues = z.infer<typeof stkPushSchema>;

function STKPushForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<STKPushValues>({
    resolver: zodResolver(stkPushSchema),
    defaultValues: { phone_number: '', amount: 10, account_reference: '', description: '' },
  });
  const stkPushMutation = useStkPush();
  const onSubmit = async (values: STKPushValues) => {
    await stkPushMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="phone_number" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="254712345678" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="account_reference" render={({ field }) => (<FormItem><FormLabel>Account Reference</FormLabel><FormControl><Input placeholder="Customer-123" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Payment for services" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={stkPushMutation.isPending}>{stkPushMutation.isPending ? 'Initiating...' : 'Initiate STK Push'}</Button>
      </form>
    </Form>
  );
}

// B2C Pay Form
const b2cPaySchema = z.object({
  phone_number: z.string().min(10, 'Phone number is required').max(12, 'Phone number must be 10-12 digits'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  remarks: z.string().min(1, 'Remarks are required'),
  occasion: z.string().optional(),
});
type B2CPayValues = z.infer<typeof b2cPaySchema>;

function B2CPayForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<B2CPayValues>({
    resolver: zodResolver(b2cPaySchema),
    defaultValues: { phone_number: '', amount: 10, remarks: '', occasion: '' },
  });
  const b2cPayMutation = useB2CPay();
  const onSubmit = async (values: B2CPayValues) => {
    await b2cPayMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="phone_number" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="254712345678" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="remarks" render={({ field }) => (<FormItem><FormLabel>Remarks</FormLabel><FormControl><Input placeholder="Customer refund" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="occasion" render={({ field }) => (<FormItem><FormLabel>Occasion (Optional)</FormLabel><FormControl><Input placeholder="Refund" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={b2cPayMutation.isPending}>{b2cPayMutation.isPending ? 'Paying...' : 'Initiate B2C Payment'}</Button>
      </form>
    </Form>
  );
}

// B2B Pay Form
const b2bPaySchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  receiver_shortcode: z.string().min(1, 'Receiver shortcode is required'),
  account_reference: z.string().min(1, 'Account reference is required'),
});
type B2BPayValues = z.infer<typeof b2bPaySchema>;

function B2BPayForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<B2BPayValues>({
    resolver: zodResolver(b2bPaySchema),
    defaultValues: { amount: 10, receiver_shortcode: '', account_reference: '' },
  });
  const b2bPayMutation = useB2BPay();
  const onSubmit = async (values: B2BPayValues) => {
    await b2bPayMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="receiver_shortcode" render={({ field }) => (<FormItem><FormLabel>Receiver Shortcode</FormLabel><FormControl><Input placeholder="600000" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="account_reference" render={({ field }) => (<FormItem><FormLabel>Account Reference</FormLabel><FormControl><Input placeholder="Vendor-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={b2bPayMutation.isPending}>{b2bPayMutation.isPending ? 'Paying...' : 'Initiate B2B Payment'}</Button>
      </form>
    </Form>
  );
}

// Remit Tax Form
const remitTaxSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  remarks: z.string().min(1, 'Remarks are required'),
});
type RemitTaxValues = z.infer<typeof remitTaxSchema>;

function RemitTaxForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<RemitTaxValues>({
    resolver: zodResolver(remitTaxSchema),
    defaultValues: { amount: 10, remarks: '' },
  });
  const remitTaxMutation = useRemitTax();
  const onSubmit = async (values: RemitTaxValues) => {
    await remitTaxMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="remarks" render={({ field }) => (<FormItem><FormLabel>Remarks</FormLabel><FormControl><Input placeholder="KRA Tax Payment" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={remitTaxMutation.isPending}>{remitTaxMutation.isPending ? 'Remitting...' : 'Remit Tax'}</Button>
      </form>
    </Form>
  );
}

// Create Ratiba Form
const createRatibaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  phone_number: z.string().min(10, 'Phone number is required').max(12, 'Phone number must be 10-12 digits'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  frequency: z.string().min(1, 'Frequency is required'),
});
type CreateRatibaValues = z.infer<typeof createRatibaSchema>;

function CreateRatibaForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<CreateRatibaValues>({
    resolver: zodResolver(createRatibaSchema),
    defaultValues: { name: '', amount: 10, phone_number: '', start_date: '', end_date: '', frequency: 'Monthly' },
  });
  const createRatibaMutation = useCreateRatiba();
  const onSubmit = async (values: CreateRatibaValues) => {
    await createRatibaMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Loan Repayment" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="phone_number" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="254712345678" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="start_date" render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="end_date" render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="frequency" render={({ field }) => (<FormItem><FormLabel>Frequency</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent><SelectItem value="Daily">Daily</SelectItem><SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Quarterly">Quarterly</SelectItem><SelectItem value="Annually">Annually</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={createRatibaMutation.isPending}>{createRatibaMutation.isPending ? 'Creating...' : 'Create Ratiba'}</Button>
      </form>
    </Form>
  );
}

// Generate Dynamic QR Form
const generateQrSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  merchant_name: z.string().min(1, 'Merchant name is required'),
  ref_no: z.string().min(1, 'Reference number is required'),
  trx_code: z.string().optional(),
});
type GenerateQrValues = z.infer<typeof generateQrSchema>;

function GenerateQrForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<GenerateQrValues>({
    resolver: zodResolver(generateQrSchema),
    defaultValues: { amount: 10, merchant_name: 'ISP ERP', ref_no: '', trx_code: '' },
  });
  const generateQrMutation = useGenerateDynamicQR();
  const onSubmit = async (values: GenerateQrValues) => {
    await generateQrMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="merchant_name" render={({ field }) => (<FormItem><FormLabel>Merchant Name</FormLabel><FormControl><Input placeholder="ISP ERP" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="ref_no" render={({ field }) => (<FormItem><FormLabel>Reference Number</FormLabel><FormControl><Input placeholder="QR-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="trx_code" render={({ field }) => (<FormItem><FormLabel>Transaction Code (Optional)</FormLabel><FormControl><Input placeholder="BG" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={generateQrMutation.isPending}>{generateQrMutation.isPending ? 'Generating...' : 'Generate QR'}</Button>
      </form>
    </Form>
  );
}

// Reverse Transaction Form
const reverseTxnSchema = z.object({
  transaction_id: z.string().min(1, 'Transaction ID is required'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  remarks: z.string().optional(),
  receiver_party: z.string().optional(),
});
type ReverseTxnValues = z.infer<typeof reverseTxnSchema>;

function ReverseTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<ReverseTxnValues>({
    resolver: zodResolver(reverseTxnSchema),
    defaultValues: { transaction_id: '', amount: 10, remarks: '', receiver_party: '' },
  });
  const reverseTxnMutation = useReverseMpesaTransaction();
  const onSubmit = async (values: ReverseTxnValues) => {
    await reverseTxnMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="transaction_id" render={({ field }) => (<FormItem><FormLabel>Transaction ID</FormLabel><FormControl><Input placeholder="ABCDEFG" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="remarks" render={({ field }) => (<FormItem><FormLabel>Remarks (Optional)</FormLabel><FormControl><Input placeholder="Erroneous payment" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="receiver_party" render={({ field }) => (<FormItem><FormLabel>Receiver Party (Optional)</FormLabel><FormControl><Input placeholder="Customer A" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={reverseTxnMutation.isPending}>{reverseTxnMutation.isPending ? 'Reversing...' : 'Reverse Transaction'}</Button>
      </form>
    </Form>
  );
}

// Check Transaction Status Form
const checkTxnStatusSchema = z.object({
  transaction_id: z.string().min(1, 'Transaction ID is required'),
});
type CheckTxnStatusValues = z.infer<typeof checkTxnStatusSchema>;

function CheckTransactionStatusForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<CheckTxnStatusValues>({
    resolver: zodResolver(checkTxnStatusSchema),
    defaultValues: { transaction_id: '' },
  });
  const checkTxnStatusMutation = useCheckMpesaTransactionStatus();
  const onSubmit = async (values: CheckTxnStatusValues) => {
    await checkTxnStatusMutation.mutateAsync(values);
    onSuccess();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="transaction_id" render={({ field }) => (<FormItem><FormLabel>Transaction ID</FormLabel><FormControl><Input placeholder="ABCDEFG" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={checkTxnStatusMutation.isPending}>{checkTxnStatusMutation.isPending ? 'Checking...' : 'Check Status'}</Button>
      </form>
    </Form>
  );
}


export default function Mpesa() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');

  const { data: transactions, isLoading: isLoadingTransactions, error: transactionsError, refetch: refetchTransactions } = useMpesaTransactions({ limit, skip: page * limit });
  const { data: balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useCheckMpesaBalance();
  const registerC2BUrlsMutation = useRegisterC2BUrls();

  const filteredTransactions = transactions?.filter(tx =>
    tx.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.transaction_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const handleRegisterC2B = async () => {
    if (window.confirm('Are you sure you want to register C2B validation and confirmation URLs? This action configures your M-Pesa shortcode.')) {
      try {
        await registerC2BUrlsMutation.mutateAsync();
        toast.success('C2B URLs registration request sent!');
      } catch (err: any) {
        toast.error(`Failed to register C2B URLs: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleRefreshAll = () => {
    refetchTransactions();
    refetchBalance();
    toast.info('Refreshing all M-Pesa data...');
  };

  if (isLoadingTransactions || isLoadingBalance) {
    return (
      <DashboardLayout title="M-Pesa Management" subtitle="Manage M-Pesa transactions and services">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (transactionsError) {
    return (
      <DashboardLayout title="M-Pesa Management" subtitle="Manage M-Pesa transactions and services">
        <ErrorState message="Failed to load M-Pesa transactions" onRetry={refetchTransactions} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="M-Pesa Management" subtitle="Manage M-Pesa transactions and services">
      <div className="space-y-6">
        {/* Overview & Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>M-Pesa Overview</CardTitle>
                <CardDescription>Current balance and quick actions.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefreshAll}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh All
                </Button>
                <Button size="sm" onClick={() => handleOpenDialog(<C2BSimulateForm onSuccess={handleCloseDialog} />, 'Simulate C2B Transaction', 'Simulate a customer-to-business transaction.')}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" /> Simulate C2B
                </Button>
                <Button size="sm" onClick={() => handleOpenDialog(<STKPushForm onSuccess={handleCloseDialog} />, 'Initiate STK Push', 'Push a M-Pesa STK prompt to a customer\'s phone.')}>
                  <PhoneCall className="h-4 w-4 mr-2" /> STK Push
                </Button>
                <Button size="sm" onClick={() => handleOpenDialog(<B2CPayForm onSuccess={handleCloseDialog} />, 'Initiate B2C Payment', 'Make a business-to-customer payment.')}>
                  <UsersIcon className="h-4 w-4 mr-2" /> B2C Pay
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current M-Pesa Balance</p>
                  <p className="text-2xl font-bold">KES {balance?.toLocaleString() || 'N/A'}</p>
                </div>
                <Banknote className="h-6 w-6 text-primary" />
              </Card>
              {/* Other overview cards can go here */}
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleRegisterC2B} disabled={registerC2BUrlsMutation.isPending}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Register C2B URLs
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(<B2BPayForm onSuccess={handleCloseDialog} />, 'Initiate B2B Payment', 'Make a business-to-business payment.')}>
                <CreditCard className="h-4 w-4 mr-2" /> B2B Pay
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(<RemitTaxForm onSuccess={handleCloseDialog} />, 'Remit M-Pesa Tax', 'Make a tax remittance via M-Pesa.')}>
                <FilePenLine className="h-4 w-4 mr-2" /> Remit Tax
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(<CreateRatibaForm onSuccess={handleCloseDialog} />, 'Create M-Pesa Ratiba', 'Set up a recurring payment (standing order).')}>
                <FilePenLine className="h-4 w-4 mr-2" /> Create Ratiba
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(<GenerateQrForm onSuccess={handleCloseDialog} />, 'Generate Dynamic QR Code', 'Generate a dynamic M-Pesa QR code for payments.')}>
                <QrCode className="h-4 w-4 mr-2" /> Generate QR
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(<ReverseTransactionForm onSuccess={handleCloseDialog} />, 'Reverse Transaction', 'Reverse an M-Pesa transaction.')}>
                <ArrowRightLeft className="h-4 w-4 mr-2" /> Reverse Transaction
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(<CheckTransactionStatusForm onSuccess={handleCloseDialog} />, 'Check Transaction Status', 'Check the status of an M-Pesa transaction using its ID.')}>
                <Clock className="h-4 w-4 mr-2" /> Check Txn Status
              </Button>
              {/* <Button variant="outline" size="sm" onClick={() => handleOpenDialog(<ReconcileMpesaForm onSuccess={handleCloseDialog} />, 'Reconcile M-Pesa', 'Reconcile M-Pesa transactions for a given period.')}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Reconcile
              </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>M-Pesa Transactions</CardTitle>
                <CardDescription>Recent M-Pesa inflows and outflows.</CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.transaction_type}</TableCell>
                        <TableCell>{tx.mpesa_receipt_number || '-'}</TableCell>
                        <TableCell>{tx.phone_number}</TableCell>
                        <TableCell className="text-right">KES {tx.amount.toLocaleString()}</TableCell>
                        <TableCell>{tx.transaction_date ? format(parseISO(tx.transaction_date), 'MMM d, yyyy HH:mm') : format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <Badge variant={tx.status === 'Completed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{tx.reference || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Dialog for M-Pesa Forms */}
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
