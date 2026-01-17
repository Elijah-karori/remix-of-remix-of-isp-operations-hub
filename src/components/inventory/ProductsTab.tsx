import { useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useSuppliers, Product } from "@/hooks/use-inventory";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockAlertDialog } from "./StockAlertDialog";
import { Plus, Search, Bell, Package, Download, RefreshCw, Filter, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel } from "@/lib/export";

export function ProductsTab() {
  const { data: products, isLoading, error, refetch } = useProducts();
  const { data: suppliersData } = useSuppliers(true);
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const handleOpenAddProductDialog = () => {
    setIsEditingProduct(false);
    setCurrentProduct({});
    setIsAddProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setIsEditingProduct(true);
    setCurrentProduct(product);
    setIsAddProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!currentProduct?.name || !currentProduct?.sku || !currentProduct?.unit_price || !currentProduct?.quantity_in_stock || !currentProduct?.reorder_level) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      if (isEditingProduct && currentProduct?.id) {
        await updateProductMutation.mutateAsync({ id: currentProduct.id, data: currentProduct });
        toast.success("Product updated successfully!");
      } else {
        await createProductMutation.mutateAsync(currentProduct);
        toast.success("Product added successfully!");
      }
      setIsAddProductDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to save product: ${err.message || 'Unknown error'}`);
    }
  };

  const handleExport = (format: string) => {
    if (filteredProducts && filteredProducts.length > 0) {
      exportToExcel(filteredProducts, "products", "Products");
      toast.success("Products exported successfully!");
    } else {
      toast.error("No products to export.");
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing products...");
    refetch();
  };

  const filteredProducts = products?.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === "all" || product.category === categoryFilter) &&
      (supplierFilter === "all" || String(product.supplier_id) === supplierFilter)
  );

  const getStockStatus = (quantity: number, reorderLevel: number) => {
    if (quantity <= 0) return { label: "Out of Stock", variant: "destructive" as const, color: "text-red-500" };
    if (quantity <= reorderLevel) return { label: "Low Stock", variant: "secondary" as const, color: "text-yellow-500" };
    return { label: "In Stock", variant: "default" as const, color: "text-green-500" };
  };

  if (isLoading) {
    return <LoadingSkeleton variant="table" count={5} />;
  }

  if (error) {
    return <ErrorState message="Failed to load products" onRetry={refetch} />;
  }

  // Extract unique categories
  const categories = Array.from(new Set(products?.map(p => p.category).filter(Boolean)));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({products?.length || 0})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={handleOpenAddProductDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliersData?.map(supplier => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Alerts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts?.map((product) => {
                    const status = getStockStatus(product.quantity_in_stock, product.reorder_level);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                        <TableCell>{product.category || "-"}</TableCell>
                        <TableCell>{product.supplier_name || "-"}</TableCell>
                        <TableCell className="text-right">
                          KES {product.unit_price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.quantity_in_stock} / {product.reorder_level}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedProductId(product.id)}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toast.info(`Viewing product ${product.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toast.info(`Deleting product ${product.id}`)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StockAlertDialog
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />

      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {isEditingProduct ? "Make changes to the product details." : "Fill in the details for the new product."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentProduct?.name || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <Input
                id="sku"
                value={currentProduct?.sku || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={currentProduct?.description || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                value={currentProduct?.category || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit_price" className="text-right">
                Unit Price
              </Label>
              <Input
                id="unit_price"
                type="number"
                value={currentProduct?.unit_price || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, unit_price: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity_in_stock" className="text-right">
                Stock Quantity
              </Label>
              <Input
                id="quantity_in_stock"
                type="number"
                value={currentProduct?.quantity_in_stock || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, quantity_in_stock: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reorder_level" className="text-right">
                Reorder Level
              </Label>
              <Input
                id="reorder_level"
                type="number"
                value={currentProduct?.reorder_level || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, reorder_level: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">
                Supplier
              </Label>
              <Select
                value={String(currentProduct?.supplier_id || "")}
                onValueChange={(value) => setCurrentProduct({ ...currentProduct, supplier_id: parseInt(value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliersData?.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                Active
              </Label>
              <Checkbox
                id="is_active"
                checked={currentProduct?.is_active || false}
                onCheckedChange={(checked) => setCurrentProduct({ ...currentProduct, is_active: checked as boolean })}
                className="col-span-3 justify-self-start"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} disabled={createProductMutation.isPending || updateProductMutation.isPending}>
              {createProductMutation.isPending || updateProductMutation.isPending ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
