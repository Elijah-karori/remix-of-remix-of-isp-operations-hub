import { useLowStockItems } from "@/hooks/use-inventory";
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
import { AlertTriangle, ShoppingCart, RefreshCw } from "lucide-react";

export function LowStockTab() {
  const { data: lowStockItems, isLoading, error, refetch } = useLowStockItems();

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
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                        <Button variant="outline" size="sm">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
