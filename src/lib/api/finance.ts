import {
  FinancialSnapshotResponse,
  FinancialAccount,
  FinancialAccountCreate,
  FinancialAccountUpdate,
  MasterBudget,
  MasterBudgetCreate,
  MasterBudgetUpdate,
  SubBudget,
  SubBudgetCreate,
  SubBudgetUpdate,
  BudgetUsage,
  BudgetUsageCreate,
  BudgetUsageUpdate,
  Invoice,
  InvoiceCreate,
  InvoiceUpdate,
  BOMVarianceOut,
  ProjectFinancialsOut,
  InfrastructureProfitabilityResponse,
  ProfitabilityReportResponse,
  MpesaTransactionOut,
  MpesaTransactionStatusRequest,
} from '../../types/api';
import { apiFetch, API_BASE_URL, getAccessToken } from './base';

export const financeApi = {
  // Snapshot & Overview
  snapshot: (): Promise<FinancialSnapshotResponse> =>
    apiFetch<FinancialSnapshotResponse>("/api/v1/finance/snapshot"),

  // Budget Template
  downloadBudgetTemplate: async (projectName = "New Project") => {
    const accessToken = getAccessToken();
    const headers: HeadersInit = {};
    if (accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/finance/budget-template?project_name=${encodeURIComponent(projectName)}`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred during template download" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `${projectName || 'budget_template'}.xlsx`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return { message: "Budget template download initiated." };
  },

  uploadBudget: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const accessToken = getAccessToken();

    return fetch(`${API_BASE_URL}/api/v1/finance/upload-budget/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
      body: formData,
    }).then(r => r.json());
  },

  // Financial Accounts
  financialAccounts: (skip = 0, limit = 100): Promise<FinancialAccount[]> =>
    apiFetch<FinancialAccount[]>(`/api/v1/finance/financial-accounts/?skip=${skip}&limit=${limit}`),

  getFinancialAccount: (id: number): Promise<FinancialAccount> =>
    apiFetch<FinancialAccount>(`/api/v1/finance/financial-accounts/${id}`),

  createFinancialAccount: (data: FinancialAccountCreate): Promise<FinancialAccount> =>
    apiFetch<FinancialAccount>("/api/v1/finance/financial-accounts/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateFinancialAccount: (id: number, data: FinancialAccountUpdate): Promise<FinancialAccount> =>
    apiFetch<FinancialAccount>(`/api/v1/finance/financial-accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteFinancialAccount: (id: number) =>
    apiFetch(`/api/v1/finance/financial-accounts/${id}`, {
      method: "DELETE",
    }),
  // Master Budgets
  getMasterBudgets: (skip = 0, limit = 100): Promise<MasterBudget[]> =>
    apiFetch<MasterBudget[]>(`/api/v1/finance/master-budgets?skip=${skip}&limit=${limit}`),

  getMasterBudget: (id: number): Promise<MasterBudget> =>
    apiFetch<MasterBudget>(`/api/v1/finance/master-budgets/${id}`),

  createMasterBudget: (data: MasterBudgetCreate): Promise<MasterBudget> =>
    apiFetch<MasterBudget>("/api/v1/finance/master-budgets", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateMasterBudget: (id: number, data: MasterBudgetUpdate): Promise<MasterBudget> =>
    apiFetch<MasterBudget>(`/api/v1/finance/master-budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteMasterBudget: (id: number) =>
    apiFetch(`/api/v1/finance/master-budgets/${id}`, {
      method: "DELETE",
    }),

  // Sub Budgets
  getSubBudgets: (masterBudgetId: number, skip = 0, limit = 100): Promise<SubBudget[]> =>
    apiFetch<SubBudget[]>(`/api/v1/finance/master-budgets/${masterBudgetId}/sub-budgets?skip=${skip}&limit=${limit}`),

  createSubBudget: (masterBudgetId: number, data: SubBudgetCreate): Promise<SubBudget> =>
    apiFetch<SubBudget>(`/api/v1/finance/master-budgets/${masterBudgetId}/sub-budgets/`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getSubBudget: (subBudgetId: number): Promise<SubBudget> =>
    apiFetch<SubBudget>(`/api/v1/finance/sub-budgets/${subBudgetId}`),

  updateSubBudget: (subBudgetId: number, data: SubBudgetUpdate): Promise<SubBudget> =>
    apiFetch<SubBudget>(`/api/v1/finance/sub-budgets/${subBudgetId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteSubBudget: (subBudgetId: number) =>
    apiFetch(`/api/v1/finance/sub-budgets/${subBudgetId}`, {
      method: "DELETE",
    }),

  // Budget Usage
  createBudgetUsage: (data: BudgetUsageCreate): Promise<BudgetUsage> =>
    apiFetch<BudgetUsage>("/api/v1/finance/budget-usages/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  approveBudgetUsage: (usageId: number, data: { approved: boolean; notes?: string }): Promise<BudgetUsage> =>
    apiFetch<BudgetUsage>(`/api/v1/finance/budget-usages/${usageId}/approve`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateBudgetUsage: (usageId: number, data: BudgetUsageUpdate): Promise<BudgetUsage> =>
    apiFetch<BudgetUsage>(`/api/v1/finance/budget-usages/${usageId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteBudgetUsage: (usageId: number) =>
    apiFetch(`/api/v1/finance/budget-usages/${usageId}`, {
      method: "DELETE",
    }),

  getBudgetUsages: (subBudgetId: number, skip = 0, limit = 100): Promise<BudgetUsage[]> =>
    apiFetch<BudgetUsage[]>(`/api/v1/finance/sub-budgets/${subBudgetId}/usages?skip=${skip}&limit=${limit}`),
  // BOM Variances
  createBOMVariance: (data: any) =>
    apiFetch<BOMVarianceOut>("/api/v1/finance/bom-variances/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  detectTaskVariances: (taskId: number) =>
    apiFetch(`/api/v1/finance/tasks/${taskId}/detect-variances`, { method: "POST" }),

  pendingVariances: (limit = 50) =>
    apiFetch<BOMVarianceOut[]>(`/api/v1/finance/variances/pending?limit=${limit}`),

  approveVariance: (varianceId: number, data: { approved: boolean; approver_id: number; notes?: string }) =>
    apiFetch<BOMVarianceOut>(`/api/v1/finance/variances/${varianceId}/approve`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Project Financials
  projectFinancials: (projectId: number) =>
    apiFetch<ProjectFinancialsOut>(`/api/v1/finance/projects/${projectId}/financials`),

  allocateProjectBudget: (projectId: number, data: any) =>
    apiFetch(`/api/v1/finance/projects/${projectId}/budget/allocate`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  projectBudgetSummary: (projectId: number) =>
    apiFetch(`/api/v1/finance/projects/${projectId}/budget/summary`),

  trackProjectCosts: (projectId: number) =>
    apiFetch(`/api/v1/finance/projects/${projectId}/costs`),

  calculateBudgetVariance: (projectId: number) =>
    apiFetch(`/api/v1/finance/projects/${projectId}/variance`),

  forecastCompletionCost: (projectId: number) =>
    apiFetch(`/api/v1/finance/projects/${projectId}/forecast`),

  projectProfitability: (projectId: number) =>
    apiFetch(`/api/v1/finance/projects/${projectId}/profitability`),

  completeProjectFinancial: (projectId: number) =>
    apiFetch(`/api/v1/finance/projects/${projectId}/complete`, { method: "POST" }),

  // Payments & Invoices
  getInvoices: (skip = 0, limit = 100): Promise<Invoice[]> =>
    apiFetch<Invoice[]>(`/api/v1/finance/invoices?skip=${skip}&limit=${limit}`),

  getInvoice: (id: number): Promise<Invoice> =>
    apiFetch<Invoice>(`/api/v1/finance/invoices/${id}`),

  createPaymentMilestones: (projectId: number, paymentTerms: any) =>
    apiFetch("/api/v1/finance/payments/milestones", {
      method: "POST",
      body: JSON.stringify(paymentTerms)
    }),

  generateInvoice: (data: InvoiceCreate): Promise<Invoice> =>
    apiFetch<Invoice>("/api/v1/finance/invoices/generate", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateInvoice: (id: number, data: InvoiceUpdate): Promise<Invoice> =>
    apiFetch<Invoice>(`/api/v1/finance/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteInvoice: (id: number) =>
    apiFetch(`/api/v1/finance/invoices/${id}`, {
      method: "DELETE",
    }),

  processPayment: (data: any) =>
    apiFetch("/api/v1/finance/payments/process", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getPaymentSchedule: (projectId: number) =>
    apiFetch(`/api/v1/finance/payments/schedule/${projectId}`),

  overdueInvoices: (daysOverdue = 0): Promise<Invoice[]> =>
    apiFetch<Invoice[]>(`/api/v1/finance/payments/overdue?days_overdue=${daysOverdue}`),

  // Analytics
  infrastructureProfitability: (startDate?: string, endDate?: string): Promise<InfrastructureProfitabilityResponse[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    return apiFetch<InfrastructureProfitabilityResponse[]>(`/api/v1/finance/analytics/infrastructure-profitability?${params}`);
  },

  budgetAllocationRecommendation: (totalBudget: number, periodMonths = 12) =>
    apiFetch(`/api/v1/finance/analytics/budget-allocation?total_budget=${totalBudget}&period_months=${periodMonths}`),

  generateProfitabilityReport: (data: { start_date: string; end_date: string }) =>
    apiFetch<ProfitabilityReportResponse>("/api/v1/finance/analytics/profitability-report", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  monthlyProfit: (year: number, month: number): Promise<number> =>
    apiFetch<number>(`/api/v1/finance/analytics/monthly-profit/${year}/${month}`),

  // Account Reconciliation
  reconcileAccounts: (data: { period_start: string; period_end: string }) =>
    apiFetch("/api/v1/finance/reconcile", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Task Financial Completion
  completeTaskFinancial: (taskId: number) =>
    apiFetch(`/api/v1/finance/tasks/${taskId}/complete-financial`, { method: "POST" }),
};

export const mpesaApi = {
  // C2B (Customer to Business)
  registerC2BUrls: () =>
    apiFetch("/api/v1/finance/mpesa/c2b/register-urls", { method: "POST" }),

  simulateC2B: (data: { phone_number: string; amount: number; bill_ref_number: string }) =>
    apiFetch("/api/v1/finance/mpesa/c2b/simulate", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // STK Push
  stkPush: (data: { phone_number: string; amount: number; account_reference: string; description?: string }) =>
    apiFetch("/api/v1/finance/mpesa/stkpush", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // QR Code
  generateDynamicQR: (data: { amount: number; merchant_name: string; ref_no: string; trx_code?: string }) =>
    apiFetch("/api/v1/finance/mpesa/qr/generate", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // B2C (Business to Customer)
  b2cPay: (data: { phone_number: string; amount: number; remarks: string; occasion?: string }) =>
    apiFetch("/api/v1/finance/mpesa/b2c/pay", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // B2B (Business to Business)
  b2bPay: (data: { amount: number; receiver_shortcode: string; account_reference: string }) =>
    apiFetch("/api/v1/finance/mpesa/b2b/pay", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Tax Remittance
  remitTax: (data: { amount: number; remarks: string }) =>
    apiFetch("/api/v1/finance/mpesa/tax/remit", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  createRatiba: (data: {
    name: string;
    amount: number;
    phone_number: string;
    start_date: string;
    end_date: string;
    frequency: string;
  }): Promise<{ name: string; id: number }> =>
    apiFetch<{ name: string; id: number }>("/api/v1/finance/mpesa/ratiba/create", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Utility
  checkBalance: () =>
    apiFetch("/api/v1/finance/mpesa/balance"),

  checkTransactionStatus: (data: MpesaTransactionStatusRequest): Promise<any> =>
    apiFetch<any>("/api/v1/finance/mpesa/transaction/status", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  reverseTransaction: (data: { transaction_id: string; amount: number; remarks?: string; receiver_party?: string }) =>
    apiFetch("/api/v1/finance/mpesa/transaction/reverse", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Transaction History
  transactions: (params?: { limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.status) searchParams.append("status", params.status);
    return apiFetch<MpesaTransactionOut[]>(`/api/v1/finance/mpesa/transactions?${searchParams}`);
  },

  getTransaction: (transactionId: number) =>
    apiFetch<MpesaTransactionOut>(`/api/v1/finance/mpesa/transactions/${transactionId}`),

  getTransactionByReceipt: (receiptNumber: string) =>
    apiFetch<MpesaTransactionOut>(`/api/v1/finance/mpesa/transactions/receipt/${receiptNumber}`),

  // Reconciliation
  reconcile: (startDate: string, endDate: string): Promise<any> =>
    apiFetch<any>("/api/v1/finance/mpesa/reconcile", {
      method: "POST",
      body: JSON.stringify({ start_date: startDate, end_date: endDate })
    }),
};

// NCBA Bank endpoints
export const ncbaApi = {
  pay: (data: { account_number: string; amount: number; currency?: string }) =>
    apiFetch("/api/v1/finance/ncba/pay", {
      method: "POST",
      body: JSON.stringify(data)
    }),
};
