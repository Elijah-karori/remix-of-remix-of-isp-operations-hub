import { QueryClient } from "@tanstack/react-query";

export const API_BASE_URL = "https://erp.gygaview.co.ke";

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

// API fetch wrapper
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
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string) => {
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
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    setAccessToken(data.access_token);
    return data;
  },

  register: async (data: { email: string; full_name: string; phone: string; password: string }) => {
    return apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me: async () => apiFetch("/api/v1/auth/me"),

  logout: () => setAccessToken(null),
};

// Projects endpoints
export const projectsApi = {
  list: (params?: { status?: string; infrastructure_type?: string; department_id?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.infrastructure_type) searchParams.append("infrastructure_type", params.infrastructure_type);
    if (params?.department_id) searchParams.append("department_id", String(params.department_id));
    return apiFetch(`/api/v1/projects/?${searchParams}`);
  },
  get: (id: number) => apiFetch(`/api/v1/projects/${id}`),
  create: (data: any) => apiFetch("/api/v1/projects/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiFetch(`/api/v1/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// Tasks endpoints
export const tasksApi = {
  list: () => apiFetch("/api/v1/tasks/"),
  myAssignments: () => apiFetch("/api/v1/tasks/my-assignments"),
  get: (id: number) => apiFetch(`/api/v1/tasks/${id}`),
  create: (data: any) => apiFetch("/api/v1/tasks/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiFetch(`/api/v1/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  logHours: (id: number, hours: number, notes?: string) =>
    apiFetch(`/api/v1/tasks/${id}/hours`, { method: "PUT", body: JSON.stringify({ task_id: id, hours, notes }) }),
};

// Finance endpoints
export const financeApi = {
  snapshot: () => apiFetch("/api/v1/finance/snapshot"),
  projectBudget: (projectId: number) => apiFetch(`/api/v1/projects/${projectId}/budget`),
  budgetSummary: (projectId: number) => apiFetch(`/api/v1/projects/${projectId}/budget/summary`),
  createBudget: (projectId: number, data: any) =>
    apiFetch(`/api/v1/projects/${projectId}/budget`, { method: "POST", body: JSON.stringify(data) }),
  pendingVariances: (limit = 50) => apiFetch(`/api/v1/finance/variances/pending?limit=${limit}`),
  approveVariance: (varianceId: number, data: { approved: boolean; approver_id: number; notes?: string }) =>
    apiFetch(`/api/v1/finance/variances/${varianceId}/approve`, { method: "POST", body: JSON.stringify(data) }),
  generateInvoice: (data: any) => apiFetch("/api/v1/finance/invoices/generate", { method: "POST", body: JSON.stringify(data) }),
  processPayment: (data: any) => apiFetch("/api/v1/finance/payments/process", { method: "POST", body: JSON.stringify(data) }),
  overdueInvoices: (daysOverdue = 30) => apiFetch(`/api/v1/finance/payments/overdue?days_overdue=${daysOverdue}`),
  projectProfitability: (projectId: number) => apiFetch(`/api/v1/finance/projects/${projectId}/profitability`),
  infrastructureAnalytics: (startDate: string, endDate: string) =>
    apiFetch(`/api/v1/finance/analytics/infrastructure-profitability?start_date=${startDate}&end_date=${endDate}`),
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
  products: () => apiFetch("/api/v1/inventory/products"),
  product: (id: number) => apiFetch(`/api/v1/inventory/products/${id}`),
  createProduct: (data: any) => apiFetch("/api/v1/inventory/products", { method: "POST", body: JSON.stringify(data) }),
  suppliers: (activeOnly = true) => apiFetch(`/api/v1/inventory/suppliers?active_only=${activeOnly}`),
  lowStock: (thresholdMultiplier = 1.5) => apiFetch(`/api/v1/inventory/low-stock?threshold_multiplier=${thresholdMultiplier}`),
  searchProducts: (query: string, useScrapers = false, maxResults = 50) =>
    apiFetch(`/api/v1/products/search?q=${encodeURIComponent(query)}&use_scrapers=${useScrapers}&max_results=${maxResults}`),
  comparePrices: (productName: string, quantity: number) =>
    apiFetch("/api/v1/products/compare-prices", { method: "POST", body: JSON.stringify({ product_name: productName, quantity }) }),
};

// HR endpoints
export const hrApi = {
  employees: (params?: { engagement_type?: string; is_active?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.engagement_type) searchParams.append("engagement_type", params.engagement_type);
    if (params?.is_active !== undefined) searchParams.append("is_active", String(params.is_active));
    return apiFetch(`/api/v1/hr/employees?${searchParams}`);
  },
  employee: (id: number) => apiFetch(`/api/v1/hr/employees/${id}`),
  createEmployee: (data: any) => apiFetch("/api/v1/hr/employees", { method: "POST", body: JSON.stringify(data) }),
  pendingPayouts: (limit = 50) => apiFetch(`/api/v1/hr/payouts/pending?limit=${limit}`),
  calculatePayout: (data: { employee_id: number; period_start: string; period_end: string }) =>
    apiFetch("/api/v1/hr/payouts/calculate", { method: "POST", body: JSON.stringify(data) }),
  approvePayout: (payoutId: number, data: { approved: boolean; notes?: string }) =>
    apiFetch(`/api/v1/hr/payouts/${payoutId}/approve`, { method: "POST", body: JSON.stringify(data) }),
};

// Technicians endpoints
export const techniciansApi = {
  performance: (technicianId: number, periodStart: string, periodEnd: string) =>
    apiFetch(`/api/v1/technicians/${technicianId}/performance?period_start=${periodStart}&period_end=${periodEnd}`),
  leaderboard: (periodStart: string, limit = 10) =>
    apiFetch(`/api/v1/technicians/leaderboard?period_start=${periodStart}&limit=${limit}`),
  altitude: (technicianId: number) => apiFetch(`/api/v1/technicians/${technicianId}/altitude`),
  recordSatisfaction: (data: { task_id: number; rating: number; feedback?: string }) =>
    apiFetch("/api/v1/technicians/satisfaction", { method: "POST", body: JSON.stringify(data) }),
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
  projectsOverview: () => apiFetch("/api/v1/dashboards/projects-overview"),
  taskAllocation: () => apiFetch("/api/v1/dashboards/task-allocation"),
  budgetTracking: () => apiFetch("/api/v1/dashboards/budget-tracking"),
  teamWorkload: () => apiFetch("/api/v1/dashboards/team-workload"),
  departmentOverview: (departmentId: number) => apiFetch(`/api/v1/dashboards/department/${departmentId}/overview`),
};

// Workflow endpoints
export const workflowApi = {
  list: () => apiFetch("/api/v1/workflow/"),
  myApprovals: () => apiFetch("/api/v1/workflow/my-approvals"),
  start: (data: { workflow_id: number; related_model: string; related_id: number; initiated_by: number }) =>
    apiFetch("/api/v1/workflow/start", { method: "POST", body: JSON.stringify(data) }),
  approve: (instanceId: number, comment?: string) =>
    apiFetch(`/api/v1/workflow/${instanceId}/approve?comment=${encodeURIComponent(comment || "")}`, { method: "POST" }),
  reject: (instanceId: number, comment?: string) =>
    apiFetch(`/api/v1/workflow/${instanceId}/reject?comment=${encodeURIComponent(comment || "")}`, { method: "POST" }),
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
  checkPermission: (permission: string) => apiFetch(`/api/v1/rbac/check?permission=${encodeURIComponent(permission)}`),
  checkBatch: (permissions: string[]) =>
    apiFetch("/api/v1/rbac/check-batch", { method: "POST", body: JSON.stringify({ permissions }) }),
  myPermissions: () => apiFetch("/api/v1/rbac/my-permissions"),
};
