import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { financeApi, mpesaApi, ncbaApi } from '@/lib/api';
import {
  MasterBudget, MasterBudgetCreate, MasterBudgetUpdate,
  SubBudget, SubBudgetCreate, SubBudgetUpdate,
  BudgetUsage, BudgetUsageCreate, BudgetUsageUpdate, BudgetUsageStatus,
  Invoice, InvoiceCreate, InvoiceUpdate,
  FinancialAccount, FinancialAccountCreate, FinancialAccountUpdate,
  ProfitabilityReportResponse, InfrastructureProfitabilityResponse,
  MpesaTransactionOut, MpesaC2BRequest, MpesaSTKPushRequest, MpesaQRCodeRequest, MpesaB2CRequest, MpesaB2BRequest, MpesaTaxRemittanceRequest, MpesaRatibaCreate, MpesaTransactionStatusRequest, MpesaReverseTransactionRequest, NcbaPayRequest,
  BOMVarianceOut, BudgetSummary, ProjectFinancialsOut, FinancialSnapshotResponse
} from '@/types/api';
import { toast } from 'sonner';

// Master Budget Hooks
export const useMasterBudgets = (skip = 0, limit = 100) => {
  return useQuery<MasterBudget[]>({
    queryKey: ['finance', 'master-budgets', skip, limit],
    queryFn: () => financeApi.getMasterBudgets(skip, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMasterBudget = (id: number) => {
  return useQuery<MasterBudget>({
    queryKey: ['finance', 'master-budget', id],
    queryFn: () => financeApi.getMasterBudget(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id, // Only run query if id is available
  });
};

export const useCreateMasterBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBudget: MasterBudgetCreate) => financeApi.createMasterBudget(newBudget),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'master-budgets'] });
      toast.success(`Master Budget "${data.name}" created.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create master budget: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateMasterBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MasterBudgetUpdate }) => financeApi.updateMasterBudget(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'master-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'master-budget', data.id] });
      toast.success(`Master Budget "${data.name}" updated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update master budget: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteMasterBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteMasterBudget(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'master-budgets'] });
      toast.success(`Master Budget (ID: ${id}) deleted.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete master budget: ${error.message || 'Unknown error'}`);
    },
  });
};

// Sub Budget Hooks
export const useSubBudgets = (masterBudgetId: number, skip = 0, limit = 100) => {
  return useQuery<SubBudget[]>({
    queryKey: ['finance', 'master-budget', masterBudgetId, 'sub-budgets', skip, limit],
    queryFn: () => financeApi.getSubBudgets(masterBudgetId, skip, limit),
    staleTime: 5 * 60 * 1000,
    enabled: !!masterBudgetId,
  });
};

export const useSubBudget = (id: number) => {
  return useQuery<SubBudget>({
    queryKey: ['finance', 'sub-budget', id],
    queryFn: () => financeApi.getSubBudget(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

export const useCreateSubBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ masterBudgetId, data }: { masterBudgetId: number; data: SubBudgetCreate }) =>
      financeApi.createSubBudget(masterBudgetId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'master-budget', data.master_budget_id, 'sub-budgets'] });
      toast.success(`Sub Budget "${data.name}" created.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create sub budget: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateSubBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubBudgetUpdate }) => financeApi.updateSubBudget(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'master-budget', data.master_budget_id, 'sub-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'sub-budget', data.id] });
      toast.success(`Sub Budget "${data.name}" updated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update sub budget: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteSubBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteSubBudget(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'master-budgets'] }); // Invalidate all master budgets to reflect changes
      queryClient.invalidateQueries({ queryKey: ['finance', 'sub-budgets'] }); // Invalidate generic sub-budget list
      toast.success(`Sub Budget (ID: ${id}) deleted.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete sub budget: ${error.message || 'Unknown error'}`);
    },
  });
};

// Budget Usage Hooks
export const useBudgetUsages = (subBudgetId: number, skip = 0, limit = 100) => {
  return useQuery<BudgetUsage[]>({
    queryKey: ['finance', 'sub-budget', subBudgetId, 'usages', skip, limit],
    queryFn: () => financeApi.getBudgetUsages(subBudgetId, skip, limit),
    staleTime: 5 * 60 * 1000,
    enabled: !!subBudgetId,
  });
};

export const useCreateBudgetUsage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newUsage: BudgetUsageCreate) => financeApi.createBudgetUsage(newUsage),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'sub-budget', data.sub_budget_id, 'usages'] });
      toast.success(`Budget Usage created for ${data.amount}.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create budget usage: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateBudgetUsage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BudgetUsageUpdate }) => financeApi.updateBudgetUsage(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'sub-budget', data.sub_budget_id, 'usages'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'budget-usage', data.id] });
      toast.success(`Budget Usage (ID: ${data.id}) updated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update budget usage: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteBudgetUsage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteBudgetUsage(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budget-usages'] });
      toast.success(`Budget Usage (ID: ${id}) deleted.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete budget usage: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useApproveBudgetUsage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approved, notes }: { id: number; approved: boolean; notes?: string }) =>
      financeApi.approveBudgetUsage(id, { approved, notes }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'sub-budget', data.sub_budget_id, 'usages'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'budget-usage', data.id] });
      toast.success(`Budget Usage (ID: ${data.id}) ${data.status?.toLowerCase()}.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to approve/reject budget usage: ${error.message || 'Unknown error'}`);
    },
  });
};

// Invoice Hooks
export const useInvoices = (skip = 0, limit = 100) => {
  return useQuery<Invoice[]>({
    queryKey: ['finance', 'invoices', skip, limit],
    queryFn: async () => {
      try {
        return await financeApi.getInvoices(skip, limit);
      } catch (error) {
        console.warn("Finance - Failed to fetch invoices, using fallback:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useInvoice = (id: number) => {
  return useQuery<Invoice>({
    queryKey: ['finance', 'invoice', id],
    queryFn: () => financeApi.getInvoice(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newInvoice: InvoiceCreate) => financeApi.generateInvoice(newInvoice),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      toast.success(`Invoice "${data.invoice_number}" generated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to generate invoice: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InvoiceUpdate }) => financeApi.updateInvoice(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoice', data.id] });
      toast.success(`Invoice "${data.invoice_number}" updated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update invoice: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteInvoice(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      toast.success(`Invoice (ID: ${id}) deleted.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete invoice: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useOverdueInvoices = (daysOverdue = 0) => {
  return useQuery<Invoice[]>({
    queryKey: ['finance', 'overdue-invoices', daysOverdue],
    queryFn: () => financeApi.overdueInvoices(daysOverdue),
    staleTime: 5 * 60 * 1000,
  });
};

// Financial Account Hooks
export const useFinancialAccounts = (skip = 0, limit = 100) => {
  return useQuery<FinancialAccount[]>({
    queryKey: ['finance', 'financial-accounts', skip, limit],
    queryFn: () => financeApi.financialAccounts(skip, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinancialAccount = (id: number) => {
  return useQuery<FinancialAccount>({
    queryKey: ['finance', 'financial-account', id],
    queryFn: () => financeApi.getFinancialAccount(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

export const useCreateFinancialAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newAccount: FinancialAccountCreate) => financeApi.createFinancialAccount(newAccount),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'financial-accounts'] });
      toast.success(`Financial Account "${data.name}" created.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create financial account: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateFinancialAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FinancialAccountUpdate }) => financeApi.updateFinancialAccount(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'financial-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'financial-account', data.id] });
      toast.success(`Financial Account "${data.name}" updated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update financial account: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteFinancialAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteFinancialAccount(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'financial-accounts'] });
      toast.success(`Financial Account (ID: ${id}) deleted.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete financial account: ${error.message || 'Unknown error'}`);
    },
  });
};

// Reporting Hooks
export const useInfrastructureProfitability = (startDate?: string, endDate?: string) => {
  return useQuery<InfrastructureProfitabilityResponse[]>({
    queryKey: ['finance', 'infrastructure-profitability', startDate, endDate],
    queryFn: async () => {
      try {
        return await financeApi.infrastructureProfitability(startDate, endDate);
      } catch (error) {
        console.warn("Finance - Failed to fetch infrastructure profitability, using fallback:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useGenerateProfitabilityReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { start_date: string; end_date: string }) => financeApi.generateProfitabilityReport(data),
    onSuccess: (data) => {
      // Potentially invalidate other finance reports if they depend on this
      toast.success('Profitability Report generated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to generate profitability report: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useMonthlyProfit = (year: number, month: number) => {
  return useQuery<any>({ // Assuming return type is a simple object or number
    queryKey: ['finance', 'monthly-profit', year, month],
    queryFn: () => financeApi.monthlyProfit(year, month),
    staleTime: 5 * 60 * 1000,
    enabled: !!year && !!month,
  });
};

// M-Pesa Hooks
export const useMpesaTransactions = (params?: { limit?: number; status?: string }) => {
  return useQuery<MpesaTransactionOut[]>({
    queryKey: ['finance', 'mpesa', 'transactions', params],
    queryFn: () => mpesaApi.transactions(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMpesaTransaction = (id: number) => {
  return useQuery<MpesaTransactionOut>({
    queryKey: ['finance', 'mpesa', 'transaction', id],
    queryFn: () => mpesaApi.getTransaction(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

export const useMpesaTransactionByReceipt = (receiptNumber: string) => {
  return useQuery<MpesaTransactionOut>({
    queryKey: ['finance', 'mpesa', 'transaction-by-receipt', receiptNumber],
    queryFn: () => mpesaApi.getTransactionByReceipt(receiptNumber),
    staleTime: 5 * 60 * 1000,
    enabled: !!receiptNumber,
  });
};

export const useRegisterC2BUrls = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => mpesaApi.registerC2BUrls(),
    onSuccess: () => {
      toast.success('M-Pesa C2B URLs registered successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to register C2B URLs: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useSimulateC2B = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MpesaC2BRequest) => mpesaApi.simulateC2B(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'mpesa', 'transactions'] });
      toast.success('M-Pesa C2B simulation successful.');
    },
    onError: (error: any) => {
      toast.error(`M-Pesa C2B simulation failed: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useStkPush = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MpesaSTKPushRequest) => mpesaApi.stkPush(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'mpesa', 'transactions'] });
      toast.success('M-Pesa STK Push initiated successfully.');
    },
    onError: (error: any) => {
      toast.error(`M-Pesa STK Push failed: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useGenerateDynamicQR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MpesaQRCodeRequest) => mpesaApi.generateDynamicQR(data),
    onSuccess: (data) => {
      toast.success('M-Pesa Dynamic QR generated successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to generate Dynamic QR: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useB2CPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MpesaB2CRequest) => mpesaApi.b2cPay(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'mpesa', 'transactions'] });
      toast.success('M-Pesa B2C payment initiated successfully.');
    },
    onError: (error: any) => {
      toast.error(`M-Pesa B2C payment failed: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useB2BPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MpesaB2BRequest) => mpesaApi.b2bPay(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'mpesa', 'transactions'] });
      toast.success('M-Pesa B2B payment initiated successfully.');
    },
    onError: (error: any) => {
      toast.error(`M-Pesa B2B payment failed: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useRemitTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MpesaTaxRemittanceRequest) => mpesaApi.remitTax(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'mpesa', 'transactions'] });
      toast.success('M-Pesa tax remittance successful.');
    },
    onError: (error: any) => {
      toast.error(`M-Pesa tax remittance failed: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useCreateRatiba = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MpesaRatibaCreate) => mpesaApi.createRatiba(data),
    onSuccess: (data: { name: string; id: number }) => {
      toast.success(`M-Pesa Ratiba "${data.name}" created successfully.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create M-Pesa Ratiba: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useCheckMpesaBalance = () => {
  return useQuery<any>({
    queryKey: ['finance', 'mpesa', 'balance'],
    queryFn: async () => {
      try {
        return await mpesaApi.checkBalance();
      } catch (error) {
        console.warn("M-Pesa - Failed to fetch balance, using fallback:", error);
        return 0;
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useCheckMpesaTransactionStatus = () => {
  return useMutation({
    mutationFn: (data: MpesaTransactionStatusRequest) => mpesaApi.checkTransactionStatus(data),
    onSuccess: (data: any) => {
      toast.success(`M-Pesa Transaction ${data.status}: ${data.result_desc}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to check transaction status: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useReverseMpesaTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MpesaReverseTransactionRequest) => mpesaApi.reverseTransaction(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'mpesa', 'transactions'] });
      toast.success('M-Pesa transaction reversed successfully.');
    },
    onError: (error: any) => {
      toast.error(`Failed to reverse M-Pesa transaction: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useReconcileMpesa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: string; endDate: string }) => mpesaApi.reconcile(startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'mpesa', 'transactions'] });
      toast.success('M-Pesa reconciliation initiated successfully.');
    },
    onError: (error: any) => {
      toast.error(`M-Pesa reconciliation failed: ${error.message || 'Unknown error'}`);
    },
  });
};

// NCBA Bank Hooks
export const useNcbaPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NcbaPayRequest) => ncbaApi.pay(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'financial-accounts'] }); // Assuming payments affect accounts
      toast.success('NCBA Bank payment successful.');
    },
    onError: (error: any) => {
      toast.error(`NCBA Bank payment failed: ${error.message || 'Unknown error'}`);
    },
  });
};

// BOM Variances Hooks
export const usePendingVariances = (limit = 50) => {
  return useQuery<BOMVarianceOut[]>({
    queryKey: ['finance', 'bom-variances', 'pending', limit],
    queryFn: () => financeApi.pendingVariances(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useApproveVariance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ varianceId, approved, approver_id, notes }: { varianceId: number; approved: boolean; approver_id: number; notes?: string }) =>
      financeApi.approveVariance(varianceId, { approved, approver_id, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'bom-variances', 'pending'] });
      toast.success('BOM Variance updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update BOM Variance: ${error.message || 'Unknown error'}`);
    },
  });
};

// Project Financials Hooks (Some from ProjectDetail, added others)
export const useProjectBudgetSummary = (projectId: number) => {
  return useQuery<BudgetSummary>({
    queryKey: ['finance', 'project', projectId, 'budget-summary'],
    queryFn: () => financeApi.projectBudgetSummary(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
};

export const useProjectFinancials = (projectId: number) => {
  return useQuery<ProjectFinancialsOut>({
    queryKey: ['finance', 'project', projectId, 'financials'],
    queryFn: () => financeApi.projectFinancials(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
};

export const useTrackProjectCosts = (projectId: number) => {
  return useQuery<any>({ // Assuming return type is an object with cost details
    queryKey: ['finance', 'project', projectId, 'costs'],
    queryFn: () => financeApi.trackProjectCosts(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
};

export const useCalculateBudgetVariance = (projectId: number) => {
  return useQuery<any>({ // Assuming return type is a variance object/number
    queryKey: ['finance', 'project', projectId, 'variance'],
    queryFn: () => financeApi.calculateBudgetVariance(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
};

export const useForecastCompletionCost = (projectId: number) => {
  return useQuery<any>({ // Assuming return type is a cost forecast
    queryKey: ['finance', 'project', projectId, 'forecast'],
    queryFn: () => financeApi.forecastCompletionCost(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
};

export const useProjectProfitability = (projectId: number) => {
  return useQuery<any>({ // Assuming return type for ProjectProfitability
    queryKey: ['finance', 'project', projectId, 'profitability'],
    queryFn: () => financeApi.projectProfitability(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
};

export const useAllocateProjectBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: any }) => financeApi.allocateProjectBudget(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'project'] });
      toast.success('Project budget allocated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to allocate project budget: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useCompleteProjectFinancial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: number) => financeApi.completeProjectFinancial(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'project'] });
      toast.success('Project financial completed successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to complete project financial: ${error.message || 'Unknown error'}`);
    },
  });
};

// Financial Analytics Hooks
export const useFinancialSnapshot = () => {
  return useQuery<FinancialSnapshotResponse>({
    queryKey: ['finance', 'snapshot'],
    queryFn: () => financeApi.snapshot(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBudgetAllocationRecommendation = (totalBudget: number, periodMonths = 12) => {
  return useQuery<any>({ // Assuming return type for recommendation
    queryKey: ['finance', 'budget-allocation-recommendation', totalBudget, periodMonths],
    queryFn: () => financeApi.budgetAllocationRecommendation(totalBudget, periodMonths),
    staleTime: 5 * 60 * 1000,
    enabled: !!totalBudget,
  });
};

export const useReconcileAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { period_start: string; period_end: string }) => financeApi.reconcileAccounts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] }); // Invalidate all finance queries
      toast.success('Accounts reconciled successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to reconcile accounts: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useProcessTaskCompletionFinancial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => financeApi.completeTaskFinancial(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      toast.success('Task financial completion processed successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to process task financial completion: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDetectTaskVariances = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => financeApi.detectTaskVariances(taskId),
    onSuccess: (data) => {
      // Assuming data from detectTaskVariances contains some info, e.g., task_id or detected_variances
      queryClient.invalidateQueries({ queryKey: ['finance', 'bom-variances', 'pending'] });
      // You might want to display a more specific success message based on the API response
      toast.success(`Task variances for Task ID ${data?.task_id || 'unknown'} detected successfully!`);
    },
    onError: (error: any) => {
      toast.error(`Failed to detect task variances: ${error.message || 'Unknown error'}`);
    },
  });
};

// Budget Template Hooks
export const useDownloadBudgetTemplate = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<any>(null);

  const downloadTemplate = async (projectName?: string) => {
    setDownloading(true);
    setError(null);
    try {
      const response = await financeApi.downloadBudgetTemplate(projectName); // API call directly handles download
      toast.success(response.message || "Budget template download initiated.");
    } catch (err: any) {
      setError(err);
      toast.error(`Failed to download budget template: ${err.message || 'Unknown error'}`);
    } finally {
      setDownloading(false);
    }
  };

  return { downloadTemplate, downloading, error };
};

export const useUploadBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => financeApi.uploadBudget(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'master-budgets'] }); // Invalidate budgets after upload
      toast.success('Budget uploaded successfully!');
      if (data.message) {
        toast.info(data.message);
      }
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((err: string) => toast.error(err));
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to upload budget: ${error.message || 'Unknown error'}`);
    },
  });
};