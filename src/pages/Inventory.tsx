import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsTab } from "@/components/inventory/ProductsTab";
import { SuppliersTab } from "@/components/inventory/SuppliersTab";
import { LowStockTab } from "@/components/inventory/LowStockTab";
import { Package, Truck, AlertTriangle } from "lucide-react";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <DashboardLayout title="Inventory" subtitle="Manage products, suppliers, and stock levels">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersTab />
        </TabsContent>

        <TabsContent value="low-stock">
          <LowStockTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
