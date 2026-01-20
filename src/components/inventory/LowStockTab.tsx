import { useLowStockItems, useReorderPredictions, useAutoReorderProduct } from "@/hooks/use-inventory";
import { ReorderPrediction } from "@/types/api";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, ShoppingCart, RefreshCw, Download, Zap, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel } from "@/lib/export";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PurchaseOrderForm } from "@/components/dashboard/forms/PurchaseOrderForm";

export function LowStockTab() {
  const { data: lowStockItems, isLoading, error, refetch } = useLowStockItems();
  const { data: reorderPredictions, isLoading: loadingPredictions, error: predictionsError } = useReorderPredictions();
  const autoReorderMutation = useAutoReorderProduct();

  const [isPurchaseOrderDialogOpen, setIsPurchaseOrderDialogOpen] = useState(false);
  const [productToOrder, setProductToOrder] = useState<{ id: number; name: string; quantity: number } | null>(null);


  const handleCreateOrder = (productId: number, productName: string, quantity: number) => {
    setProductToOrder({ id: productId, name: productName, quantity });
    setIsPurchaseOrderDialogOpen(true);
  };

  const handlePurchaseOrderSuccess = () => {
    toast.success("Purchase order created successfully!");
    setIsPurchaseOrderDialogOpen(false);
    setProductToOrder(null);
    refetch(); // Refetch low stock items
  };

  const handlePurchaseOrderCancel = () => {
    setIsPurchaseOrderDialogOpen(false);
    setProductToOrder(null);
  };

  const handleAutoReorder = async (productId: number) => {
    try {
      await autoReorderMutation.mutateAsync({ productId, data: {} }); // Assuming data can be empty or dynamically determined
      toast.success(`Auto reorder triggered for product ${productId}!`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to auto reorder: ${err.message || 'Unknown error'}`);
    }
  };


  const handleExport = (format: string) => {
    if (lowStockItems && lowStockItems.length > 0) {
      exportToExcel(lowStockItems, "low-stock-items", "Low Stock Items");
      toast.success("Low stock items exported successfully!");
    } else {
      toast.error("No low stock items to export.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "low":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Low</Badge>;
      case "warning":
        return <Badge variant="secondary">Warning</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton variant="table" count={5} />;
  }

  if (error) {
    return <ErrorState message="Failed to load low stock items" onRetry={refetch} />;
  }

  const criticalCount = lowStockItems?.filter((item) => item.status === "critical").length || 0;
  const lowCount = lowStockItems?.filter((item) => item.status === "low").length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Critical Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Items need immediate reorder</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{lowCount}</div>
            <p className="text-xs text-muted-foreground">Items below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Products requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Predictions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Reorder Predictions
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => toast.info("Refreshing predictions...")}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loadingPredictions ? (
            <LoadingSkeleton variant="stat" />
          ) : predictionsError ? (
            <ErrorState message="Failed to load reorder predictions" onRetry={() => {}} />
          ) : reorderPredictions && (reorderPredictions as ReorderPrediction[]).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(reorderPredictions as ReorderPrediction[]).map((prediction) => (
                <div key={prediction.product_id} className="border p-4 rounded-lg">
                  <p className="font-medium">{prediction.product_name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {prediction.sku}</p>
                  <p className="text-sm text-muted-foreground">Predicted Reorder Date: {prediction.predicted_reorder_date}</p>
                  <p className="text-sm text-muted-foreground">Suggested Quantity: {prediction.suggested_quantity}</p>
                  <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => handleCreateOrder(prediction.product_id, prediction.product_name, prediction.suggested_quantity)}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> Order Now
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reorder predictions available.</p>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Items
            </CardTitle>
            <CardDescription>
              Products that have fallen below their reorder level
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lowStockItems?.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-foreground">All stock levels healthy</h3>
              <p className="text-muted-foreground mt-1">No products are currently below their reorder level.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                      <TableCell>{item.supplier_name || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.quantity_in_stock}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.reorder_level}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleCreateOrder(item.id, item.name, item.reorder_level)}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleAutoReorder(item.id)}>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Order Dialog */}
      <Dialog open={isPurchaseOrderDialogOpen} onOpenChange={setIsPurchaseOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Create a purchase order for {productToOrder?.name}.
            </DialogDescription>
          </DialogHeader>
          {productToOrder && (
            <PurchaseOrderForm
              onSuccess={handlePurchaseOrderSuccess}
              onCancel={handlePurchaseOrderCancel}
              initialItem={productToOrder.name}
              initialQuantity={productToOrder.quantity}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}