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
  Zap, // For Smart Order
  HardDriveUpload, // For Bulk Order
} from "lucide-react";
import { toast } from "sonner";
import { useProcurementOrders, useApproveOrder, useCreateOrder } from "@/hooks/use-inventory"; // Ensure useCreateOrder is imported if needed for direct creation
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { exportToExcel } from "@/lib/export";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PurchaseOrderForm } from "@/components/dashboard/forms/PurchaseOrderForm"; // Import PurchaseOrderForm

export default function ProcurementTab() {
  const { data: orders, isLoading, error, refetch } = useProcurementOrders();
  const approveOrderMutation = useApproveOrder();
  // We don't directly use createOrderMutation here for the New Order button anymore,
  // as the PurchaseOrderForm handles its own creation.

  const [searchQuery, setSearchQuery] = useState("");
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [isSmartOrderDialogOpen, setIsSmartOrderDialogOpen] = useState(false);
  const [isBulkOrderDialogOpen, setIsBulkOrderDialogOpen] = useState(false);

  // States for viewing/editing specific orders
  const [orderToView, setOrderToView] = useState<any | null>(null);
  const [isViewOrderDialogOpen, setIsViewOrderDialogOpen] = useState(false);

  const handleNewOrder = () => {
    setIsNewOrderDialogOpen(true);
  };

  const handleCreateOrderSuccess = () => {
    toast.success("Purchase order created successfully!");
    setIsNewOrderDialogOpen(false);
    refetch(); // Refresh orders list
  };

  const handleCreateOrderCancel = () => {
    setIsNewOrderDialogOpen(false);
  };

  const handleSmartOrder = () => {
    setIsSmartOrderDialogOpen(true);
    // Logic for smart order form
    toast.info("Smart Order functionality is under development.");
  };

  const handleBulkOrder = () => {
    setIsBulkOrderDialogOpen(true);
    // Logic for bulk order form
    toast.info("Bulk Order functionality is under development.");
  };


  const handleOrderAction = async (orderId: number, action: string, orderData?: any) => {
    switch (action) {
      case "approve":
        try {
          toast.info(`Approving order ${orderId}...`);
          await approveOrderMutation.mutateAsync({ purchaseId: orderId, approved: true });
          toast.success(`Order ${orderId} approved`);
          refetch();
        } catch (err: any) {
          toast.error(`Failed to approve order: ${err.message || 'Unknown error'}`);
        }
        break;
      case "reject":
        try {
          toast.info(`Rejecting order ${orderId}...`);
          await approveOrderMutation.mutateAsync({ purchaseId: orderId, approved: false });
          toast.success(`Order ${orderId} rejected`);
          refetch();
        } catch (err: any) {
          toast.error(`Failed to reject order: ${err.message || 'Unknown error'}`);
        }
        break;
      case "view":
        setOrderToView(orderData);
        setIsViewOrderDialogOpen(true);
        break;
      case "edit":
        toast.info(`Editing order ${orderId}... (Functionality to be implemented)`);
        break;
    }
  };

  const handleExport = (format: string) => {
    const ordersList = orders as any[] | undefined;
    if (ordersList && ordersList.length > 0) {
      exportToExcel(ordersList, "purchase-orders", "Purchase Orders");
      toast.success("Purchase orders exported successfully!");
    } else {
      toast.error("No purchase orders to export.");
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing orders...");
    refetch();
  };
  
  const ordersList = orders as any[] | undefined;
  const filteredOrders = ordersList?.filter(
    (order: any) =>
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id === parseInt(searchQuery) // Allow searching by ID
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
            <Button variant="outline" size="sm" onClick={handleSmartOrder}>
              <Zap className="h-4 w-4 mr-2" />
              Smart Order
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkOrder}>
              <HardDriveUpload className="h-4 w-4 mr-2" />
              Bulk Order
            </Button>
            <Button onClick={handleNewOrder}>
              <Plus className="w-4 h-4 mr-2" />
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
                        order.status === "pending" ? "secondary" :
                        "destructive"
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOrderAction(order.id, "view", order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOrderAction(order.id, "edit", order)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {order.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleOrderAction(order.id, "approve")}>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOrderAction(order.id, "reject")}>
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* New Purchase Order Dialog */}
      <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Purchase Order</DialogTitle>
            <DialogDescription>Fill in the details for the new purchase order.</DialogDescription>
          </DialogHeader>
          <PurchaseOrderForm onSuccess={handleCreateOrderSuccess} onCancel={handleCreateOrderCancel} />
        </DialogContent>
      </Dialog>

      {/* View Order Details Dialog */}
      <Dialog open={isViewOrderDialogOpen} onOpenChange={setIsViewOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Purchase Order Details: {orderToView?.order_number}</DialogTitle>
            <DialogDescription>Detailed information about the purchase order.</DialogDescription>
          </DialogHeader>
          {orderToView && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2">
                <p className="text-muted-foreground">Order #:</p>
                <p className="font-medium">{orderToView.order_number}</p>
                <p className="text-muted-foreground">Supplier:</p>
                <p>{orderToView.supplier_name || orderToView.supplier_id}</p>
                <p className="text-muted-foreground">Total Amount:</p>
                <p>KES {orderToView.total_amount?.toLocaleString() || "0"}</p>
                <p className="text-muted-foreground">Status:</p>
                <p>{orderToView.status}</p>
                <p className="text-muted-foreground">Date Created:</p>
                <p>{new Date(orderToView.created_at).toLocaleDateString()}</p>
              </div>
              <h3 className="text-lg font-semibold mt-4">Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead> {/* Assuming product_id from PurchaseOrderItem */}
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderToView.items && orderToView.items.length > 0 ? (
                    orderToView.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.product_id}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">KES {item.unit_price?.toLocaleString() || "0"}</TableCell>
                        <TableCell className="text-right">KES {item.total_price?.toLocaleString() || "0"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No items in this order.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOrderDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Smart Order Dialog (Placeholder) */}
      <Dialog open={isSmartOrderDialogOpen} onOpenChange={setIsSmartOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Smart Order</DialogTitle>
            <DialogDescription>Automatically generate a purchase order based on optimal stock levels.</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-muted-foreground">
            Smart Order form/logic will be implemented here.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSmartOrderDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => toast.info("Smart order initiated!")}>Generate Smart Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Order Dialog (Placeholder) */}
      <Dialog open={isBulkOrderDialogOpen} onOpenChange={setIsBulkOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Order</DialogTitle>
            <DialogDescription>Upload a spreadsheet or select multiple items for a bulk purchase order.</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-muted-foreground">
            Bulk Order form/logic will be implemented here.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkOrderDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => toast.info("Bulk order initiated!")}>Create Bulk Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}