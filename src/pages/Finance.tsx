import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Send,
  CheckCircle,
  Clock,
  Smartphone,
  FileText,
  Plus,
  QrCode,
  RotateCcw,
  RefreshCcw,
  CalendarCheck,
  Zap,
  Banknote,
  Bank,
  MoveDown,
  ChevronDown,
  ChevronUp,
  XCircle,
  LineChart, // For analytics charts
  GanttChart, // For project related icons
  Calculator, // For variance/forecast
  Hourglass, // For pending items
  ClipboardCheck, // For approvals
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line, // For monthly profit
} from "recharts";
import {
  useInfrastructureProfitability,
  useOverdueInvoices,
  useMpesaTransactions,
  useCheckMpesaBalance,
  useUpdateInvoice,
  useRegisterC2BUrls,
  useSimulateC2B,
  useStkPush,
  useGenerateDynamicQR,
  useB2CPay,
  useB2BPay,
  useRemitTax,
  useCreateRatiba,
  useCheckMpesaTransactionStatus,
  useReverseMpesaTransaction,
  useReconcileMpesa,
  useFinancialAccounts,
  useCreateFinancialAccount,
  useUpdateFinancialAccount,
  useDeleteFinancialAccount,
  useMasterBudgets,
  useCreateMasterBudget,
  useUpdateMasterBudget,
  useDeleteMasterBudget,
  useSubBudgets,
  useCreateSubBudget,
  useUpdateSubBudget,
  useDeleteSubBudget,
  useBudgetUsages,
  useCreateBudgetUsage,
  useUpdateBudgetUsage,
  useDeleteBudgetUsage,
  useApproveBudgetUsage,
  // Analytics and Reporting Hooks
  usePendingVariances,
  useApproveVariance,
  useProjectBudgetSummary,
  useProjectFinancials,
  useTrackProjectCosts,
  useCalculateBudgetVariance,
  useForecastCompletionCost,
  useProjectProfitability,
  useAllocateProjectBudget,
  useFinancialSnapshot,
  useBudgetAllocationRecommendation,
  useGenerateProfitabilityReport,
  useMonthlyProfit,
  useReconcileAccounts,
  useProcessTaskCompletionFinancial,
} from "@/hooks/use-finance";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InvoiceForm } from "@/components/finance/InvoiceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FinancialAccountForm } from "@/components/finance/FinancialAccountForm";
import { MasterBudgetForm } from "@/components/finance/MasterBudgetForm";
import { SubBudgetForm } from "@/components/finance/SubBudgetForm";
import { BudgetUsageForm } from "@/components/finance/BudgetUsageForm";
import { FinancialAccount, MasterBudget, SubBudget, BudgetUsage, ProjectOut, BOMVarianceOut } from "@/types/api";
import { Trash2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects"; // To get project list for selection
import { useLocation } from "react-router-dom"; // To read URL query params

// M-Pesa form types (assuming these exist or will be defined in types/api.ts)
interface MpesaStkPushForm {
  phone_number: string;
  amount: number;
  account_reference: string;
  description?: string;
}

interface MpesaB2cForm {
  phone_number: string;
  amount: number;
  remarks: string;
  occasion?: string;
}

interface MpesaB2bForm {
  amount: number;
  receiver_shortcode: string;
  account_reference: string;
}

interface MpesaSimulateC2bForm {
  phone_number: string;
  amount: number;
  bill_ref_number: string;
}

interface MpesaQrCodeForm {
  amount: number;
  merchant_name: string;
  ref_no: string;
  trx_code?: string;
}

interface MpesaTransactionStatusForm {
  checkout_request_id?: string;
  conversation_id?: string;
  originator_conversation_id?: string;
}

interface MpesaReverseTransactionForm {
  transaction_id: string;
  amount: number;
  remarks?: string;
  receiver_party?: string;
}

interface MpesaRatibaForm {
  name: string;
  amount: number;
  phone_number: string;
  start_date: string;
  end_date: string;
  frequency: string;
}

interface ProfitabilityReportForm {
  start_date: string;
  end_date: string;
}

const infrastructureColors: Record<string, string> = {
  "Fiber": "hsl(173, 80%, 40%)",
  "Wireless": "hsl(142, 76%, 36%)",
  "PPOE": "hsl(38, 92%, 50%)",
  "Hotspot": "hsl(262, 83%, 58%)",
  "fiber": "hsl(173, 80%, 40%)",
  "wireless": "hsl(142, 76%, 36%)",
  "ppoe": "hsl(38, 92%, 50%)",
  "hotspot": "hsl(262, 83%, 58%)",
};

export default function Finance() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "overview";

  const { data: profitabilityData, isLoading: profitabilityLoading, error: profitabilityError } = useInfrastructureProfitability();
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useMpesaTransactions({ limit: 10 });
  const { data: invoicesData, isLoading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useOverdueInvoices();
  const { data: mpesaBalanceData, isLoading: mpesaBalanceLoading, error: mpesaBalanceError, refetch: refetchMpesaBalance } = useCheckMpesaBalance();

  const updateInvoiceMutation = useUpdateInvoice();

  // M-Pesa mutations
  const registerC2BUrlsMutation = useRegisterC2BUrls();
  const simulateC2BMutation = useSimulateC2B();
  const stkPushMutation = useStkPush();
  const generateDynamicQRMutation = useGenerateDynamicQR();
  const b2cPayMutation = useB2CPay();
  const b2bPayMutation = useB2BPay();
  const remitTaxMutation = useRemitTax();
  const createRatibaMutation = useCreateRatiba();
  const checkMpesaTransactionStatusMutation = useCheckMpesaTransactionStatus();
  const reverseMpesaTransactionMutation = useReverseMpesaTransaction();
  const reconcileMpesaMutation = useReconcileMpesa();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);

  // M-Pesa Dialog states
  const [isMpesaStkPushDialogOpen, setIsMpesaStkPushDialogOpen] = useState(false);
  const [stkPushForm, setStkPushForm] = useState<MpesaStkPushForm>({ phone_number: "", amount: 0, account_reference: "" });

  const [isMpesaB2cDialogOpen, setIsMpesaB2cDialogOpen] = useState(false);
  const [b2cForm, setB2cForm] = useState<MpesaB2cForm>({ phone_number: "", amount: 0, remarks: "" });

  const [isMpesaB2bDialogOpen, setIsMpesaB2bDialogOpen] = useState(false);
  const [b2bForm, setB2bForm] = useState<MpesaB2bForm>({ amount: 0, receiver_shortcode: "", account_reference: "" });

  const [isMpesaSimulateC2bDialogOpen, setIsMpesaSimulateC2bDialogOpen] = useState(false);
  const [simulateC2bForm, setSimulateC2bForm] = useState<MpesaSimulateC2bForm>({ phone_number: "", amount: 0, bill_ref_number: "" });

  const [isMpesaQrCodeDialogOpen, setIsMpesaQrCodeDialogOpen] = useState(false);
  const [qrCodeForm, setQrCodeForm] = useState<MpesaQrCodeForm>({ amount: 0, merchant_name: "", ref_no: "" });

  const [isMpesaTransactionStatusDialogOpen, setIsMpesaTransactionStatusDialogOpen] = useState(false);
  const [transactionStatusForm, setTransactionStatusForm] = useState<MpesaTransactionStatusForm>({ checkout_request_id: "" });

  const [isMpesaReverseTransactionDialogOpen, setIsMpesaReverseTransactionDialogOpen] = useState(false);
  const [reverseTransactionForm, setReverseTransactionForm] = useState<MpesaReverseTransactionForm>({ transaction_id: "", amount: 0 });

  const [isMpesaRatibaDialogOpen, setIsMpesaRatibaDialogOpen] = useState(false);
  const [ratibaForm, setRatibaForm] = useState<MpesaRatibaForm>({ name: "", amount: 0, phone_number: "", start_date: "", end_date: "", frequency: "Monthly" });


  const formatCurrency = (amount: number, precision = 2) => {
    if (!amount && amount !== 0) return "KES 0";
    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(precision)}M`;
    }
    if (amount >= 1000) {
      return `KES ${(amount / 1000).toFixed(precision)}K`;
    }
    return `KES ${amount.toLocaleString()}`;
  };

  const infrastructureProfitability = Array.isArray(profitabilityData) 
    ? profitabilityData.map(item => ({
        name: item.infrastructure_type,
        profit: item.revenue - item.cost,
        revenue: item.revenue,
        cost: item.cost,
        profit_margin: item.profit_margin,
        color: infrastructureColors[item.infrastructure_type] || "hsl(210, 40%, 96.1%)"
      }))
    : [];

  const recentTransactions = (transactionsData || []).slice(0, 5);
  const pendingInvoices = (invoicesData || []).slice(0, 5);
  const mpesaBalance = typeof mpesaBalanceData === 'number' ? mpesaBalanceData : 0;

  const totalRevenue = infrastructureProfitability.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalProfit = infrastructureProfitability.reduce((sum, item) => sum + (item.profit || 0), 0);

  const handleSendInvoice = async (invoiceId: number) => {
    try {
      await updateInvoiceMutation.mutateAsync({ id: invoiceId, data: { status: "SENT" } });
      toast.success(`Invoice ${invoiceId} sent successfully!`);
      refetchInvoices();
    } catch (err: any) {
      toast.error(`Failed to send invoice: ${err.message || 'Unknown error'}`);
    }
  };

  const handleCreateInvoiceSuccess = () => {
    toast.success("Invoice generated successfully!");
    setIsCreateInvoiceDialogOpen(false);
    refetchInvoices();
  };

  const handleCreateInvoiceCancel = () => {
    setIsCreateInvoiceDialogOpen(false);
  };

  const handleMpesaStkPush = async () => {
    try {
      await stkPushMutation.mutateAsync(stkPushForm);
      toast.success("STK Push initiated successfully!");
      setIsMpesaStkPushDialogOpen(false);
      refetchTransactions();
    } catch (err: any) {
      toast.error(`STK Push failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMpesaB2cPay = async () => {
    try {
      await b2cPayMutation.mutateAsync(b2cForm);
      toast.success("B2C payment initiated successfully!");
      setIsMpesaB2cDialogOpen(false);
      refetchTransactions();
    } catch (err: any) {
      toast.error(`B2C payment failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMpesaB2bPay = async () => {
    try {
      await b2bPayMutation.mutateAsync(b2bForm);
      toast.success("B2B payment initiated successfully!");
      setIsMpesaB2bDialogOpen(false);
      refetchTransactions();
    } catch (err: any) {
      toast.error(`B2B payment failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMpesaSimulateC2b = async () => {
    try {
      await simulateC2BMutation.mutateAsync(simulateC2bForm);
      toast.success("C2B simulation successful!");
      setIsMpesaSimulateC2bDialogOpen(false);
      refetchTransactions();
    } catch (err: any) {
      toast.error(`C2B simulation failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMpesaQrCode = async () => {
    try {
      await generateDynamicQRMutation.mutateAsync(qrCodeForm);
      toast.success("QR Code generated successfully!");
      setIsMpesaQrCodeDialogOpen(false);
    } catch (err: any) {
      toast.error(`QR Code generation failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMpesaTransactionStatus = async () => {
    try {
      await checkMpesaTransactionStatusMutation.mutateAsync(transactionStatusForm);
      setIsMpesaTransactionStatusDialogOpen(false);
    } catch (err: any) {
      toast.error(`Transaction status check failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMpesaReverseTransaction = async () => {
    try {
      await reverseMpesaTransactionMutation.mutateAsync(reverseTransactionForm);
      toast.success("Transaction reversal initiated successfully!");
      setIsMpesaReverseTransactionDialogOpen(false);
      refetchTransactions();
    } catch (err: any) {
      toast.error(`Transaction reversal failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMpesaRegisterC2BUrls = async () => {
    try {
      await registerC2BUrlsMutation.mutateAsync();
      toast.success("C2B URLs registered successfully!");
    } catch (err: any) {
      toast.error(`Failed to register C2B URLs: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMpesaReconcile = async () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]; // Start of current month
    const endDate = today.toISOString().split('T')[0]; // Today
    try {
      await reconcileMpesaMutation.mutateAsync({ startDate, endDate });
      toast.success("M-Pesa reconciliation initiated!");
      refetchTransactions();
      refetchMpesaBalance();
    } catch (err: any) {
      toast.error(`M-Pesa reconciliation failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMpesaCreateRatiba = async () => {
    try {
      await createRatibaMutation.mutateAsync(ratibaForm);
      toast.success("Ratiba order created successfully!");
      setIsMpesaRatibaDialogOpen(false);
      // refetchTransactions(); // Ratiba might not show up directly in transactions
    } catch (err: any) {
      toast.error(`Ratiba order creation failed: ${err.message || 'Unknown error'}`);
    }
  };


  // Determine transaction type based on transaction_type field
  const getTransactionType = (tx: any) => {
    const type = tx.transaction_type?.toLowerCase() || '';
    if (type.includes('b2c') || type.includes('payout') || type.includes('payment')) return 'expense';
    return 'income';
  };

  // Financial Accounts States and Handlers
  const { data: financialAccounts, isLoading: loadingFinancialAccounts, error: financialAccountsError, refetch: refetchFinancialAccounts } = useFinancialAccounts();
  const createFinancialAccountMutation = useCreateFinancialAccount();
  const updateFinancialAccountMutation = useUpdateFinancialAccount();
  const deleteFinancialAccountMutation = useDeleteFinancialAccount();

  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<FinancialAccount | null>(null);
  const [isDeleteAccountAlertDialogOpen, setIsDeleteAccountAlertDialogOpen] = useState(false);
  const [accountToDeleteId, setAccountToDeleteId] = useState<number | null>(null);

  const handleCreateAccount = () => {
    setAccountToEdit(null);
    setIsCreateAccountDialogOpen(true);
  };

  const handleEditAccount = (account: FinancialAccount) => {
    setAccountToEdit(account);
    setIsEditAccountDialogOpen(true);
  };

  const handleDeleteAccountClick = (accountId: number) => {
    setAccountToDeleteId(accountId);
    setIsDeleteAccountAlertDialogOpen(true);
  };

  const handleConfirmDeleteAccount = async () => {
    if (accountToDeleteId) {
      try {
        await deleteFinancialAccountMutation.mutateAsync(accountToDeleteId);
        toast.success("Financial account deleted successfully!");
        refetchFinancialAccounts();
      } catch (err: any) {
        toast.error(`Failed to delete account: ${err.message || 'Unknown error'}`);
      } finally {
        setIsDeleteAccountAlertDialogOpen(false);
        setAccountToDeleteId(null);
      }
    }
  };

  const handleAccountFormSuccess = () => {
    setIsCreateAccountDialogOpen(false);
    setIsEditAccountDialogOpen(false);
    refetchFinancialAccounts();
  };

  const handleAccountFormCancel = () => {
    setIsCreateAccountDialogOpen(false);
    setIsEditAccountDialogOpen(false);
  };

  // Master Budgets States and Handlers
  const { data: masterBudgets, isLoading: loadingMasterBudgets, error: masterBudgetsError, refetch: refetchMasterBudgets } = useMasterBudgets();
  const createMasterBudgetMutation = useCreateMasterBudget();
  const updateMasterBudgetMutation = useUpdateMasterBudget();
  const deleteMasterBudgetMutation = useDeleteMasterBudget();

  const [isCreateMasterBudgetDialogOpen, setIsCreateMasterBudgetDialogOpen] = useState(false);
  const [isEditMasterBudgetDialogOpen, setIsEditMasterBudgetDialogOpen] = useState(false);
  const [masterBudgetToEdit, setMasterBudgetToEdit] = useState<MasterBudget | null>(null);
  const [isDeleteMasterBudgetAlertDialogOpen, setIsDeleteMasterBudgetAlertDialogOpen] = useState(false);
  const [masterBudgetToDeleteId, setMasterBudgetToDeleteId] = useState<number | null>(null);

  const handleCreateMasterBudget = () => {
    setMasterBudgetToEdit(null);
    setIsCreateMasterBudgetDialogOpen(true);
  };

  const handleEditMasterBudget = (budget: MasterBudget) => {
    setMasterBudgetToEdit(budget);
    setIsEditMasterBudgetDialogOpen(true);
  };

  const handleDeleteMasterBudgetClick = (budgetId: number) => {
    setMasterBudgetToDeleteId(budgetId);
    setIsDeleteMasterBudgetAlertDialogOpen(true);
  };

  const handleConfirmDeleteMasterBudget = async () => {
    if (masterBudgetToDeleteId) {
      try {
        await deleteMasterBudgetMutation.mutateAsync(masterBudgetToDeleteId);
        toast.success("Master budget deleted successfully!");
        refetchMasterBudgets();
      } catch (err: any) {
        toast.error(`Failed to delete master budget: ${err.message || 'Unknown error'}`);
      } finally {
        setIsDeleteMasterBudgetAlertDialogOpen(false);
        setMasterBudgetToDeleteId(null);
      }
    }
  };

  const handleMasterBudgetFormSuccess = () => {
    setIsCreateMasterBudgetDialogOpen(false);
    setIsEditMasterBudgetDialogOpen(false);
    refetchMasterBudgets();
  };

  const handleMasterBudgetFormCancel = () => {
    setIsCreateMasterBudgetDialogOpen(false);
    setIsEditMasterBudgetDialogOpen(false);
  };

  // Sub Budgets States and Handlers
  const [expandedMasterBudget, setExpandedMasterBudget] = useState<number | null>(null);

  const { data: subBudgets, isLoading: loadingSubBudgets, error: subBudgetsError, refetch: refetchSubBudgets } = useSubBudgets(expandedMasterBudget || 0, 0, 1000);
  const createSubBudgetMutation = useCreateSubBudget();
  const updateSubBudgetMutation = useUpdateSubBudget();
  const deleteSubBudgetMutation = useDeleteSubBudget();

  const [isCreateSubBudgetDialogOpen, setIsCreateSubBudgetDialogOpen] = useState(false);
  const [isEditSubBudgetDialogOpen, setIsEditSubBudgetDialogOpen] = useState(false);
  const [subBudgetToEdit, setSubBudgetToEdit] = useState<SubBudget | null>(null);
  const [isDeleteSubBudgetAlertDialogOpen, setIsDeleteSubBudgetAlertDialogOpen] = useState(false);
  const [subBudgetToDeleteId, setSubBudgetToDeleteId] = useState<number | null>(null);
  const [subBudgetIdForUsage, setSubBudgetIdForUsage] = useState<number | null>(null); // To pass to BudgetUsageForm

  const handleCreateSubBudget = (masterBudgetId: number) => {
    setExpandedMasterBudget(masterBudgetId); // Ensure context for creation
    setSubBudgetToEdit(null);
    setIsCreateSubBudgetDialogOpen(true);
  };

  const handleEditSubBudget = (budget: SubBudget) => {
    setSubBudgetToEdit(budget);
    setIsEditSubBudgetDialogOpen(true);
  };

  const handleDeleteSubBudgetClick = (budgetId: number) => {
    setSubBudgetToDeleteId(budgetId);
    setIsDeleteSubBudgetAlertDialogOpen(true);
  };

  const handleConfirmDeleteSubBudget = async () => {
    if (subBudgetIdToDeleteId) {
      try {
        await deleteSubBudgetMutation.mutateAsync(subBudgetIdToDeleteId);
        toast.success("Sub budget deleted successfully!");
        refetchSubBudgets();
        refetchMasterBudgets(); // Master budget totals might change
      } catch (err: any) {
        toast.error(`Failed to delete sub budget: ${err.message || 'Unknown error'}`);
      } finally {
        setIsDeleteSubBudgetAlertDialogOpen(false);
        setSubBudgetToDeleteId(null);
      }
    }
  };

  const handleSubBudgetFormSuccess = () => {
    setIsCreateSubBudgetDialogOpen(false);
    setIsEditSubBudgetDialogOpen(false);
    refetchSubBudgets();
    refetchMasterBudgets(); // Master budget totals might change
  };

  const handleSubBudgetFormCancel = () => {
    setIsCreateSubBudgetDialogOpen(false);
    setIsEditSubBudgetDialogOpen(false);
  };

  // Budget Usages States and Handlers
  const [expandedSubBudget, setExpandedSubBudget] = useState<number | null>(null);
  const { data: budgetUsages, isLoading: loadingBudgetUsages, error: budgetUsagesError, refetch: refetchBudgetUsages } = useBudgetUsages(expandedSubBudget || 0, 0, 1000);
  const createBudgetUsageMutation = useCreateBudgetUsage();
  const updateBudgetUsageMutation = useUpdateBudgetUsage();
  const deleteBudgetUsageMutation = useDeleteBudgetUsage();
  const approveBudgetUsageMutation = useApproveBudgetUsage();

  const [isCreateUsageDialogOpen, setIsCreateUsageDialogOpen] = useState(false);
  const [isEditUsageDialogOpen, setIsEditUsageDialogOpen] = useState(false);
  const [usageToEdit, setUsageToEdit] = useState<BudgetUsage | null>(null);
  const [isDeleteUsageAlertDialogOpen, setIsDeleteUsageAlertDialogOpen] = useState(false);
  const [usageToDeleteId, setUsageToDeleteId] = useState<number | null>(null);

  const handleCreateUsage = (subBudgetId: number) => {
    setSubBudgetIdForUsage(subBudgetId);
    setUsageToEdit(null);
    setIsCreateUsageDialogOpen(true);
  };

  const handleEditUsage = (usage: BudgetUsage) => {
    setUsageToEdit(usage);
    setIsEditUsageDialogOpen(true);
  };

  const handleDeleteUsageClick = (usageId: number) => {
    setUsageToDeleteId(usageId);
    setIsDeleteUsageAlertDialogOpen(true);
  };

  const handleConfirmDeleteUsage = async () => {
    if (usageToDeleteId) {
      try {
        await deleteBudgetUsageMutation.mutateAsync(usageToDeleteId);
        toast.success("Budget usage deleted successfully!");
        refetchBudgetUsages();
        refetchSubBudgets(); // Sub budget totals might change
      } catch (err: any) {
        toast.error(`Failed to delete usage: ${err.message || 'Unknown error'}`);
      } finally {
        setIsDeleteUsageAlertDialogOpen(false);
        setUsageToDeleteId(null);
      }
    }
  };

  const handleApproveUsage = async (usageId: number, approved: boolean) => {
    try {
      await approveBudgetUsageMutation.mutateAsync({ id: usageId, approved });
      toast.success(`Budget usage ${approved ? 'approved' : 'rejected'} successfully!`);
      refetchBudgetUsages();
      refetchSubBudgets(); // Sub budget totals might change
    } catch (err: any) {
      toast.error(`Failed to approve/reject usage: ${err.message || 'Unknown error'}`);
    }
  };

  const handleUsageFormSuccess = () => {
    setIsCreateUsageDialogOpen(false);
    setIsEditUsageDialogOpen(false);
    refetchBudgetUsages();
    refetchSubBudgets(); // Sub budget totals might change
  };

  const handleUsageFormCancel = () => {
    setIsCreateUsageDialogOpen(false);
    setIsEditUsageDialogOpen(false);
  };

  // Analytics & Reporting states and handlers
  const { data: pendingVariances, isLoading: loadingPendingVariances, error: pendingVariancesError, refetch: refetchPendingVariances } = usePendingVariances();
  const approveVarianceMutation = useApproveVariance();

  const { data: financialSnapshot, isLoading: loadingFinancialSnapshot, error: financialSnapshotError } = useFinancialSnapshot();
  const { data: monthlyProfitData, isLoading: loadingMonthlyProfit, error: monthlyProfitError } = useMonthlyProfit(new Date().getFullYear(), new Date().getMonth() + 1); // Current month
  const { data: projectsData } = useProjects(); // To get list of projects for selection
  const { data: recommendationData, isLoading: loadingRecommendation, error: recommendationError } = useBudgetAllocationRecommendation(financialSnapshot?.total_assets || 0);
  
  const generateProfitabilityReportMutation = useGenerateProfitabilityReport();
  const reconcileAccountsMutation = useReconcileAccounts();
  const processTaskCompletionFinancialMutation = useProcessTaskCompletionFinancial();

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { data: projectBudgetSummary, isLoading: loadingProjectBudgetSummary, error: projectBudgetSummaryError } = useProjectBudgetSummary(selectedProjectId || 0);
  const { data: projectFinancials, isLoading: loadingProjectFinancials, error: projectFinancialsError } = useProjectFinancials(selectedProjectId || 0);
  const { data: projectCosts, isLoading: loadingProjectCosts, error: projectCostsError } = useTrackProjectCosts(selectedProjectId || 0);
  const { data: projectProfitability, isLoading: loadingProjectProfitability, error: projectProfitabilityError } = useProjectProfitability(selectedProjectId || 0);
  const { data: budgetVariance, isLoading: loadingBudgetVariance, error: budgetVarianceError } = useCalculateBudgetVariance(selectedProjectId || 0);
  const { data: forecastCompletionCost, isLoading: loadingForecastCompletionCost, error: forecastCompletionCostError } = useForecastCompletionCost(selectedProjectId || 0);
  
  const allocateProjectBudgetMutation = useAllocateProjectBudget();

  const [reportForm, setReportForm] = useState<ProfitabilityReportForm>({
    start_date: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });
  
  const handleGenerateReport = async () => {
    try {
      await generateProfitabilityReportMutation.mutateAsync(reportForm);
      toast.success("Profitability report generated. Check your downloads or reports section.");
    } catch (err: any) {
      toast.error(`Failed to generate report: ${err.message || 'Unknown error'}`);
    }
  };

  const handleApproveVariance = async (varianceId: number, approved: boolean) => {
    try {
      // Assuming a default approver_id for now, replace with actual user ID
      await approveVarianceMutation.mutateAsync({ varianceId, approved, approver_id: 1 });
      toast.success(`BOM Variance ${approved ? 'approved' : 'rejected'} successfully.`);
      refetchPendingVariances();
    } catch (err: any) {
      toast.error(`Failed to update BOM Variance: ${err.message || 'Unknown error'}`);
    }
  };

  const handleReconcileAccounts = async () => {
    try {
      // Using arbitrary dates for now, could be dynamic
      const period_start = format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd');
      const period_end = format(new Date(), 'yyyy-MM-dd');
      await reconcileAccountsMutation.mutateAsync({ period_start, period_end });
      toast.success("Accounts reconciliation initiated successfully.");
    } catch (err: any) {
      toast.error(`Failed to reconcile accounts: ${err.message || 'Unknown error'}`);
    }
  };

  const handleAllocateProjectBudget = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project to allocate budget.");
      return;
    }
    // Placeholder for data, ideally would come from a form
    const allocationData = {
      amount: 10000, // Example amount
      notes: "Initial allocation",
    };
    try {
      await allocateProjectBudgetMutation.mutateAsync({ projectId: selectedProjectId, data: allocationData });
      toast.success("Project budget allocated successfully.");
    } catch (err: any) {
      toast.error(`Failed to allocate project budget: ${err.message || 'Unknown error'}`);
    }
  };

  // Sync activeTab with URL query param
  useEffect(() => {
    const tabFromUrl = queryParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);


  const monthlyProfitChartData = monthlyProfitData ? [{
    name: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'MMM yyyy'),
    profit: monthlyProfitData.profit, // Assuming monthlyProfitData has a 'profit' field
    revenue: monthlyProfitData.revenue,
    expenses: monthlyProfitData.expenses,
  }] : [];

  const handleProcessTaskFinancialCompletion = async (taskId: number) => {
    try {
      await processTaskCompletionFinancialMutation.mutateAsync(taskId);
      toast.success(`Financial completion processed for Task ID: ${taskId}`);
    } catch (err: any) {
      toast.error(`Failed to process financial completion for task: ${err.message || 'Unknown error'}`);
    }
  };


  return (
    <DashboardLayout title="Finance" subtitle="Revenue, expenses & payments">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass border-primary/20 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue, 1)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">From infrastructure</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-success/20 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalProfit, 1)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Infrastructure profit</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-warning/20 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Invoices</p>
                <p className="text-3xl font-bold text-foreground">{pendingInvoices.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-sm text-warning">Overdue</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <Receipt className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-chart-4/20 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">M-Pesa Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  {mpesaBalanceLoading ? "..." : mpesaBalanceError ? "Error" : formatCurrency(mpesaBalance, 0)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">
                    {recentTransactions.length} recent transactions
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-chart-4/10">
                <Smartphone className="w-6 h-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
          <TabsTrigger value="budgeting">Budgeting & Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger> {/* New Tab */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Infrastructure Profitability Chart */}
            <Card className="glass lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Infrastructure Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {profitabilityLoading ? <LoadingSkeleton variant="chart" /> : profitabilityError ? <ErrorState message="Failed to load chart" /> : infrastructureProfitability.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No profitability data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={infrastructureProfitability}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="profit"
                          nameKey="name"
                        >
                          {infrastructureProfitability.map((entry, index) => (
                            <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 13%)",
                            border: "1px solid hsl(217, 33%, 20%)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`KES ${value.toLocaleString()}`, "Profit"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* By Infrastructure */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">By Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profitabilityLoading ? (
                    <LoadingSkeleton variant="list" count={4} />
                  ) : infrastructureProfitability.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No infrastructure data
                    </div>
                  ) : (
                    infrastructureProfitability.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(item.profit, 1)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {item.profit_margin?.toFixed(1)}% margin
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => setActiveTab("transactions")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactionsLoading ? <LoadingSkeleton variant="list" count={5} /> : transactionsError ? <ErrorState message="Failed to load transactions" /> : recentTransactions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No recent transactions
                  </div>
                ) : (
                  recentTransactions.map((tx: any) => {
                    const txType = getTransactionType(tx);
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            txType === "income" ? "bg-success/20" : "bg-destructive/20"
                          )}
                        >
                          {txType === "income" ? (
                            <ArrowUpRight className="w-5 h-5 text-success" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tx.description || tx.mpesa_receipt_number || tx.reference || "Transaction"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{tx.transaction_type || "Payment"}</span>
                            <span>•</span>
                            <span>{new Date(tx.transaction_date || tx.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              txType === "income" ? "text-success" : "text-destructive"
                            )}
                          >
                            {txType === "income" ? "+" : "-"}KES {Math.abs(tx.amount).toLocaleString()}
                          </span>
                          <Badge
                            className={cn(
                              "ml-2 text-xs",
                              tx.status === "completed" || tx.status === "success"
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            )}
                          >
                            {tx.status || "pending"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Overdue Invoices</CardTitle>
                <Button className="gradient-primary text-primary-foreground" size="sm" onClick={() => setIsCreateInvoiceDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoicesLoading ? <LoadingSkeleton variant="list" count={3} /> : invoicesError ? <ErrorState message="Failed to load invoices" /> : pendingInvoices.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No overdue invoices
                  </div>
                ) : (
                  pendingInvoices.map((invoice: any) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning/20">
                        <FileText className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {invoice.customer_name || `Invoice #${invoice.invoice_number}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Invoice #{invoice.invoice_number} • Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">
                          KES {invoice.total_amount?.toLocaleString() || 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleSendInvoice(invoice.id)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>All M-Pesa Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? <LoadingSkeleton variant="table" count={10} /> : transactionsError ? <ErrorState message="Failed to load transactions" /> : (
                <div className="space-y-3">
                  {(transactionsData || []).map((tx: any) => {
                    const txType = getTransactionType(tx);
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            txType === "income" ? "bg-success/20" : "bg-destructive/20"
                          )}
                        >
                          {txType === "income" ? (
                            <ArrowUpRight className="w-5 h-5 text-success" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tx.description || tx.mpesa_receipt_number || tx.reference || "Transaction"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{tx.transaction_type || "Payment"}</span>
                            <span>•</span>
                            <span>{tx.phone_number}</span>
                            <span>•</span>
                            <span>{new Date(tx.transaction_date || tx.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              txType === "income" ? "text-success" : "text-destructive"
                            )}
                          >
                            {txType === "income" ? "+" : "-"}KES {Math.abs(tx.amount).toLocaleString()}
                          </span>
                          <Badge
                            className={cn(
                              "ml-2 text-xs",
                              tx.status === "completed" || tx.status === "success"
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            )}
                          >
                            {tx.status || "pending"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? <LoadingSkeleton variant="table" count={5} /> : invoicesError ? <ErrorState message="Failed to load invoices" /> : (
                <div className="space-y-3">
                  {(invoicesData || []).map((invoice: any) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning/20">
                        <FileText className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {invoice.customer_name || `Invoice #${invoice.invoice_number}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Invoice #{invoice.invoice_number} • Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-foreground">
                          {invoice.currency || 'KES'} {invoice.total_amount?.toLocaleString() || 0}
                        </span>
                        <Badge variant="destructive" className="ml-2">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mpesa" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* STK Push Card */}
            <Card>
              <CardHeader>
                <CardTitle>STK Push</CardTitle>
                <CardDescription>Initiate an STK Push to a customer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="stkPushPhone">Phone Number</Label>
                  <Input id="stkPushPhone" value={stkPushForm.phone_number} onChange={(e) => setStkPushForm({ ...stkPushForm, phone_number: e.target.value })} placeholder="2547xxxxxxxx" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stkPushAmount">Amount</Label>
                  <Input id="stkPushAmount" type="number" value={stkPushForm.amount} onChange={(e) => setStkPushForm({ ...stkPushForm, amount: parseFloat(e.target.value) })} placeholder="e.g., 100" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stkPushRef">Account Reference</Label>
                  <Input id="stkPushRef" value={stkPushForm.account_reference} onChange={(e) => setStkPushForm({ ...stkPushForm, account_reference: e.target.value })} placeholder="Order123" />
                </div>
                <Button onClick={handleMpesaStkPush} disabled={stkPushMutation.isPending} className="w-full">
                  {stkPushMutation.isPending && <LoadingSpinner className="mr-2" />}
                  Trigger STK Push
                </Button>
              </CardContent>
            </Card>

            {/* B2C Payment Card */}
            <Card>
              <CardHeader>
                <CardTitle>B2C Payment</CardTitle>
                <CardDescription>Send money from business to customer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="b2cPhone">Phone Number</Label>
                  <Input id="b2cPhone" value={b2cForm.phone_number} onChange={(e) => setB2cForm({ ...b2cForm, phone_number: e.target.value })} placeholder="2547xxxxxxxx" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b2cAmount">Amount</Label>
                  <Input id="b2cAmount" type="number" value={b2cForm.amount} onChange={(e) => setB2cForm({ ...b2cForm, amount: parseFloat(e.target.value) })} placeholder="e.g., 500" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b2cRemarks">Remarks</Label>
                  <Input id="b2cRemarks" value={b2cForm.remarks} onChange={(e) => setB2cForm({ ...b2cForm, remarks: e.target.value })} placeholder="Payment for services" />
                </div>
                <Button onClick={handleMpesaB2cPay} disabled={b2cPayMutation.isPending} className="w-full">
                  {b2cPayMutation.isPending && <LoadingSpinner className="mr-2" />}
                  Trigger B2C Payment
                </Button>
              </CardContent>
            </Card>

            {/* B2B Payment Card */}
            <Card>
              <CardHeader>
                <CardTitle>B2B Payment</CardTitle>
                <CardDescription>Send money from business to business.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="b2bAmount">Amount</Label>
                  <Input id="b2bAmount" type="number" value={b2bForm.amount} onChange={(e) => setB2bForm({ ...b2bForm, amount: parseFloat(e.target.value) })} placeholder="e.g., 1000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b2bShortcode">Receiver Shortcode</Label>
                  <Input id="b2bShortcode" value={b2bForm.receiver_shortcode} onChange={(e) => setB2bForm({ ...b2bForm, receiver_shortcode: e.target.value })} placeholder="e.g., 123456" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b2bRef">Account Reference</Label>
                  <Input id="b2bRef" value={b2bForm.account_reference} onChange={(e) => setB2bForm({ ...b2bForm, account_reference: e.target.value })} placeholder="SupplierInvoice" />
                </div>
                <Button onClick={handleMpesaB2bPay} disabled={b2bPayMutation.isPending} className="w-full">
                  {b2bPayMutation.isPending && <LoadingSpinner className="mr-2" />}
                  Trigger B2B Payment
                </Button>
              </CardContent>
            </Card>

            {/* C2B Simulate Card */}
            <Card>
              <CardHeader>
                <CardTitle>Simulate C2B</CardTitle>
                <CardDescription>Simulate a Customer to Business (PayBill/BuyGoods) transaction.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="c2bPhone">Phone Number</Label>
                  <Input id="c2bPhone" value={simulateC2bForm.phone_number} onChange={(e) => setSimulateC2bForm({ ...simulateC2bForm, phone_number: e.target.value })} placeholder="2547xxxxxxxx" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c2bAmount">Amount</Label>
                  <Input id="c2bAmount" type="number" value={simulateC2bForm.amount} onChange={(e) => setSimulateC2bForm({ ...simulateC2bForm, amount: parseFloat(e.target.value) })} placeholder="e.g., 200" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c2bBillRef">Bill Ref Number</Label>
                  <Input id="c2bBillRef" value={simulateC2bForm.bill_ref_number} onChange={(e) => setSimulateC2bForm({ ...simulateC2bForm, bill_ref_number: e.target.value })} placeholder="INV001" />
                </div>
                <Button onClick={handleMpesaSimulateC2b} disabled={simulateC2BMutation.isPending} className="w-full">
                  {simulateC2BMutation.isPending && <LoadingSpinner className="mr-2" />}
                  Simulate C2B
                </Button>
              </CardContent>
            </Card>

            {/* Generate QR Code Card */}
            <Card>
              <CardHeader>
                <CardTitle>Generate QR Code</CardTitle>
                <CardDescription>Generate a dynamic QR code for payments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="qrAmount">Amount</Label>
                  <Input id="qrAmount" type="number" value={qrCodeForm.amount} onChange={(e) => setQrCodeForm({ ...qrCodeForm, amount: parseFloat(e.target.value) })} placeholder="e.g., 300" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="qrMerchant">Merchant Name</Label>
                  <Input id="qrMerchant" value={qrCodeForm.merchant_name} onChange={(e) => setQrCodeForm({ ...qrCodeForm, merchant_name: e.target.value })} placeholder="ISP Solutions" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="qrRefNo">Reference Number</Label>
                  <Input id="qrRefNo" value={qrCodeForm.ref_no} onChange={(e) => setQrCodeForm({ ...qrCodeForm, ref_no: e.target.value })} placeholder="Payment001" />
                </div>
                <Button onClick={handleMpesaQrCode} disabled={generateDynamicQRMutation.isPending} className="w-full">
                  {generateDynamicQRMutation.isPending && <LoadingSpinner className="mr-2" />}
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR
                </Button>
              </CardContent>
            </Card>

            {/* Transaction Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Check Transaction Status</CardTitle>
                <CardDescription>Check the status of an M-Pesa transaction.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="checkoutRequestId">Checkout Request ID</Label>
                  <Input id="checkoutRequestId" value={transactionStatusForm.checkout_request_id} onChange={(e) => setTransactionStatusForm({ ...transactionStatusForm, checkout_request_id: e.target.value })} placeholder="ws_CO_DMZ_..." />
                </div>
                <Button onClick={handleMpesaTransactionStatus} disabled={checkMpesaTransactionStatusMutation.isPending} className="w-full">
                  {checkMpesaTransactionStatusMutation.isPending && <LoadingSpinner className="mr-2" />}
                  Check Status
                </Button>
              </CardContent>
            </Card>

            {/* Reverse Transaction Card */}
            <Card>
              <CardHeader>
                <CardTitle>Reverse Transaction</CardTitle>
                <CardDescription>Reverse a completed M-Pesa transaction.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="reverseTxId">Transaction ID</Label>
                  <Input id="reverseTxId" value={reverseTransactionForm.transaction_id} onChange={(e) => setReverseTransactionForm({ ...reverseTransactionForm, transaction_id: e.target.value })} placeholder="MpesaTxnID" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reverseAmount">Amount</Label>
                  <Input id="reverseAmount" type="number" value={reverseTransactionForm.amount} onChange={(e) => setReverseTransactionForm({ ...reverseTransactionForm, amount: parseFloat(e.target.value) })} placeholder="e.g., 100" />
                </div>
                <Button onClick={handleMpesaReverseTransaction} disabled={reverseMpesaTransactionMutation.isPending} className="w-full">
                  {reverseMpesaTransactionMutation.isPending && <LoadingSpinner className="mr-2" />}
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reverse Transaction
                </Button>
              </CardContent>
            </Card>

            {/* Register C2B URLs Button */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Register C2B URLs</CardTitle>
                <CardDescription>Register validation and confirmation URLs for C2B.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleMpesaRegisterC2BUrls} disabled={registerC2BUrlsMutation.isPending} className="w-full">
                  {registerC2BUrlsMutation.isPending && <LoadingSpinner className="mr-2" />}
                  Register C2B URLs
                </Button>
              </CardContent>
            </Card>

            {/* Reconcile M-Pesa Button */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Reconcile M-Pesa</CardTitle>
                <CardDescription>Reconcile M-Pesa transactions for the current month.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleMpesaReconcile} disabled={reconcileMpesaMutation.isPending} className="w-full">
                  {reconcileMpesaMutation.isPending && <LoadingSpinner className="mr-2" />}
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reconcile Now
                </Button>
              </CardContent>
            </Card>

            {/* Create Ratiba Order Card */}
            <Card>
              <CardHeader>
                <CardTitle>Create Ratiba Order</CardTitle>
                <CardDescription>Schedule recurring payments (Ratiba).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="ratibaName">Name</Label>
                  <Input id="ratibaName" value={ratibaForm.name} onChange={(e) => setRatibaForm({ ...ratibaForm, name: e.target.value })} placeholder="Monthly Subscription" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ratibaAmount">Amount</Label>
                  <Input id="ratibaAmount" type="number" value={ratibaForm.amount} onChange={(e) => setRatibaForm({ ...ratibaForm, amount: parseFloat(e.target.value) })} placeholder="e.g., 500" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ratibaPhone">Phone Number</Label>
                  <Input id="ratibaPhone" value={ratibaForm.phone_number} onChange={(e) => setRatibaForm({ ...ratibaForm, phone_number: e.target.value })} placeholder="2547xxxxxxxx" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ratibaStartDate">Start Date</Label>
                  <Input id="ratibaStartDate" type="date" value={ratibaForm.start_date} onChange={(e) => setRatibaForm({ ...ratibaForm, start_date: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ratibaEndDate">End Date</Label>
                  <Input id="ratibaEndDate" type="date" value={ratibaForm.end_date} onChange={(e) => setRatibaForm({ ...ratibaForm, end_date: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ratibaFrequency">Frequency</Label>
                  <Input id="ratibaFrequency" value={ratibaForm.frequency} onChange={(e) => setRatibaForm({ ...ratibaForm, frequency: e.target.value })} placeholder="Monthly, Weekly, Daily" />
                </div>
                <Button onClick={handleMpesaCreateRatiba} disabled={createRatibaMutation.isPending} className="w-full">
                  {createRatibaMutation.isPending && <LoadingSpinner className="mr-2" />}
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  Create Ratiba
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgeting" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Financial Accounts</CardTitle>
              <Button size="sm" onClick={handleCreateAccount}>
                <Plus className="h-4 w-4 mr-2" /> New Account
              </Button>
            </CardHeader>
            <CardContent>
              {loadingFinancialAccounts ? <LoadingSkeleton variant="table" count={3} /> : financialAccountsError ? <ErrorState message="Failed to load accounts" /> : financialAccounts && financialAccounts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Account No.</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>{account.account_number}</TableCell>
                          <TableCell>{account.bank_name}</TableCell>
                          <TableCell>{account.account_type}</TableCell>
                          <TableCell className="text-right">{formatCurrency(account.balance || 0)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditAccount(account)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteAccountClick(account.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No financial accounts found.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Master Budgets</CardTitle>
              <Button size="sm" onClick={handleCreateMasterBudget}>
                <Plus className="h-4 w-4 mr-2" /> New Master Budget
              </Button>
            </CardHeader>
            <CardContent>
              {loadingMasterBudgets ? <LoadingSkeleton variant="table" count={3} /> : masterBudgetsError ? <ErrorState message="Failed to load master budgets" /> : masterBudgets && masterBudgets.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Allocated</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterBudgets.map((budget) => (
                        <React.Fragment key={budget.id}>
                          <TableRow>
                            <TableCell className="font-medium">
                              <Button variant="ghost" size="sm" onClick={() => setExpandedMasterBudget(expandedMasterBudget === budget.id ? null : budget.id)}>
                                {expandedMasterBudget === budget.id ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                                {budget.name}
                              </Button>
                            </TableCell>
                            <TableCell>{format(new Date(budget.start_date), 'MMM yyyy')} - {format(new Date(budget.end_date), 'MMM yyyy')}</TableCell>
                            <TableCell className="text-right">{formatCurrency(budget.total_amount)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(budget.allocated_amount || 0)}</TableCell>
                            <TableCell className="text-right"><Badge>{budget.status}</Badge></TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditMasterBudget(budget)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteMasterBudgetClick(budget.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedMasterBudget === budget.id && (
                            <TableRow>
                              <TableCell colSpan={6} className="p-0">
                                <div className="p-4 bg-secondary/20">
                                  <CardTitle className="mb-4 flex items-center justify-between">
                                    <span>Sub-Budgets for {budget.name}</span>
                                    <Button size="sm" onClick={() => handleCreateSubBudget(budget.id)}>
                                      <Plus className="h-4 w-4 mr-2" /> New Sub-Budget
                                    </Button>
                                  </CardTitle>
                                  {loadingSubBudgets ? <LoadingSkeleton variant="table" count={2} /> : subBudgetsError ? <ErrorState message="Failed to load sub-budgets" /> : subBudgets && subBudgets.length > 0 ? (
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Category</TableHead>
                                          <TableHead className="text-right">Allocated</TableHead>
                                          <TableHead className="text-right">Spent</TableHead>
                                          <TableHead className="text-right">Status</TableHead>
                                          <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {subBudgets.map((subBudget) => (
                                          <React.Fragment key={subBudget.id}>
                                            <TableRow>
                                              <TableCell className="font-medium">
                                                <Button variant="ghost" size="sm" onClick={() => setExpandedSubBudget(expandedSubBudget === subBudget.id ? null : subBudget.id)}>
                                                  {expandedSubBudget === subBudget.id ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                                                  {subBudget.name}
                                                </Button>
                                              </TableCell>
                                              <TableCell>{subBudget.category}</TableCell>
                                              <TableCell className="text-right">{formatCurrency(subBudget.allocated_amount || 0)}</TableCell>
                                              <TableCell className="text-right">{formatCurrency(subBudget.spent_amount || 0)}</TableCell>
                                              <TableCell className="text-right"><Badge>{subBudget.status}</Badge></TableCell>
                                              <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                  <Button variant="ghost" size="icon" onClick={() => handleEditSubBudget(subBudget)}>
                                                    <Edit className="h-4 w-4" />
                                                  </Button>
                                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSubBudgetClick(subBudget.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                  </Button>
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                            {expandedSubBudget === subBudget.id && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="p-0">
                                                        <div className="p-4 bg-secondary/30">
                                                            <CardTitle className="mb-4 flex items-center justify-between">
                                                                <span>Usages for {subBudget.name}</span>
                                                                <Button size="sm" onClick={() => handleCreateUsage(subBudget.id)}>
                                                                    <Plus className="h-4 w-4 mr-2" /> New Usage
                                                                </Button>
                                                            </CardTitle>
                                                            {loadingBudgetUsages ? <LoadingSkeleton variant="table" count={2} /> : budgetUsagesError ? <ErrorState message="Failed to load usages" /> : budgetUsages && budgetUsages.length > 0 ? (
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>Description</TableHead>
                                                                            <TableHead className="text-right">Amount</TableHead>
                                                                            <TableHead>Date</TableHead>
                                                                            <TableHead>Status</TableHead>
                                                                            <TableHead className="text-right">Actions</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {budgetUsages.map((usage) => (
                                                                            <TableRow key={usage.id}>
                                                                                <TableCell>{usage.description}</TableCell>
                                                                                <TableCell className="text-right">{formatCurrency(usage.amount)}</TableCell>
                                                                                <TableCell>{format(new Date(usage.date), 'PPP')}</TableCell>
                                                                                <TableCell><Badge>{usage.status}</Badge></TableCell>
                                                                                <TableCell className="text-right">
                                                                                    <div className="flex items-center justify-end gap-2">
                                                                                        {usage.status === 'Pending' && (
                                                                                            <>
                                                                                                <Button variant="ghost" size="icon" onClick={() => handleApproveUsage(usage.id, true)}>
                                                                                                    <CheckCircle className="h-4 w-4 text-success" />
                                                                                                </Button>
                                                                                                <Button variant="ghost" size="icon" onClick={() => handleApproveUsage(usage.id, false)}>
                                                                                                    <XCircle className="h-4 w-4 text-destructive" />
                                                                                                </Button>
                                                                                            </>
                                                                                        )}
                                                                                        <Button variant="ghost" size="icon" onClick={() => handleEditUsage(usage)}>
                                                                                            <Edit className="h-4 w-4" />
                                                                                        </Button>
                                                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUsageClick(usage.id)}>
                                                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            ) : (
                                                                <div className="text-center text-muted-foreground py-4">No budget usages found for this sub-budget.</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  ) : (
                                    <div className="text-center text-muted-foreground py-8">No sub-budgets found for this master budget.</div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No master budgets found.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics & Reports Tab Content */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Financial Snapshot</CardTitle>
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingFinancialSnapshot ? <LoadingSkeleton variant="text" /> : financialSnapshotError ? <ErrorState message="Failed to load snapshot" /> : (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{formatCurrency(financialSnapshot?.total_assets || 0)}</p>
                    <div className="text-sm text-muted-foreground">
                      Total Assets: {formatCurrency(financialSnapshot?.total_assets || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Liabilities: {formatCurrency(financialSnapshot?.total_liabilities || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Net Worth: {formatCurrency(financialSnapshot?.net_worth || 0)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Monthly Profit</CardTitle>
                <LineChart className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingMonthlyProfit ? <LoadingSkeleton variant="chart" /> : monthlyProfitError ? <ErrorState message="Failed to load monthly profit" /> : monthlyProfitData ? (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlyProfitChartData}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="name" stroke="hsl(215, 27.9%, 16.9%)" />
                        <YAxis stroke="hsl(215, 27.9%, 16.9%)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 13%)",
                            border: "1px solid hsl(217, 33%, 20%)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`KES ${value.toLocaleString()}`, "Profit"]}
                        />
                        <Area type="monotone" dataKey="profit" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No monthly profit data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Pending BOM Variances</CardTitle>
              <Hourglass className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingPendingVariances ? <LoadingSkeleton variant="table" count={3} /> : pendingVariancesError ? <ErrorState message="Failed to load variances" /> : pendingVariances && pendingVariances.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variant ID</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVariances.map((variance) => (
                        <TableRow key={variance.id}>
                          <TableCell className="font-medium">{variance.id}</TableCell>
                          <TableCell>{variance.project_name}</TableCell>
                          <TableCell>{variance.item_name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(variance.amount)}</TableCell>
                          <TableCell><Badge variant="outline">{variance.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleApproveVariance(variance.id, true)}>
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleApproveVariance(variance.id, false)}>
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No pending BOM variances.</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Project Financials Overview</CardTitle>
                <CardDescription>Select a project to view its financial details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="selectProject">Select Project</Label>
                  <Select onValueChange={(value) => setSelectedProjectId(parseInt(value))} value={selectedProjectId?.toString() || ""}>
                    <SelectTrigger id="selectProject">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectsData?.items?.map((project: ProjectOut) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProjectId && (
                  <div className="space-y-4">
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="text-base">Budget Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingProjectBudgetSummary ? <LoadingSkeleton variant="text" /> : projectBudgetSummaryError ? <ErrorState message="Failed to load budget summary" /> : (
                          <div className="space-y-1 text-sm">
                            <p>Total Budget: {formatCurrency(projectBudgetSummary?.total_budget || 0)}</p>
                            <p>Amount Spent: {formatCurrency(projectBudgetSummary?.amount_spent || 0)}</p>
                            <p>Remaining Budget: {formatCurrency(projectBudgetSummary?.remaining_budget || 0)}</p>
                            <p>Budget Status: <Badge>{projectBudgetSummary?.status}</Badge></p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="text-base">Project Costs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingProjectCosts ? <LoadingSkeleton variant="table" count={2} /> : projectCostsError ? <ErrorState message="Failed to load project costs" /> : projectCosts && projectCosts.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {projectCosts.map((cost: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>{cost.description}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(cost.amount)}</TableCell>
                                  <TableCell>{format(new Date(cost.date), 'PPP')}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center text-muted-foreground py-4">No project costs recorded.</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Project Profitability</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        {loadingProjectProfitability ? <LoadingSkeleton variant="text" /> : projectProfitabilityError ? <ErrorState message="Failed to load profitability" /> : (
                          <div className="space-y-1 text-sm">
                            <p>Revenue: {formatCurrency(projectProfitability?.revenue || 0)}</p>
                            <p>Expenses: {formatCurrency(projectProfitability?.expenses || 0)}</p>
                            <p>Profit: {formatCurrency(projectProfitability?.profit || 0)}</p>
                            <p>Profit Margin: {projectProfitability?.profit_margin?.toFixed(2) || 0}%</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Budget Variance</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        {loadingBudgetVariance ? <LoadingSkeleton variant="text" /> : budgetVarianceError ? <ErrorState message="Failed to load variance" /> : (
                          <div className="space-y-1 text-sm">
                            <p>Calculated Variance: {formatCurrency(budgetVariance?.variance_amount || 0)}</p>
                            <p>Status: <Badge>{budgetVariance?.status}</Badge></p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Forecast Completion Cost</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        {loadingForecastCompletionCost ? <LoadingSkeleton variant="text" /> : forecastCompletionCostError ? <ErrorState message="Failed to load forecast" /> : (
                          <div className="space-y-1 text-sm">
                            <p>Forecasted Cost: {formatCurrency(forecastCompletionCost?.forecasted_cost || 0)}</p>
                            <p>Confidence: {forecastCompletionCost?.confidence_level || 0}%</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Button onClick={handleAllocateProjectBudget} className="w-full" disabled={allocateProjectBudgetMutation.isPending}>
                        {allocateProjectBudgetMutation.isPending ? "Allocating..." : "Allocate Project Budget (Example)"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Budget Allocation Recommendation</CardTitle>
                  <CardDescription>Get recommendations based on your financial snapshot.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRecommendation ? <LoadingSkeleton variant="text" /> : recommendationError ? <ErrorState message="Failed to load recommendations" /> : recommendationData ? (
                    <div className="space-y-2">
                      <p className="text-sm">Based on your total assets of {formatCurrency(financialSnapshot?.total_assets || 0)}, we recommend the following allocation:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {Object.entries(recommendationData).map(([category, amount]) => (
                          <li key={category}>{category}: {formatCurrency(amount as number)}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">No allocation recommendations available.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Generate Profitability Report</CardTitle>
                  <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reportStartDate">Start Date</Label>
                    <Input id="reportStartDate" type="date" value={reportForm.start_date} onChange={(e) => setReportForm({ ...reportForm, start_date: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reportEndDate">End Date</Label>
                    <Input id="reportEndDate" type="date" value={reportForm.end_date} onChange={(e) => setReportForm({ ...reportForm, end_date: e.target.value })} />
                  </div>
                  <Button onClick={handleGenerateReport} className="w-full" disabled={generateProfitabilityReportMutation.isPending}>
                    {generateProfitabilityReportMutation.isPending ? "Generating..." : "Generate Report"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Account Reconciliation</CardTitle>
                  <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Button onClick={handleReconcileAccounts} className="w-full" disabled={reconcileAccountsMutation.isPending}>
                    {reconcileAccountsMutation.isPending ? "Reconciling..." : "Reconcile Accounts Now"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Process Task Financial Completion</CardTitle>
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="taskIdForFinancialCompletion">Task ID</Label>
                    <Input id="taskIdForFinancialCompletion" type="number" placeholder="e.g., 123" onChange={(e) => {
                      // Placeholder for actual task ID input
                      // For now, directly call with a dummy ID or hook it up to a state
                    }} />
                  </div>
                  <Button onClick={() => handleProcessTaskFinancialCompletion(1)} className="w-full" disabled={processTaskCompletionFinancialMutation.isPending}>
                    {processTaskCompletionFinancialMutation.isPending ? "Processing..." : "Process Financial Completion (Example Task 1)"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create New Invoice Dialog */}
      <Dialog open={isCreateInvoiceDialogOpen} onOpenChange={setIsCreateInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Fill in the details to generate a new invoice.</DialogDescription>
          </DialogHeader>
          <InvoiceForm onSuccess={handleCreateInvoiceSuccess} onCancel={handleCreateInvoiceCancel} />
        </DialogContent>
      </Dialog>

      {/* Financial Account Forms */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Financial Account</DialogTitle>
            <DialogDescription>Add a new financial account.</DialogDescription>
          </DialogHeader>
          <FinancialAccountForm onSuccess={handleAccountFormSuccess} onCancel={handleAccountFormCancel} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Financial Account</DialogTitle>
            <DialogDescription>Update the financial account details.</DialogDescription>
          </DialogHeader>
          {accountToEdit && <FinancialAccountForm initialData={accountToEdit} onSuccess={handleAccountFormSuccess} onCancel={handleAccountFormCancel} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAccountAlertDialogOpen} onOpenChange={setIsDeleteAccountAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the financial account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteAccount} disabled={deleteFinancialAccountMutation.isPending}>
              {deleteFinancialAccountMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Master Budget Forms */}
      <Dialog open={isCreateMasterBudgetDialogOpen} onOpenChange={setIsCreateMasterBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Master Budget</DialogTitle>
            <DialogDescription>Define a new master budget.</DialogDescription>
          </DialogHeader>
          <MasterBudgetForm onSuccess={handleMasterBudgetFormSuccess} onCancel={handleMasterBudgetFormCancel} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditMasterBudgetDialogOpen} onOpenChange={setIsEditMasterBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Master Budget</DialogTitle>
            <DialogDescription>Update the master budget details.</DialogDescription>
          </DialogHeader>
          {masterBudgetToEdit && <MasterBudgetForm initialData={masterBudgetToEdit} onSuccess={handleMasterBudgetFormSuccess} onCancel={handleMasterBudgetFormCancel} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteMasterBudgetAlertDialogOpen} onOpenChange={setIsDeleteMasterBudgetAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the master budget and all its sub-budgets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteMasterBudget} disabled={deleteMasterBudgetMutation.isPending}>
              {deleteMasterBudgetMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sub Budget Forms */}
      <Dialog open={isCreateSubBudgetDialogOpen} onOpenChange={setIsCreateSubBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Sub-Budget</DialogTitle>
            <DialogDescription>Define a new sub-budget for the selected master budget.</DialogDescription>
          </DialogHeader>
          {expandedMasterBudget && <SubBudgetForm masterBudgetId={expandedMasterBudget} onSuccess={handleSubBudgetFormSuccess} onCancel={handleSubBudgetFormCancel} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditSubBudgetDialogOpen} onOpenChange={setIsEditSubBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Sub-Budget</DialogTitle>
            <DialogDescription>Update the sub-budget details.</DialogDescription>
          </DialogHeader>
          {subBudgetToEdit && <SubBudgetForm masterBudgetId={subBudgetToEdit.master_budget_id} initialData={subBudgetToEdit} onSuccess={handleSubBudgetFormSuccess} onCancel={handleSubBudgetFormCancel} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteSubBudgetAlertDialogOpen} onOpenChange={setIsDeleteSubBudgetAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sub-budget and all its usages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteSubBudget} disabled={deleteSubBudgetMutation.isPending}>
              {deleteSubBudgetMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Budget Usage Forms */}
      <Dialog open={isCreateUsageDialogOpen} onOpenChange={setIsCreateUsageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Budget Usage</DialogTitle>
            <DialogDescription>Record a new expenditure against the sub-budget.</DialogDescription>
          </DialogHeader>
          {subBudgetIdForUsage && <BudgetUsageForm subBudgetId={subBudgetIdForUsage} onSuccess={handleUsageFormSuccess} onCancel={handleUsageFormCancel} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditUsageDialogOpen} onOpenChange={setIsEditUsageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Budget Usage</DialogTitle>
            <DialogDescription>Update the budget usage details.</DialogDescription>
          </DialogHeader>
          {usageToEdit && <BudgetUsageForm initialData={usageToEdit} onSuccess={handleUsageFormSuccess} onCancel={handleUsageFormCancel} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteUsageAlertDialogOpen} onOpenChange={setIsDeleteUsageAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget usage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteUsage} disabled={deleteBudgetUsageMutation.isPending}>
              {deleteBudgetUsageMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}