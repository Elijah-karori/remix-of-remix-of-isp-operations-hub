import { Product, ProductCreate, Supplier } from '../../types/api';
import { apiFetch, API_BASE_URL, getAccessToken } from './base';

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

  deleteProduct: (id: number) =>
    apiFetch(`/api/v1/inventory/products/${id}`, { method: "DELETE" }),

  uploadProductImage: async (productId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const accessToken = getAccessToken();

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

  deleteSupplier: (id: number) =>
    apiFetch(`/api/v1/inventory/suppliers/${id}`, { method: "DELETE" }),

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

  turnoverAnalysis: (days = 90): Promise<any[]> =>
    apiFetch<any[]>(`/api/v1/inventory/turnover-analysis?days=${days}`),

  deadStock: (daysThreshold = 90): Promise<any[]> =>
    apiFetch<any[]>(`/api/v1/inventory/dead-stock?days_threshold=${daysThreshold}`),

  autoReorder: (productId: number, data: any) =>
    apiFetch(`/api/v1/inventory/${productId}/auto-reorder`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  valuation: (): Promise<any> =>
    apiFetch<any>("/api/v1/inventory/valuation"),
};
