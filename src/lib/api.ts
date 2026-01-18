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
  FinancialAccountCreate,
  FinancialAccountUpdate,
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
  ScraperRun,
  PriceHistory,
  RoleHierarchyOut,
  IndependentRoleOut,
  FuzzyMatchResult,
  AccessPolicyOut,
  FeaturePolicyRequest,
  UserStatus,
  UserStatusUpdateRequest,
  MpesaTransactionOut,
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
  Lead,
  LeadCreate,
  LeadUpdate,
  Deal,
  DealCreate,
  DealUpdate,
  Activity,
  ActivityCreate,
  ActivityUpdate,
  FinancialSnapshotResponse,
  PermissionCheckResponse,
  MyPermissionsResponse
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
interface ApiFetchConfig {
  handle401?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  config: ApiFetchConfig = { handle401: true }
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
    if (response.status === 401 && config.handle401) {
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
    const searchParams = new URLSearchParams();
    searchParams.append("email", email);
    searchParams.append("otp", otp);

    const response = await apiFetch<Token>(`/api/v1/auth/register/otp/verify?${searchParams.toString()}`, {
      method: "POST",
    }, { handle401: false });
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
    const searchParams = new URLSearchParams();
    searchParams.append("email", email);
    searchParams.append("otp", otp);

    const response = await apiFetch<Token>(`/api/v1/auth/passwordless/verify-otp?${searchParams.toString()}`, {
      method: "POST",
    }, { handle401: false });
    setAccessToken(response.access_token);
    return response;
  },

  verifyMagicLink: async (token: string) => {
    setAccessToken(token);
    try {
      await authApi.me();
      return { access_token: token, token_type: "bearer" };
    } catch (error) {
      setAccessToken(null);
      throw error;
    }
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

  setPassword: async (newPassword: string, confirmPassword: string) => {
    return apiFetch("/api/v1/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword }),
    });
  },

  logout: () => setAccessToken(null),
};

// Users endpoints
export const usersApi = {
  list: (): Promise<{ users: UserOut[] }> =>
    apiFetch("/api/v1/users/"),

  get: (userId: number): Promise<UserOut> =>
    apiFetch(`/api/v1/users/${userId}`),

  create: (data: UserCreate): Promise<UserOut> =>
    apiFetch("/api/v1/users/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  update: (userId: number, data: UserUpdate): Promise<UserOut> =>
    apiFetch(`/api/v1/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  softDelete: (userId: number) =>
    apiFetch(`/api/v1/users/${userId}`, { method: "DELETE" }),

  restore: (userId: number) =>
    apiFetch(`/api/v1/users/${userId}/restore`, { method: "POST" }),
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

  delete: (id: number) =>
    apiFetch(`/api/v1/projects/${id}`, { method: "DELETE" }),

  getByDepartment: (departmentId: number): Promise<ProjectOut[]> =>
    apiFetch<ProjectOut[]>(`/api/v1/projects/by-department/${departmentId}`),

  // Milestones
  createMilestone: (projectId: number, data: any) =>
    apiFetch(`/api/v1/projects/${projectId}/milestones`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getMilestones: (projectId: number) =>
    apiFetch(`/api/v1/projects/${projectId}/milestones`),

  updateMilestone: (milestoneId: number, data: any) =>
    apiFetch(`/api/v1/projects/milestones/${milestoneId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  // Budget
  createBudget: (projectId: number, data: any) =>
    apiFetch(`/api/v1/projects/${projectId}/budget`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getBudget: (projectId: number) =>
    apiFetch(`/api/v1/projects/${projectId}/budget`),

  getBudgetSummary: (projectId: number): Promise<BudgetSummary> =>
    apiFetch<BudgetSummary>(`/api/v1/projects/${projectId}/budget/summary`),

  // Team
  getTeam: (projectId: number) =>
    apiFetch(`/api/v1/projects/${projectId}/team`),
};

// Tasks endpoints
export const tasksApi = {
  list: async (params?: {
    project_id?: number;
    status?: string;
    assigned_role?: string;
    department_id?: number;
    priority?: string;
  }): Promise<TaskOut[]> => {
    const searchParams = new URLSearchParams();
    if (params?.project_id) searchParams.append("project_id", String(params.project_id));
    if (params?.status) searchParams.append("status", params.status);
    if (params?.assigned_role) searchParams.append("assigned_role", params.assigned_role);
    if (params?.department_id) searchParams.append("department_id", String(params.department_id));
    if (params?.priority) searchParams.append("priority", params.priority);
    return apiFetch<TaskOut[]>(`/api/v1/tasks/?${searchParams}`);
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

  assignByRole: (data: { task_id: number; role: string; department_id?: number }) =>
    apiFetch("/api/v1/tasks/assign-by-role", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  logHours: (id: number, hours: number, notes?: string): Promise<TaskOut> =>
    apiFetch<TaskOut>(`/api/v1/tasks/${id}/hours`, {
      method: "PUT",
      body: JSON.stringify({ task_id: id, hours, notes })
    }),

  getByDepartment: (departmentId: number): Promise<TaskOut[]> =>
    apiFetch<TaskOut[]>(`/api/v1/tasks/by-department/${departmentId}`),

  // Dependencies
  addDependency: (taskId: number, dependsOnTaskId: number, dependencyType = "finish_to_start") =>
    apiFetch(`/api/v1/tasks/${taskId}/dependencies?depends_on_task_id=${dependsOnTaskId}&dependency_type=${dependencyType}`, {
      method: "POST"
    }),

  getDependencies: (taskId: number) =>
    apiFetch(`/api/v1/tasks/${taskId}/dependencies`),
};

// Inventory endpoints
export const inventoryApi = {
  // Products
  products: async (params?: {
    category?: string;
    supplier_id?: number;
    low_stock?: boolean;
    is_empty_products?: boolean;
    search?: string;
    sort_by?: string;
    order?: "asc" | "desc";
  }): Promise<Product[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.supplier_id) searchParams.append("supplier_id", String(params.supplier_id));
    if (params?.low_stock !== undefined) searchParams.append("low_stock", String(params.low_stock));
    if (params?.is_empty_products !== undefined) searchParams.append("is_empty_products", String(params.is_empty_products));
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sort_by) searchParams.append("sort_by", params.sort_by);
    if (params?.order) searchParams.append("order", params.order);
    return apiFetch<Product[]>(`/api/v1/inventory/products?${searchParams}`);
  },

  product: async (id: number): Promise<Product> => {
    return apiFetch<Product>(`/api/v1/inventory/products/${id}`);
  },

  createProduct: (data: ProductCreate): Promise<Product> =>
    apiFetch<Product>("/api/v1/inventory/products", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateProduct: (id: number, data: any): Promise<Product> =>
    apiFetch<Product>(`/api/v1/inventory/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),

  uploadProductImage: async (productId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${API_BASE_URL}/api/v1/inventory/products/${productId}/image`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
      body: formData,
    }).then(r => r.json());
  },

  getProductImage: (productId: number) =>
    apiFetch(`/api/v1/inventory/products/${productId}/image`),

  syncFromClickup: (taskId: string) =>
    apiFetch(`/api/v1/inventory/products/sync-clickup/${taskId}`, { method: "POST" }),

  // Suppliers
  suppliers: async (activeOnly = true): Promise<Supplier[]> => {
    return apiFetch<Supplier[]>(`/api/v1/inventory/suppliers?active_only=${activeOnly}`);
  },

  createSupplier: (data: any): Promise<Supplier> =>
    apiFetch<Supplier>("/api/v1/inventory/suppliers", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateSupplier: (id: number, data: any): Promise<Supplier> =>
    apiFetch<Supplier>(`/api/v1/inventory/suppliers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),

  // Stock Management
  lowStock: async (thresholdMultiplier = 1.0) => {
    return apiFetch(`/api/v1/inventory/low-stock?threshold_multiplier=${thresholdMultiplier}`);
  },

  reorderPredictions: () =>
    apiFetch("/api/v1/inventory/reorder-predictions"),

  reorderPrediction: (productId: number) =>
    apiFetch(`/api/v1/inventory/${productId}/reorder-prediction`),

  optimizeStockLevels: (productId: number, targetServiceLevel = 0.95) =>
    apiFetch(`/api/v1/inventory/${productId}/optimize-levels?target_service_level=${targetServiceLevel}`),

  turnoverAnalysis: (days = 90) =>
    apiFetch(`/api/v1/inventory/turnover-analysis?days=${days}`),

  deadStock: (daysThreshold = 90) =>
    apiFetch(`/api/v1/inventory/dead-stock?days_threshold=${daysThreshold}`),

  autoReorder: (productId: number, data: any) =>
    apiFetch(`/api/v1/inventory/${productId}/auto-reorder`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  valuation: () =>
    apiFetch("/api/v1/inventory/valuation"),
};

// Product Search & Procurement
export const productsApi = {
  search: (query: string, useScrapers = false, maxResults = 50) =>
    apiFetch(`/api/v1/products/search?q=${encodeURIComponent(query)}&use_scrapers=${useScrapers}&max_results=${maxResults}`),

  comparePrices: (productName: string, quantity = 1, minStock?: number) =>
    apiFetch("/api/v1/products/compare-prices", {
      method: "POST",
      body: JSON.stringify({ product_name: productName, quantity, min_stock: minStock })
    }),

  bestSupplier: (productId: number, quantity = 1) =>
    apiFetch(`/api/v1/products/${productId}/best-supplier?quantity=${quantity}`),

  alternatives: (productId: number, maxResults = 10) =>
    apiFetch(`/api/v1/products/${productId}/alternatives?max_results=${maxResults}`),

  checkAvailability: (productId: number, useScraper = false) =>
    apiFetch(`/api/v1/products/${productId}/availability?use_scraper=${useScraper}`),
};

// Procurement endpoints
export const procurementApi = {
  // Purchase Orders
  createOrder: (data: any) =>
    apiFetch("/api/v1/procurement/orders", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  approveOrder: (purchaseId: number, approved: boolean, notes?: string) =>
    apiFetch(`/api/v1/procurement/orders/${purchaseId}/approve?approved=${approved}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`, {
      method: "POST"
    }),

  pendingOrders: () =>
    apiFetch("/api/v1/procurement/orders/pending"),

  // Smart Procurement
  createSmartOrder: (data: any) =>
    apiFetch("/api/v1/procurement/smart-order", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  createBulkOrder: (data: any) =>
    apiFetch("/api/v1/procurement/bulk-order", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Analytics
  priceHistory: (productId: number, days = 90) =>
    apiFetch(`/api/v1/procurement/price-history/${productId}?days=${days}`),

  alternativeSuppliers: (productId: number, currentSupplierId: number) =>
    apiFetch(`/api/v1/procurement/alternative-suppliers/${productId}?current_supplier_id=${currentSupplierId}`),

  calculateCost: (supplierId: number, items: any[], includeShipping = true, includeTax = true) =>
    apiFetch(`/api/v1/procurement/calculate-cost?supplier_id=${supplierId}&include_shipping=${includeShipping}&include_tax=${includeTax}`, {
      method: "POST",
      body: JSON.stringify(items)
    }),

  spendingTrends: (days = 90, groupBy = "supplier") =>
    apiFetch(`/api/v1/procurement/spending-trends?days=${days}&group_by=${groupBy}`),

  // Legacy
  create: (data: any) =>
    apiFetch("/api/v1/procurement/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  approve: (purchaseId: number, approve: boolean, comment?: string) =>
    apiFetch(`/api/v1/procurement/${purchaseId}/approve?approve=${approve}${comment ? `&comment=${encodeURIComponent(comment)}` : ''}`, {
      method: "POST"
    }),

  markOrdered: (purchaseId: number) =>
    apiFetch(`/api/v1/procurement/${purchaseId}/mark-ordered`, { method: "POST" }),
};

// Scrapers endpoints
export const scrapersApi = {
  triggerScraper: (supplierId: number) =>
    apiFetch<ScraperRun>(`/api/v1/scrapers/suppliers/${supplierId}/scrape`, {
      method: "POST"
    }),

  scrapeGeneric: (url: string, category = "Generic", supplierId = 0) =>
    apiFetch("/api/v1/scrapers/scrape-generic", {
      method: "POST",
      body: JSON.stringify({ url, category, supplier_id: supplierId })
    }),

  scrapeAll: () =>
    apiFetch("/api/v1/scrapers/scrape-all", { method: "POST" }),

  priceHistory: (productId: number, limit = 100) =>
    apiFetch<PriceHistory[]>(`/api/v1/scrapers/price-history/${productId}?limit=${limit}`),

  recentPriceDrops: (days = 7, minDropPercent = 5.0) =>
    apiFetch(`/api/v1/scrapers/price-drops?days=${days}&min_drop_percent=${minDropPercent}`),
};

// Finance endpoints
export const financeApi = {
  // Snapshot & Overview
  snapshot: (): Promise<FinancialSnapshotResponse> =>
    apiFetch<FinancialSnapshotResponse>("/api/v1/finance/snapshot"),

  // Budget Template
  downloadBudgetTemplate: (projectName = "New Project") =>
    apiFetch(`/api/v1/finance/budget-template?project_name=${encodeURIComponent(projectName)}`),

  uploadBudget: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${API_BASE_URL}/api/v1/finance/upload-budget/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
      body: formData,
    }).then(r => r.json());
  },

  // Financial Accounts
  financialAccounts: (skip = 0, limit = 100): Promise<FinancialAccount[]> => // Updated signature for pagination
    apiFetch<FinancialAccount[]>(`/api/v1/finance/financial-accounts/?skip=${skip}&limit=${limit}`),

  getFinancialAccount: (id: number): Promise<FinancialAccount> => // Updated return type
    apiFetch<FinancialAccount>(`/api/v1/finance/financial-accounts/${id}`),

  createFinancialAccount: (data: FinancialAccountCreate): Promise<FinancialAccount> => // Updated signature
    apiFetch<FinancialAccount>("/api/v1/finance/financial-accounts/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateFinancialAccount: (id: number, data: FinancialAccountUpdate): Promise<FinancialAccount> => // New method
    apiFetch<FinancialAccount>(`/api/v1/finance/financial-accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteFinancialAccount: (id: number) => // New method
    apiFetch(`/api/v1/finance/financial-accounts/${id}`, {
      method: "DELETE",
    }),
  // Master Budgets // New section
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
  getSubBudgets: (masterBudgetId: number, skip = 0, limit = 100): Promise<SubBudget[]> => // Updated signature
    apiFetch<SubBudget[]>(`/api/v1/finance/master-budgets/${masterBudgetId}/sub-budgets?skip=${skip}&limit=${limit}`),

  createSubBudget: (masterBudgetId: number, data: SubBudgetCreate): Promise<SubBudget> => // Updated signature
    apiFetch<SubBudget>(`/api/v1/finance/master-budgets/${masterBudgetId}/sub-budgets/`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getSubBudget: (subBudgetId: number): Promise<SubBudget> => // Updated signature
    apiFetch<SubBudget>(`/api/v1/finance/sub-budgets/${subBudgetId}`),

  updateSubBudget: (subBudgetId: number, data: SubBudgetUpdate): Promise<SubBudget> => // New method
    apiFetch<SubBudget>(`/api/v1/finance/sub-budgets/${subBudgetId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteSubBudget: (subBudgetId: number) => // New method
    apiFetch(`/api/v1/finance/sub-budgets/${subBudgetId}`, {
      method: "DELETE",
    }),

  // Budget Usage
  createBudgetUsage: (data: BudgetUsageCreate): Promise<BudgetUsage> => // Updated signature
    apiFetch<BudgetUsage>("/api/v1/finance/budget-usages/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  approveBudgetUsage: (usageId: number, data: { approved: boolean; notes?: string }): Promise<BudgetUsage> => // Updated signature
    apiFetch<BudgetUsage>(`/api/v1/finance/budget-usages/${usageId}/approve`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateBudgetUsage: (usageId: number, data: BudgetUsageUpdate): Promise<BudgetUsage> => // New method
    apiFetch<BudgetUsage>(`/api/v1/finance/budget-usages/${usageId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteBudgetUsage: (usageId: number) => // New method
    apiFetch(`/api/v1/finance/budget-usages/${usageId}`, {
      method: "DELETE",
    }),

  getBudgetUsages: (subBudgetId: number, skip = 0, limit = 100): Promise<BudgetUsage[]> => // Updated signature
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

  generateInvoice: (data: InvoiceCreate): Promise<Invoice> => // Updated signature
    apiFetch<Invoice>("/api/v1/finance/invoices/generate", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateInvoice: (id: number, data: InvoiceUpdate): Promise<Invoice> => // New method
    apiFetch<Invoice>(`/api/v1/finance/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteInvoice: (id: number) => // New method
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

  overdueInvoices: (daysOverdue = 0): Promise<Invoice[]> => // Updated return type
    apiFetch<Invoice[]>(`/api/v1/finance/payments/overdue?days_overdue=${daysOverdue}`),

  // Analytics
  infrastructureProfitability: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    return apiFetch(`/api/v1/finance/analytics/infrastructure-profitability?${params}`);
  },

  budgetAllocationRecommendation: (totalBudget: number, periodMonths = 12) =>
    apiFetch(`/api/v1/finance/analytics/budget-allocation?total_budget=${totalBudget}&period_months=${periodMonths}`),

  generateProfitabilityReport: (data: { start_date: string; end_date: string }) =>
    apiFetch<ProfitabilityReportResponse>("/api/v1/finance/analytics/profitability-report", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  monthlyProfit: (year: number, month: number) =>
    apiFetch(`/api/v1/finance/analytics/monthly-profit/${year}/${month}`),

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

// M-Pesa endpoints
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

  // Ratiba (Standing Orders)
  createRatiba: (data: {
    name: string;
    amount: number;
    phone_number: string;
    start_date: string;
    end_date: string;
    frequency: string;
  }) =>
    apiFetch("/api/v1/finance/mpesa/ratiba/create", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Utility
  checkBalance: () =>
    apiFetch("/api/v1/finance/mpesa/balance"),

  checkTransactionStatus: (transactionId: string) =>
    apiFetch("/api/v1/finance/mpesa/transaction/status", {
      method: "POST",
      body: JSON.stringify({ transaction_id: transactionId })
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
  reconcile: (startDate: string, endDate: string) =>
    apiFetch("/api/v1/finance/mpesa/reconcile", {
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

// HR endpoints
export const hrApi = {
  // Employees
  employees: (params?: { engagement_type?: string; is_active?: boolean; skip?: number; limit?: number }): Promise<EmployeeProfileResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params?.engagement_type) searchParams.append("engagement_type", params.engagement_type);
    if (params?.is_active !== undefined) searchParams.append("is_active", String(params.is_active));
    if (params?.skip !== undefined) searchParams.append("skip", String(params.skip));
    if (params?.limit !== undefined) searchParams.append("limit", String(params.limit));
    return apiFetch<EmployeeProfileResponse[]>(`/api/v1/hr/employees?${searchParams}`);
  },

  employee: (id: number): Promise<EmployeeProfileResponse> =>
    apiFetch<EmployeeProfileResponse>(`/api/v1/hr/employees/${id}`),

  createEmployee: (data: any) =>
    apiFetch<EmployeeProfileResponse>("/api/v1/hr/employees", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  toggleEmployeeStatus: (userId: number) =>
    apiFetch(`/api/v1/hr/employees/${userId}/toggle-status`, { method: "PATCH" }),

  // Workflow Approvals
  approveWorkflow: (instanceId: number, comment?: string) =>
    apiFetch(`/api/v1/hr/workflow/${instanceId}/approve`, {
      method: "POST",
      body: JSON.stringify({ comment })
    }),

  // Rate Cards
  rateCards: (employeeId: number, activeOnly = true) =>
    apiFetch<RateCardResponse[]>(`/api/v1/hr/rate-cards/${employeeId}?active_only=${activeOnly}`),

  createRateCard: (data: RateCardCreate) =>
    apiFetch<RateCardResponse>("/api/v1/hr/rate-cards", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Payouts
  calculatePayout: (data: { employee_id: number; period_start: string; period_end: string; task_id?: number; user_id?: number }) =>
    apiFetch<PayoutResponse>("/api/v1/hr/payouts/calculate", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  pendingPayouts: (limit = 50): Promise<PayoutResponse[]> =>
    apiFetch<PayoutResponse[]>(`/api/v1/hr/payouts/pending?limit=${limit}`),

  employeePayouts: (employeeId: number, limit = 10) =>
    apiFetch<PayoutResponse[]>(`/api/v1/hr/payouts/employee/${employeeId}?limit=${limit}`),

  approvePayout: (payoutId: number, data: { approved: boolean; notes?: string }) =>
    apiFetch<PayoutResponse>(`/api/v1/hr/payouts/${payoutId}/approve`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  markPayoutPaid: (payoutId: number, method: string, reference: string) =>
    apiFetch<PayoutResponse>(`/api/v1/hr/payouts/${payoutId}/mark-paid?payment_method=${encodeURIComponent(method)}&payment_reference=${encodeURIComponent(reference)}`, {
      method: "POST"
    }),

  // Complaints
  recordComplaint: (data: ComplaintCreate) =>
    apiFetch<ComplaintResponse>("/api/v1/hr/complaints", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  listComplaints: (employeeId?: number) =>
    apiFetch<ComplaintResponse[]>(`/api/v1/hr/complaints${employeeId ? `?employee_id=${employeeId}` : ''}`),

  pendingComplaints: (limit = 50) =>
    apiFetch<ComplaintResponse[]>(`/api/v1/hr/complaints/pending?limit=${limit}`),

  investigateComplaint: (complaintId: number, isValid: boolean, notes: string, resolution?: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append("is_valid", String(isValid));
    searchParams.append("investigation_notes", notes);
    if (resolution) searchParams.append("resolution", resolution);
    return apiFetch<ComplaintResponse>(`/api/v1/hr/complaints/${complaintId}/investigate?${searchParams}`, {
      method: "POST"
    });
  },

  // Attendance
  recordAttendance: (data: any) =>
    apiFetch("/api/v1/hr/attendance", {
      method: "POST",
      body: JSON.stringify(data)
    }),

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
  performance: (technicianId: number, periodStart?: string, periodEnd?: string) => {
    const params = new URLSearchParams();
    if (periodStart) params.append("period_start", periodStart);
    if (periodEnd) params.append("period_end", periodEnd);
    return apiFetch<TechnicianKPI>(`/api/v1/technicians/${technicianId}/performance?${params}`);
  },

  leaderboard: (periodStart?: string, periodEnd?: string, limit = 10) => {
    const params = new URLSearchParams();
    if (periodStart) params.append("period_start", periodStart);
    if (periodEnd) params.append("period_end", periodEnd);
    params.append("limit", String(limit));
    return apiFetch<TechnicianKPI[]>(`/api/v1/technicians/leaderboard?${params}`);
  },

  altitude: (technicianId: number) =>
    apiFetch(`/api/v1/technicians/${technicianId}/altitude`),

  // Customer Satisfaction
  recordSatisfaction: (data: { task_id: number; rating: number; feedback?: string }) =>
    apiFetch<CustomerSatisfaction>("/api/v1/technicians/satisfaction", {
      method: "POST",
      body: JSON.stringify(data)
    }),

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
  // Leads
  leads: (skip = 0, limit = 100): Promise<Lead[]> =>
    apiFetch<Lead[]>(`/api/v1/crm/leads?skip=${skip}&limit=${limit}`),

  lead: (id: number): Promise<Lead> =>
    apiFetch<Lead>(`/api/v1/crm/leads/${id}`),

  createLead: (data: LeadCreate): Promise<Lead> =>
    apiFetch<Lead>("/api/v1/crm/leads", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateLead: (id: number, data: LeadUpdate): Promise<Lead> =>
    apiFetch<Lead>(`/api/v1/crm/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteLead: (id: number) =>
    apiFetch(`/api/v1/crm/leads/${id}`, {
      method: "DELETE",
    }),

  // Deals
  deals: (skip = 0, limit = 100): Promise<Deal[]> => // Updated signature
    apiFetch<Deal[]>(`/api/v1/crm/deals?skip=${skip}&limit=${limit}`),

  deal: (id: number): Promise<Deal> => // New method
    apiFetch<Deal>(`/api/v1/crm/deals/${id}`),

  createDeal: (data: DealCreate): Promise<Deal> =>
    apiFetch<Deal>("/api/v1/crm/deals", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateDeal: (id: number, data: DealUpdate): Promise<Deal> => // New method
    apiFetch<Deal>(`/api/v1/crm/deals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteDeal: (id: number) => // New method
    apiFetch(`/api/v1/crm/deals/${id}`, {
      method: "DELETE",
    }),

  // Activities
  activities: (skip = 0, limit = 100): Promise<Activity[]> => // Updated signature
    apiFetch<Activity[]>(`/api/v1/crm/activities?skip=${skip}&limit=${limit}`),

  activity: (id: number): Promise<Activity> => // New method
    apiFetch<Activity>(`/api/v1/crm/activities/${id}`),

  logActivity: (data: ActivityCreate): Promise<Activity> =>
    apiFetch<Activity>("/api/v1/crm/activities", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateActivity: (id: number, data: ActivityUpdate): Promise<Activity> => // New method
    apiFetch<Activity>(`/api/v1/crm/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteActivity: (id: number) => // New method
    apiFetch(`/api/v1/crm/activities/${id}`, {
      method: "DELETE",
    }),
};

// Marketing endpoints
export const marketingApi = {
  // Campaigns
  createCampaign: (data: any) =>
    apiFetch("/api/v1/marketing/campaigns", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getCampaignPerformance: (campaignId: number) =>
    apiFetch(`/api/v1/marketing/campaigns/${campaignId}/performance`),

  // Leads
  recordLead: (data: any) =>
    apiFetch("/api/v1/marketing/leads", {
      method: "POST",
      body: JSON.stringify(data)
    }),
};

// Dashboard endpoints
export const dashboardApi = {
  // Main Dashboards
  projectsOverview: () =>
    apiFetch("/api/v1/dashboards/projects-overview"),

  taskAllocation: () =>
    apiFetch("/api/v1/dashboards/task-allocation"),

  budgetTracking: () =>
    apiFetch("/api/v1/dashboards/budget-tracking"),

  teamWorkload: () =>
    apiFetch("/api/v1/dashboards/team-workload"),

  departmentOverview: (departmentId: number) =>
    apiFetch(`/api/v1/dashboards/department/${departmentId}/overview`),

  // Management Dashboards
  adminMetrics: (days = 7) =>
    apiFetch(`/api/v1/management/dashboards/admin/metrics?days=${days}`),

  auditorHeatmap: () =>
    apiFetch("/api/v1/management/dashboards/auditor/heatmap"),

  auditorTrails: (params?: { limit?: number; resource?: string; result?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.resource) searchParams.append("resource", params.resource);
    if (params?.result) searchParams.append("result", params.result);
    return apiFetch(`/api/v1/management/dashboards/auditor/trails?${searchParams}`);
  },

  testerCoverage: () =>
    apiFetch("/api/v1/management/dashboards/tester/coverage"),
};

// Workflow endpoints
export const workflowApi = {
  // Workflow Definitions
  list: (statusFilter?: string): Promise<WorkflowDefinitionRead[]> => {
    const params = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiFetch<WorkflowDefinitionRead[]>(`/api/v1/workflow/${params}`);
  },

  get: (id: number) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}`),

  delete: (id: number) =>
    apiFetch(`/api/v1/workflow/${id}`, { method: "DELETE" }),

  // Graph Operations
  createGraph: (data: WorkflowGraphCreate) =>
    apiFetch<WorkflowDefinitionRead>("/api/v1/workflow/graph", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateGraph: (id: number, data: WorkflowGraphCreate) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}/graph`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  publish: (id: number) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}/publish`, { method: "POST" }),

  clone: (id: number, newName: string) =>
    apiFetch<WorkflowDefinitionRead>(`/api/v1/workflow/${id}/clone?new_name=${encodeURIComponent(newName)}`, {
      method: "POST"
    }),

  // Workflow Instances
  start: (data: { workflow_id: number; related_model: string; related_id: number; initiated_by: number }) =>
    apiFetch<WorkflowInstanceRead>("/api/v1/workflow/start", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  performAction: (instanceId: number, action: string, comment?: string) => {
    const params = comment ? `?action=${action}&comment=${encodeURIComponent(comment)}` : `?action=${action}`;
    return apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/instances/${instanceId}/actions${params}`, {
      method: "POST"
    });
  },

  approve: (instanceId: number, comment?: string) => {
    const params = comment ? `?comment=${encodeURIComponent(comment)}` : '';
    return apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/${instanceId}/approve${params}`, {
      method: "POST"
    });
  },

  reject: (instanceId: number, comment?: string) => {
    const params = comment ? `?comment=${encodeURIComponent(comment)}` : '';
    return apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/${instanceId}/reject${params}`, {
      method: "POST"
    });
  },

  comment: (instanceId: number, comment: string) =>
    apiFetch<WorkflowInstanceRead>(`/api/v1/workflow/${instanceId}/comment?comment=${encodeURIComponent(comment)}`, {
      method: "POST"
    }),

  // Queries
  myApprovals: (): Promise<WorkflowInstanceRead[]> =>
    apiFetch<WorkflowInstanceRead[]>("/api/v1/workflow/my-approvals"),

  pending: () =>
    apiFetch<WorkflowInstanceRead[]>("/api/v1/workflow/pending"),

  stats: () =>
    apiFetch("/api/v1/workflow/stats"),
};

// RBAC endpoints
export const rbacApi = {
  checkPermission: async (permission: string): Promise<PermissionCheckResponse> => {
    return apiFetch<PermissionCheckResponse>(`/api/v1/rbac/check?permission=${encodeURIComponent(permission)}`);
  },

  checkBatch: async (permissions: string[]): Promise<Record<string, boolean>> => {
    return apiFetch<Record<string, boolean>>("/api/v1/rbac/check-batch", {
      method: "POST",
      body: JSON.stringify({ permissions })
    });
  },

  myPermissions: async (): Promise<MyPermissionsResponse> => {
    return apiFetch<MyPermissionsResponse>("/api/v1/rbac/my-permissions");
  },
};

// Management endpoints (RBAC & Policy)
export const managementApi = {
  // RBAC Hierarchy & Roles
  getRoleHierarchy: () =>
    apiFetch<RoleHierarchyOut[]>("/api/v1/management/rbac/roles/tree"),

  getSortedRoles: (sortBy = "name", algorithm = "merge") =>
    apiFetch(`/api/v1/management/rbac/roles/sorted?sort_by=${sortBy}&algorithm=${algorithm}`),

  getSortedUsers: (sortBy = "email", algorithm = "quick") =>
    apiFetch(`/api/v1/management/rbac/users/sorted?sort_by=${sortBy}&algorithm=${algorithm}`),

  activateRole: (roleId: number) =>
    apiFetch(`/api/v1/management/rbac/roles/${roleId}/activate`, { method: "POST" }),

  resolveFuzzyRole: (roleName: string, threshold = 0.7) =>
    apiFetch<FuzzyMatchResult[]>(`/api/v1/management/rbac/roles/resolve-fuzzy?role_name=${encodeURIComponent(roleName)}&threshold=${threshold}`),

  analyzeIndependentRole: (roleName: string) =>
    apiFetch<IndependentRoleOut>(`/api/v1/management/rbac/roles/analyze-independent?role_name=${encodeURIComponent(roleName)}`),

  // Access Policies
  listAccessPolicies: () =>
    apiFetch<AccessPolicyOut[]>("/api/v1/management/access-policies/"),

  createAccessPolicy: (data: any) =>
    apiFetch<AccessPolicyOut>("/api/v1/management/access-policies/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getAccessPolicy: (id: number) =>
    apiFetch<AccessPolicyOut>(`/api/v1/management/access-policies/${id}`),

  updateAccessPolicy: (id: number, data: any) =>
    apiFetch<AccessPolicyOut>(`/api/v1/management/access-policies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteAccessPolicy: (id: number) =>
    apiFetch(`/api/v1/management/access-policies/${id}`, { method: "DELETE" }),

  createTimeLimitedPolicy: (data: any) =>
    apiFetch<AccessPolicyOut>("/api/v1/management/rbac/policies", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // User Management
  updateUserStatus: (userId: number, data: UserStatusUpdateRequest) =>
    apiFetch(`/api/v1/management/rbac/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),

  verifyOTP: (data: { user_id: number; code: string; purpose: string }) =>
    apiFetch("/api/v1/management/rbac/verify-otp", {
      method: "POST",
      body: JSON.stringify(data)
    }),
};

// Policy Management endpoints
export const policyApi = {
  buildFeaturePolicy: (data: FeaturePolicyRequest) =>
    apiFetch("/api/v1/management/policies/features", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  bootstrapStandardRoles: () =>
    apiFetch("/api/v1/management/policies/bootstrap/roles", { method: "POST" }),
};

// Permissions endpoints
export const permissionsApi = {
  roles: () =>
    apiFetch("/api/v1/permissions/roles"),

  permissions: () =>
    apiFetch("/api/v1/permissions/permissions"),

  myPermissions: () =>
    apiFetch("/api/v1/permissions/my-permissions"),

  assignRole: (userId: number, roleId: number) =>
    apiFetch(`/api/v1/permissions/assign?user_id=${userId}&role_id=${roleId}`, { method: "POST" }),
};

// Audit endpoints
export const auditApi = {
  logs: (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
    action?: string;
    resource?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined) searchParams.append("skip", String(params.skip));
    if (params?.limit !== undefined) searchParams.append("limit", String(params.limit));
    if (params?.user_id) searchParams.append("user_id", String(params.user_id));
    if (params?.action) searchParams.append("action", params.action);
    if (params?.resource) searchParams.append("resource", params.resource);
    if (params?.date_from) searchParams.append("date_from", params.date_from);
    if (params?.date_to) searchParams.append("date_to", params.date_to);
    return apiFetch(`/api/v1/audit/?${searchParams}`);
  },

  stats: (days = 7) =>
    apiFetch(`/api/v1/audit/stats?days=${days}`),

  export: (format = "csv", days = 30) =>
    apiFetch(`/api/v1/audit/export?format=${format}&days=${days}`),
};

// Integrations endpoints
export const integrationsApi = {
  // ClickUp
  getClickUpTeams: () =>
    apiFetch("/api/v1/integrations/clickup/teams"),

  getClickUpSpaces: (teamId: string) =>
    apiFetch(`/api/v1/integrations/clickup/teams/${teamId}/spaces`),

  getClickUpLists: (spaceId: string) =>
    apiFetch(`/api/v1/integrations/clickup/spaces/${spaceId}/lists`),

  createClickUpWebhook: (teamId: string) =>
    apiFetch(`/api/v1/integrations/clickup/teams/${teamId}/webhook`, { method: "POST" }),
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

      const response = await fetch(`${API_BASE_URL}/health`, {
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

      const response = await fetch(`${API_BASE_URL}/`, {
        method: "get",
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