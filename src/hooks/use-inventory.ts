import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, apiFetch } from "@/lib/api";
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
      apiFetch(`/api/v1/inventory/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useSearchProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ query, useScrapers = false, maxResults = 50 }: { query: string; useScrapers?: boolean; maxResults?: number }) =>
      inventoryApi.searchProducts(query, useScrapers, maxResults),
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
