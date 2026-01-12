import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, apiFetch } from "@/lib/api";

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unit_price: number;
  quantity_in_stock: number;
  reorder_level: number;
  supplier_id?: number;
  supplier_name?: string;
  is_active: boolean;
  low_stock_alert_enabled?: boolean;
  low_stock_alert_emails?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  contact_person?: string;
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

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["inventory", "products"],
    queryFn: () => inventoryApi.products() as Promise<Product[]>,
    staleTime: 30000,
  });
}

export function useProduct(id: number) {
  return useQuery<Product>({
    queryKey: ["inventory", "product", id],
    queryFn: () => inventoryApi.product(id) as Promise<Product>,
    enabled: !!id,
  });
}

export function useSuppliers(activeOnly = true) {
  return useQuery<Supplier[]>({
    queryKey: ["inventory", "suppliers", activeOnly],
    queryFn: () => inventoryApi.suppliers(activeOnly) as Promise<Supplier[]>,
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
    mutationFn: (data: Partial<Product>) => inventoryApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) =>
      apiFetch(`/api/v1/inventory/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
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
