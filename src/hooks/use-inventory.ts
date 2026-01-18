import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, apiFetch, procurementApi, productsApi } from "@/lib/api";
import { Product as ApiProduct, Supplier as ApiSupplier, ProductCreate } from "@/types/api";

// Re-export API types with extended fields for UI
export type Product = ApiProduct & {
  // Map backend fields to UI-friendly names
  unit_price?: number; // Alias for price
  quantity_in_stock?: number; // Alias for quantity_on_hand
  supplier_name?: string;
  low_stock_alert_enabled?: boolean;
  low_stock_alert_emails?: string[];
};

export interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  contact_name?: string;
  is_active: boolean;
  products_count?: number;
}

export interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  quantity_in_stock: number;
  reorder_level: number;
  status: "critical" | "low" | "warning";
  supplier_name?: string;
}

export interface StockAlertSettings {
  product_id: number;
  enabled: boolean;
  alert_emails: string[];
  threshold_multiplier?: number;
}

// Transform API product to UI product
function transformProduct(product: ApiProduct): Product {
  return {
    ...product,
    unit_price: product.price,
    quantity_in_stock: product.quantity_on_hand,
    supplier_name: product.supplier?.name,
  };
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["inventory", "products"],
    queryFn: async () => {
      const products = await inventoryApi.products();
      return products.map(transformProduct);
    },
    staleTime: 30000,
  });
}

export function useProduct(id: number) {
  return useQuery<Product>({
    queryKey: ["inventory", "product", id],
    queryFn: async () => {
      const product = await inventoryApi.product(id);
      return transformProduct(product);
    },
    enabled: !!id,
  });
}

export function useSuppliers(activeOnly = true) {
  return useQuery<Supplier[]>({
    queryKey: ["inventory", "suppliers", activeOnly],
    queryFn: async () => {
      const suppliers = await inventoryApi.suppliers(activeOnly);
      return suppliers.map((s: ApiSupplier) => ({
        ...s,
        contact_person: s.contact_name,
      }));
    },
    staleTime: 60000,
  });
}

export function useLowStockItems(thresholdMultiplier = 1.5) {
  return useQuery<LowStockItem[]>({
    queryKey: ["inventory", "low-stock", thresholdMultiplier],
    queryFn: () => inventoryApi.lowStock(thresholdMultiplier) as Promise<LowStockItem[]>,
    staleTime: 60000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreate) => inventoryApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductCreate> }) =>
      inventoryApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useSearchProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ query, useScrapers = false, maxResults = 50 }: { query: string; useScrapers?: boolean; maxResults?: number }) =>
      productsApi.search(query, useScrapers, maxResults),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useSetStockAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: StockAlertSettings) =>
      apiFetch(`/api/v1/inventory/products/${settings.product_id}/alert`, {
        method: "PUT",
        body: JSON.stringify({
          low_stock_alert_enabled: settings.enabled,
          low_stock_alert_emails: settings.alert_emails,
          threshold_multiplier: settings.threshold_multiplier || 1.0,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useProcurementOrders() {
  return useQuery({
    queryKey: ["procurement", "orders"],
    queryFn: () => procurementApi.pendingOrders(),
    staleTime: 60000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => procurementApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procurement", "orders"] });
    },
  });
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: ["inventory", "valuation"],
    queryFn: async () => {
      try {
        const data = await inventoryApi.valuation();
        return data || { total_value: 0, total_products: 0 };
      } catch (error) {
        console.error("Failed to fetch inventory valuation:", error);
        return { total_value: 0, total_products: 0 };
      }
    },
    staleTime: 3600000, // 1 hour
  });
}

export function useInventoryTurnoverAnalysis(days = 90) {
  return useQuery({
    queryKey: ["inventory", "turnoverAnalysis", days],
    queryFn: async () => {
      const data = await inventoryApi.turnoverAnalysis(days) as any[];
      // Calculate average turnover rate from all products or return summary if available
      const turnover_rate = data.length > 0
        ? data.reduce((acc, item) => acc + (item.turnover_ratio || 0), 0) / data.length
        : 0;
      return { turnover_rate, items: data };
    },
    staleTime: 3600000, // 1 hour
  });
}

export function useInventoryDeadStock(daysThreshold = 90) {
  return useQuery({
    queryKey: ["inventory", "deadStock", daysThreshold],
    queryFn: async () => {
      const data = await inventoryApi.deadStock(daysThreshold) as any[];
      const total_dead_stock_value = data.reduce((acc, item) => acc + (item.total_value || 0), 0);
      return {
        total_dead_stock_value,
        dead_stock_items: data
      };
    },
    staleTime: 3600000, // 1 hour
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Supplier>) => inventoryApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Supplier> }) =>
      inventoryApi.updateSupplier(id, data),
    onSuccess: (updatedSupplier: any) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "suppliers"] });
      queryClient.setQueryData(["inventory", "supplier", updatedSupplier.id], updatedSupplier);
    },
  });
}

export function useApproveOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ purchaseId, approved, notes }: { purchaseId: number; approved: boolean; notes?: string }) =>
      procurementApi.approveOrder(purchaseId, approved, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procurement", "orders"] });
    },
  });
}
