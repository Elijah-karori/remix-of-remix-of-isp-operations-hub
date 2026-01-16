import { QueryClient } from "@tanstack/react-query";
import {
  Token,
  UserOut,
  UserCreate,
  UserUpdate,
  ProjectOut,
  ProjectCreate,
  ProjectUpdate,
  TaskOut,
  TaskCreate,
  TaskUpdate,
  Product,
  ProductCreate,
  Supplier,
  EmployeeProfileResponse,
  PayoutResponse,
  WorkflowDefinitionRead,
  WorkflowInstanceRead,
  FinancialAccount,
  BudgetSummary,
  TechnicianKPI,
  CustomerSatisfaction,
  RateCardResponse,
  RateCardCreate,
  ComplaintResponse,
  ComplaintCreate,
  WorkflowGraphCreate,
  BOMVarianceOut,
  ProjectFinancialsOut,
  ProfitabilityReportResponse,
} from "../types/api";

export const API_BASE_URL = "http://erp.gygaview.co.ke";

// Token management
let accessToken: string | null = localStorage.getItem("access_token");

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
};

export const getAccessToken = () => accessToken;

// API fetch wrapper with error handling
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "An error occurred" }));

    // Handle 401 Unauthorized - clear token
    if (response.status === 401) {
      setAccessToken(null);
      throw new Error("Session expired. Please log in again.");
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new Error("Access denied. You don't have permission for this action.");
    }

    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Login failed" }));
      if (response.status === 401) {
        throw new Error("Invalid email or password");
      }
      if (response.status === 403) {
        throw new Error("Account is inactive. Please contact administrator.");
      }
      throw new Error(error.detail || "Login failed");
    }

    const data: Token = await response.json();
    setAccessToken(data.access_token);
    return data;
  },

  register: async (data: UserCreate): Promise<UserOut> => {
    return apiFetch<UserOut>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // OTP-based registration
  requestRegistrationOTP: async (email: string, full_name?: string, phone?: string) => {
    return apiFetch("/api/v1/auth/register/otp/request", {
      method: "POST",
      body: JSON.stringify({ email, full_name, phone }),
    });
  },

  verifyRegistrationOTP: async (email: string, otp: string) => {
    const response = await apiFetch<Token>("/api/v1/auth/register/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
    if (response.access_token) {
      setAccessToken(response.access_token);
    }
    return response;
  },

  // Passwordless login (Magic Link)
  requestPasswordlessLogin: async (email: string) => {
    return apiFetch(`/api/v1/auth/passwordless/request?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  },

  verifyPasswordlessOTP: async (email: string, otp: string) => {
    const response = await apiFetch<Token>("/api/v1/auth/passwordless/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
    setAccessToken(response.access_token);
    return response;
  },

  // Password reset
  requestPasswordReset: async (email: string) => {
    return apiFetch("/api/v1/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    return apiFetch("/api/v1/auth/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify({ email, otp, new_password: newPassword }),
    });
  },

  me: async (): Promise<UserOut> => {
    return apiFetch<UserOut>("/api/v1/auth/me");
  },

  updateProfile: async (data: UserUpdate): Promise<UserOut> => {
    return apiFetch<UserOut>("/api/v1/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiFetch("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },

  refresh: async (): Promise<Token> => {
    return apiFetch<Token>("/api/v1/auth/refresh", {
      method: "POST",
    }).then(data => {
      setAccessToken(data.access_token);
      return data;
    });
  },

  setPassword: async (newPassword: string) => {
    return apiFetch("/api/v1/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword }),
    });
  },

  logout: () => setAccessToken(null),
};

// Projects endpoints
export const projectsApi = {
  list: async (params?: { status?: string; infrastructure_type?: string; department_id?: number }): Promise<ProjectOut[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.infrastructure_type) searchParams.append("infrastructure_type", params.infrastructure_type);
    if (params?.department_id) searchParams.append("department_id", String(params.department_id));
    return apiFetch<ProjectOut[]>(`/api/v1/projects/?${searchParams}`);
  },
  get: async (id: number): Promise<ProjectOut> => {
    return apiFetch<ProjectOut>(`/api/v1/projects/${id}`);
  },
  create: (data: ProjectCreate): Promise<ProjectOut> =>
    apiFetch<ProjectOut>("/api/v1/projects/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ProjectUpdate): Promise<ProjectOut> =>
    apiFetch<ProjectOut>(`/api/v1/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// Tasks endpoints
export const tasksApi = {
  list: async (): Promise<TaskOut[]> => {
    return apiFetch<TaskOut[]>("/api/v1/tasks/");
  },
  myAssignments: async (): Promise<TaskOut[]> => {
    return apiFetch<TaskOut[]>("/api/v1/tasks/my-assignments");
  },
  get: async (id: number): Promise<TaskOut> => {
    return apiFetch<TaskOut>(`/api/v1/tasks/${id}`);
  },
  create: (data: TaskCreate): Promise<TaskOut> =>
    apiFetch<TaskOut>("/api/v1/tasks/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: TaskUpdate): Promise<TaskOut> =>
    apiFetch<TaskOut>(`/api/v1/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  logHours: (id: number, hours: number, notes?: string): Promise<TaskOut> =>
    apiFetch<TaskOut>(`/api/v1/tasks/${id}/hours`, { method: "PUT", body: JSON.stringify({ task_id: id, hours, notes }) }),
};

// Finance endpoints
export const financeApi = {
  snapshot: () => apiFetch("/api/v1/finance/snapshot"),
  projectBudget: (projectId: number) => apiFetch(`/api/v1/projects/${projectId}/budget`),
  budgetSummary: (projectId: number): Promise<BudgetSummary> => apiFetch<BudgetSummary>(`/api/v1/projects/${projectId}/budget/summary`),
  createBudget: (projectId: number, data: any) =>
    apiFetch(`/api/v1/projects/${projectId}/budget`, { method: "POST", body: JSON.stringify(data) }),
  pendingVariances: (limit = 50) => apiFetch<BOMVarianceOut[]>(`/api/v1/finance/variances/pending?limit=${limit}`),
  approveVariance: (varianceId: number, data: { approved: boolean; approver_id: number; notes?: string }) =>
    apiFetch<BOMVarianceOut>(`/api/v1/finance/variances/${varianceId}/approve`, { method: "POST", body: JSON.stringify(data) }),
  generateInvoice: (data: any) => apiFetch("/api/v1/finance/invoices/generate", { method: "POST", body: JSON.stringify(data) }),
  processPayment: (data: any) => apiFetch("/api/v1/finance/payments/process", { method: "POST", body: JSON.stringify(data) }),
  overdueInvoices: (daysOverdue = 30) => apiFetch(`/api/v1/finance/payments/overdue?days_overdue=${daysOverdue}`),
  projectProfitability: (projectId: number) => apiFetch<ProjectFinancialsOut>(`/api/v1/finance/projects/${projectId}/profitability`),
  infrastructureAnalytics: (startDate: string, endDate: string) =>
    apiFetch(`/api/v1/finance/analytics/infrastructure-profitability?start_date=${startDate}&end_date=${endDate}`),

  // New standardized endpoints
  financialAccounts: () => apiFetch<FinancialAccount[]>("/api/v1/finance/financial-accounts/"),
  getFinancialAccount: (id: number) => apiFetch<FinancialAccount>(`/api/v1/finance/financial-accounts/${id}`),
};

// M-Pesa endpoints
export const mpesaApi = {
  stkPush: (data: { phone_number: string; amount: number; account_reference: string; description: string }) =>
    apiFetch("/api/v1/finance/mpesa/stkpush", { method: "POST", body: JSON.stringify(data) }),
  balance: () => apiFetch("/api/v1/finance/mpesa/balance"),
  transactions: (params?: { limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.status) searchParams.append("status", params.status);
    return apiFetch(`/api/v1/finance/mpesa/transactions?${searchParams}`);
  },
  b2cPay: (data: { phone_number: string; amount: number; remarks: string }) =>
    apiFetch("/api/v1/finance/mpesa/b2c/pay", { method: "POST", body: JSON.stringify(data) }),
  reconcile: (startDate: string, endDate: string) =>
    apiFetch("/api/v1/finance/mpesa/reconcile", {
      method: "POST",
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    }),
};

// Inventory endpoints
export const inventoryApi = {
  products: async (): Promise<Product[]> => {
    return apiFetch<Product[]>("/api/v1/inventory/products");
  },
  product: async (id: number): Promise<Product> => {
    return apiFetch<Product>(`/api/v1/inventory/products/${id}`);
  },
  createProduct: (data: ProductCreate): Promise<Product> =>
    apiFetch<Product>("/api/v1/inventory/products", { method: "POST", body: JSON.stringify(data) }),
  suppliers: async (activeOnly = true): Promise<Supplier[]> => {
    return apiFetch<Supplier[]>(`/api/v1/inventory/suppliers?active_only=${activeOnly}`);
  },
  lowStock: async (thresholdMultiplier = 1.5) => {
    return apiFetch(`/api/v1/inventory/low-stock?threshold_multiplier=${thresholdMultiplier}`);
  },
  searchProducts: (query: string, useScrapers = false, maxResults = 50) =>
    apiFetch(`/api/v1/products/search?q=${encodeURIComponent(query)}&use_scrapers=${useScrapers}&max_results=${maxResults}`),
  comparePrices: (productName: string, quantity: number) =>
    apiFetch("/api/v1/products/compare-prices", { method: "POST", body: JSON.stringify({ product_name: productName, quantity }) }),
};

// HR endpoints
export const hrApi = {
  employees: (params?: { engagement_type?: string; is_active?: boolean }): Promise<EmployeeProfileResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params?.engagement_type) searchParams.append("engagement_type", params.engagement_type);
    if (params?.is_active !== undefined) searchParams.append("is_active", String(params.is_active));
    return apiFetch<EmployeeProfileResponse[]>(`/api/v1/hr/employees?${searchParams}`);
  },
  employee: (id: number): Promise<EmployeeProfileResponse> => apiFetch<EmployeeProfileResponse>(`/api/v1/hr/employees/${id}`),
  createEmployee: (data: any) => apiFetch("/api/v1/hr/employees", { method: "POST", body: JSON.stringify(data) }),
  pendingPayouts: (limit = 50): Promise<PayoutResponse[]> => apiFetch<PayoutResponse[]>(`/api/v1/hr/payouts/pending?limit=${limit}`),
  calculatePayout: (data: { employee_id: number; period_start: string; period_end: string }) =>
    apiFetch<PayoutResponse>("/api/v1/hr/payouts/calculate", { method: "POST", body: JSON.stringify(data) }),
  approvePayout: (payoutId: number, data: { approved: boolean; notes?: string }) =>
    apiFetch<PayoutResponse>(`/api/v1/hr/payouts/${payoutId}/approve`, { method: "POST", body: JSON.stringify(data) }),

  toggleStatus: (userId: number) => apiFetch(`/api/v1/hr/employees/${userId}/toggle-status`, { method: "PATCH" }),

  // Rate Cards
  rateCards: (employeeId: number, activeOnly = true) =>
    apiFetch<RateCardResponse[]>(`/api/v1/hr/rate-cards/${employeeId}?active_only=${activeOnly}`),
  createRateCard: (data: RateCardCreate) =>
    apiFetch<RateCardResponse>("/api/v1/hr/rate-cards", { method: "POST", body: JSON.stringify(data) }),

  // Payouts
  employeePayouts: (employeeId: number, limit = 10) =>
    apiFetch<PayoutResponse[]>(`/api/v1/hr/payouts/employee/${employeeId}?limit=${limit}`),
  markPayoutPaid: (payoutId: number, method: string, reference: string) =>
    apiFetch<PayoutResponse>(`/api/v1/hr/payouts/${payoutId}/mark-paid?payment_method=${method}&payment_reference=${reference}`, { method: "POST" }),

  // Complaints
  recordComplaint: (data: ComplaintCreate) =>
    apiFetch<ComplaintResponse>("/api/v1/hr/complaints", { method: "POST", body: JSON.stringify(data) }),
  listComplaints: (employeeId?: number) =>
    apiFetch<ComplaintResponse[]>(`/api/v1/hr/complaints${employeeId ? `?employee_id=${employeeId}` : ''}`),
  pendingComplaints: (limit = 50) =>
    apiFetch<ComplaintResponse[]>(`/api/v1/hr/complaints/pending?limit=${limit}`),
  investigateComplaint: (complaintId: number, isValid: boolean, notes: string, resolution?: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append("is_valid", String(isValid));
    searchParams.append("investigation_notes", notes);
    if (resolution) searchParams.append("resolution", resolution);
    return apiFetch<ComplaintResponse>(`/api/v1/hr/complaints/${complaintId}/investigate?${searchParams}`, { method: "POST" });
  },

  // Attendance
  recordAttendance: (data: any) =>
    apiFetch("/api/v1/hr/attendance", { method: "POST", body: JSON.stringify(data) }),
  getAttendance: (employeeId: number, startDate: string, endDate: string) =>
    apiFetch<any[]>(`/api/v1/hr/attendance/${employeeId}?start_date=${startDate}&end_date=${endDate}`),

  // Reports
  payrollSummary: (periodStart: string, periodEnd: string) =>
    apiFetch(`/api/v1/hr/reports/payroll-summary?period_start=${periodStart}&period_end=${periodEnd}`),
  employeePerformance: (employeeId: number, periodStart: string, periodEnd: string) =>
    apiFetch(`/api/v1/hr/reports/employee-performance/${employeeId}?period_start=${periodStart}&period_end=${periodEnd}`),
};

// Technicians endpoints
export const techniciansApi = {
  performance: (technicianId: number, periodStart: string, periodEnd: string) =>
    apiFetch<TechnicianKPI>(`/api/v1/technicians/${technicianId}/performance?period_start=${periodStart}&period_end=${periodEnd}`),
  leaderboard: (periodStart: string, limit = 10) =>
    apiFetch<TechnicianKPI[]>(`/api/v1/technicians/leaderboard?period_start=${periodStart}&limit=${limit}`),
  altitude: (technicianId: number) => apiFetch(`/api/v1/technicians/${technicianId}/altitude`),
  recordSatisfaction: (data: { task_id: number; rating: number; feedback?: string }) =>
    apiFetch("/api/v1/technicians/satisfaction", { method: "POST", body: JSON.stringify(data) }),
  listSatisfaction: (params?: { technician_id?: number; task_id?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.technician_id) searchParams.append("technician_id", String(params.technician_id));
    if (params?.task_id) searchParams.append("task_id", String(params.task_id));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    return apiFetch<CustomerSatisfaction[]>(`/api/v1/technicians/satisfaction?${searchParams}`);
  },
};

// CRM endpoints
export const crmApi = {
  leads: () => apiFetch("/api/v1/crm/leads"),
  lead: (id: number) => apiFetch(`/api/v1/crm/leads/${id}`),
  createLead: (data: any) => apiFetch("/api/v1/crm/leads", { method: "POST", body: JSON.stringify(data) }),
  updateLead: (id: number, data: any) => apiFetch(`/api/v1/crm/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deals: () => apiFetch("/api/v1/crm/deals"),
  createDeal: (data: any) => apiFetch("/api/v1/crm/deals", { method: "POST", body: JSON.stringify(data) }),
  activities: () => apiFetch("/api/v1/crm/activities"),
  logActivity: (data: any) => apiFetch("/api/v1/crm/activities", { method: "POST", body: JSON.stringify(data) }),
};

// Dashboard endpoints
export const dashboardApi = {
  projectsOverview: async () => {
    return apiFetch("/api/v1/dashboards/projects-overview");
  },
  taskAllocation: async () => {
    return apiFetch("/api/v1/dashboards/task-allocation");
  },
  budgetTracking: async () => {
    return apiFetch("/api/v1/dashboards/budget-tracking");
  },
  teamWorkload: async () => {
    return apiFetch("/api/v1/dashboards/team-workload");
  },
  departmentOverview: (departmentId: number) => apiFetch(`/api/v1/dashboards/department/${departmentId}/overview`),
};

// Workflow endpoints
export const workflowApi = {
  list: (): Promise<WorkflowDefinitionRead[]> => apiFetch<WorkflowDefinitionRead[]>("/api/v1/workflow/"),
  myApprovals: (): Promise<WorkflowInstanceRead[]> => apiFetch<WorkflowInstanceRead[]>("/api/v1/workflow/my-approvals"),
  start: (data: { workflow_id: number; related_model: string; related_id: number; initiated_by: number }) =>
    apiFetch<WorkflowInstanceRead>("/api/v1/workflow/start", { method: "POST", body: JSON.stringify(data) }),
  approve: (instanceId: number, comment?: string) =>
    apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/${instanceId}/approve?comment=${encodeURIComponent(comment || "")}`, { method: "POST" }),
  reject: (instanceId: number, comment?: string) =>
    apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/${instanceId}/reject?comment=${encodeURIComponent(comment || "")}`, { method: "POST" }),

  get: (id: number) => apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}`),
  delete: (id: number) => apiFetch(`/api/v1/workflow/${id}`, { method: "DELETE" }),

  createGraph: (data: WorkflowGraphCreate) =>
    apiFetch<WorkflowDefinitionRead>("/api/v1/workflow/graph", { method: "POST", body: JSON.stringify(data) }),
  updateGraph: (id: number, data: WorkflowGraphCreate) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}/graph`, { method: "PUT", body: JSON.stringify(data) }),

  publish: (id: number) => apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}/publish`, { method: "POST" }),
  clone: (id: number, newName: string) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}/clone?new_name=${encodeURIComponent(newName)}`, { method: "POST" }),

  performAction: (instanceId: number, action: string, comment?: string) =>
    apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/instances/${instanceId}/actions?action=${action}${comment ? `&comment=${encodeURIComponent(comment)}` : ''}`, { method: "POST" }),

  stats: () => apiFetch("/api/v1/workflow/stats"),
  comment: (instanceId: number, comment: string) =>
    apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/${instanceId}/comment?comment=${encodeURIComponent(comment)}`, { method: "POST" }),
  pending: () => apiFetch<WorkflowInstanceRead[]>("/api/v1/workflow/pending"),
};

// Audit endpoints
export const auditApi = {
  logs: (params?: { skip?: number; limit?: number; action?: string; resource?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append("skip", String(params.skip));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.action) searchParams.append("action", params.action);
    if (params?.resource) searchParams.append("resource", params.resource);
    return apiFetch(`/api/v1/audit/?${searchParams}`);
  },
  stats: (days = 7) => apiFetch(`/api/v1/audit/stats?days=${days}`),
  export: (format = "csv", days = 30) => apiFetch(`/api/v1/audit/export?format=${format}&days=${days}`),
};

// RBAC endpoints
export const rbacApi = {
  checkPermission: async (permission: string) => {
    return apiFetch(`/api/v1/rbac/check?permission=${encodeURIComponent(permission)}`);
  },
  checkBatch: async (permissions: string[]) => {
    return apiFetch("/api/v1/rbac/check-batch", { method: "POST", body: JSON.stringify({ permissions }) });
  },
  myPermissions: async () => {
    return apiFetch("/api/v1/rbac/my-permissions");
  },
};

// Health check endpoints
export interface HealthStatus {
  status: "healthy" | "unhealthy" | "checking";
  latency?: number;
  timestamp?: string;
  error?: string;
}

export const healthApi = {
  check: async (): Promise<HealthStatus> => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (response.ok) {
        return {
          status: "healthy",
          latency,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          status: "unhealthy",
          latency,
          timestamp: new Date().toISOString(),
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      return {
        status: "unhealthy",
        latency: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Connection failed",
      };
    }
  },

  ping: async (): Promise<{ reachable: boolean; latency: number }> => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/api/v1/`, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return { reachable: true, latency: Date.now() - startTime };
    } catch {
      return { reachable: false, latency: Date.now() - startTime };
    }
  },
};
