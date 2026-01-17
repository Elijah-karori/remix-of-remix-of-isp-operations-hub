import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Clock,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useProcurementOrders, useCreateOrder, useApproveOrder } from "@/hooks/use-inventory";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { exportToExcel } from "@/lib/export";

export default function ProcurementTab() {
  const { data: orders, isLoading, error, refetch } = useProcurementOrders();
  const createOrderMutation = useCreateOrder();
  const approveOrderMutation = useApproveOrder();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleNewOrder = async () => {
    setIsCreatingOrder(true);
    try {
      toast.info("Creating new purchase order...");
      await createOrderMutation.mutateAsync({}); // Placeholder data
      toast.success("Purchase order created");
      setIsCreatingOrder(false);
    } catch (err) {
      toast.error(`Failed to create order: ${err.message || 'Unknown error'}`);
      setIsCreatingOrder(false);
    }
  };

  const handleOrderAction = async (orderId: number, action: string) => {
    switch (action) {
      case "approve":
        try {
          toast.info(`Approving order ${orderId}...`);
          await approveOrderMutation.mutateAsync({ purchaseId: orderId, approved: true });
          toast.success(`Order ${orderId} approved`);
        } catch (err) {
          toast.error(`Failed to approve order: ${err.message || 'Unknown error'}`);
        }
        break;
      case "reject":
        try {
          toast.info(`Rejecting order ${orderId}...`);
          await approveOrderMutation.mutateAsync({ purchaseId: orderId, approved: false });
          toast.success(`Order ${orderId} rejected`);
        } catch (err) {
          toast.error(`Failed to reject order: ${err.message || 'Unknown error'}`);
        }
        break;
      case "view":
        toast.info(`Viewing order ${orderId} details...`);
        break;
      case "edit":
        toast.info(`Editing order ${orderId}...`);
        break;
    }
  };

  const handleExport = (format: string) => {
    if (orders && orders.length > 0) {
      exportToExcel(orders, "purchase-orders", "Purchase Orders");
      toast.success("Purchase orders exported successfully!");
    } else {
      toast.error("No purchase orders to export.");
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing orders...");
    refetch();
  };
  const filteredOrders = orders?.filter(
    (order: any) =>
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSkeleton variant="table" count={5} />;
  }

  if (error) {
    return <ErrorState message="Failed to load purchase orders" onRetry={refetch} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Purchase Orders</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleNewOrder} disabled={isCreatingOrder}>
              {isCreatingOrder ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              New Order
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders?.map((order: any) => ( // Assuming order type from API
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.supplier_name || order.supplier_id}</TableCell>
                    <TableCell>KES {order.total_amount?.toLocaleString() || "0"}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === "approved" ? "default" :
                        order.status === "pending" ? "warning" :
                        "destructive"
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOrderAction(order.id, "view")}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOrderAction(order.id, "edit")}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOrderAction(order.id, "approve")}>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOrderAction(order.id, "reject")}>
                          <XCircle className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}