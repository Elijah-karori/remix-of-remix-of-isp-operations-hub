import { apiFetch } from './base';

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

  // Legacy (Keeping for compatibility but fixing paths)
  create: (data: any) =>
    apiFetch("/api/v1/procurement/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  approve: (purchaseId: number, approve: boolean, comment?: string) =>
    apiFetch(`/api/v1/procurement/orders/${purchaseId}/approve?approved=${approve}${comment ? `&notes=${encodeURIComponent(comment)}` : ''}`, {
      method: "POST"
    }),

  markOrdered: (purchaseId: number) =>
    apiFetch(`/api/v1/procurement/orders/${purchaseId}/mark-ordered`, { method: "POST" }),
};
