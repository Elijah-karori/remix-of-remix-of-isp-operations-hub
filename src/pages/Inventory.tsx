import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsTab } from "@/components/inventory/ProductsTab";
import { SuppliersTab } from "@/components/inventory/SuppliersTab";
import { LowStockTab } from "@/components/inventory/LowStockTab";
import AnalyticsTab from "@/components/inventory/AnalyticsTab"; // NEW
import ProcurementTab from "@/components/inventory/ProcurementTab"; // NEW
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  ShoppingCart, 
  BarChart3,
  Plus,
  Download,
  RefreshCw,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("products");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // NEW HANDLERS
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      toast.info("Refreshing inventory data...");
      // Implement refresh logic
      setTimeout(() => {
        toast.success("Inventory data refreshed");
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      toast.error("Failed to refresh data");
      setIsRefreshing(false);
    }
  };

  const handleExport = (format: string) => {
    toast.info(`Exporting inventory data as ${format}...`);
    // Implement export logic
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "new_product":
        toast.info("Creating new product...");
        break;
      case "new_supplier":
        toast.info("Adding new supplier...");
        break;
      case "new_order":
        toast.info("Creating purchase order...");
        break;
      case "stock_take":
        toast.info("Starting stock take...");
        break;
    }
  };

  return (
    <DashboardLayout title="Inventory" subtitle="Manage products, suppliers, and stock levels">
      {/* ADD TOOLBAR */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Filter modal */}}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default"
            onClick={() => handleQuickAction("new_product")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Product
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleQuickAction("new_order")}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-5">
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
          <TabsTrigger value="procurement" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Procurement
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
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

        <TabsContent value="procurement">
          <ProcurementTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
