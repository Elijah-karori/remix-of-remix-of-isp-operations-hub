import { useState, useEffect } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useSuppliers, Product } from "@/hooks/use-inventory"; // Import useDeleteProduct
import { ProductCreate } from "@/types/api";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockAlertDialog } from "./StockAlertDialog"; // Assuming this is for Bell icon
import { Plus, Search, Bell, Package, Download, RefreshCw, Filter, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel } from "@/lib/export";

// react-hook-form and zod imports
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


// Zod schema for product validation
const productFormSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  sku: z.string().min(1, { message: "SKU is required." }),
  description: z.string().optional(),
  category: z.string().optional(),
  unit_price: z.coerce.number().min(0, { message: "Unit price must be a non-negative number." }),
  quantity_in_stock: z.coerce.number().int().min(0, { message: "Stock quantity must be a non-negative integer." }),
  reorder_level: z.coerce.number().int().min(0, { message: "Reorder level must be a non-negative integer." }),
  supplier_id: z.coerce.number().int().optional().refine(val => val === undefined || val > 0, {
    message: "Supplier is required.", // Custom message for 0 or negative
  }),
  is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;


export function ProductsTab() {
  const { data: products, isLoading, error, refetch } = useProducts();
  const { data: suppliersData } = useSuppliers(true);
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null); // For StockAlertDialog
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<number | null>(null);
  const [isViewProductDialogOpen, setIsViewProductDialogOpen] = useState(false); // For view dialog
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null); // For view dialog
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      category: "",
      unit_price: 0,
      quantity_in_stock: 0,
      reorder_level: 0,
      supplier_id: undefined,
      is_active: true,
    },
  });

  useEffect(() => {
    if (isAddProductDialogOpen && isEditingProduct && selectedProductId) {
      const productToEdit = products?.find(p => p.id === selectedProductId);
      if (productToEdit) {
        form.reset({
          name: productToEdit.name || "",
          sku: productToEdit.sku || "",
          description: productToEdit.description || "",
          category: productToEdit.category || "",
          unit_price: productToEdit.unit_price || 0,
          quantity_in_stock: productToEdit.quantity_in_stock || 0,
          reorder_level: productToEdit.reorder_level || 0,
          supplier_id: productToEdit.supplier_id || undefined,
          is_active: productToEdit.is_active ?? true,
        });
      }
    } else if (!isAddProductDialogOpen) {
      form.reset();
      // setSelectedProductId(null); // Keep for StockAlertDialog
    }
  }, [isAddProductDialogOpen, isEditingProduct, selectedProductId, products, form]);


  const handleOpenAddProductDialog = () => {
    setIsEditingProduct(false);
    setSelectedProductId(null);
    form.reset();
    setIsAddProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setIsEditingProduct(true);
    setSelectedProductId(product.id);
    setIsAddProductDialogOpen(true);
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDeleteId(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDeleteId) {
      try {
        await deleteProductMutation.mutateAsync(productToDeleteId);
        toast.success("Product deleted successfully!");
        refetch();
      } catch (err: any) {
        toast.error(`Failed to delete product: ${err.message || 'Unknown error'}`);
      } finally {
        setIsDeleteDialogOpen(false);
        setProductToDeleteId(null);
      }
    }
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsViewProductDialogOpen(true);
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (isEditingProduct && selectedProductId) {
        await updateProductMutation.mutateAsync({ id: selectedProductId, data: {
            name: values.name,
            sku: values.sku,
            description: values.description,
            category: values.category,
            price: values.unit_price, // map back to 'price' for API
            quantity_on_hand: values.quantity_in_stock, // map back to 'quantity_on_hand' for API
            reorder_level: values.reorder_level,
            supplier_id: values.supplier_id,
            is_active: values.is_active,
        } as Partial<ProductCreate> });
        toast.success("Product updated successfully!");
      } else {
        const createPayload: ProductCreate = {
          name: values.name,
          sku: values.sku,
          category: values.category,
          unit_price: values.unit_price,
          quantity_in_stock: values.quantity_in_stock,
          reorder_level: values.reorder_level,
          supplier_id: values.supplier_id || 0,
          is_active: values.is_active,
        };
        await createProductMutation.mutateAsync(createPayload);
        toast.success("Product added successfully!");
      }
      setIsAddProductDialogOpen(false);
      refetch();
    } catch (err: any) {
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
                          KES {(product.unit_price || 0).toLocaleString()}
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
                            <Button variant="ghost" size="icon" onClick={() => handleViewProduct(product)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product.id)}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteProductMutation.isPending}>
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {isEditingProduct ? "Make changes to the product details." : "Fill in the details for the new product."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="name" className="text-right">Name</FormLabel>
                    <FormControl>
                      <Input id="name" {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="sku" className="text-right">SKU</FormLabel>
                    <FormControl>
                      <Input id="sku" {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="description" className="text-right">Description</FormLabel>
                    <FormControl>
                      <Textarea id="description" {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="category" className="text-right">Category</FormLabel>
                    <FormControl>
                      <Input id="category" {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="unit_price" className="text-right">Unit Price</FormLabel>
                    <FormControl>
                      <Input id="unit_price" type="number" {...field} className="col-span-3" onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity_in_stock"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="quantity_in_stock" className="text-right">Stock Quantity</FormLabel>
                    <FormControl>
                      <Input id="quantity_in_stock" type="number" {...field} className="col-span-3" onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="reorder_level" className="text-right">Reorder Level</FormLabel>
                    <FormControl>
                      <Input id="reorder_level" type="number" {...field} className="col-span-3" onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="supplier_id" className="text-right">Supplier</FormLabel>
                    <Select onValueChange={value => field.onChange(parseInt(value))} value={field.value ? String(field.value) : ""}>
                      <FormControl>
                        <SelectTrigger id="supplier_id" className="col-span-3">
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliersData?.map((supplier) => (
                          <SelectItem key={supplier.id} value={String(supplier.id)}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="is_active" className="text-right">Active</FormLabel>
                    <FormControl>
                      <Checkbox
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="col-span-3 justify-self-start"
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddProductDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting || createProductMutation.isPending || updateProductMutation.isPending}>
                  {form.formState.isSubmitting || createProductMutation.isPending || updateProductMutation.isPending ? "Saving..." : "Save Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Product Details Dialog */}
      <Dialog open={isViewProductDialogOpen} onOpenChange={setIsViewProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Detailed information about the selected product.</DialogDescription>
          </DialogHeader>
          {viewingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2">
                <Label className="text-muted-foreground">Name:</Label>
                <p className="font-medium">{viewingProduct.name}</p>

                <Label className="text-muted-foreground">SKU:</Label>
                <p>{viewingProduct.sku}</p>

                <Label className="text-muted-foreground">Category:</Label>
                <p>{viewingProduct.category || 'N/A'}</p>

                <Label className="text-muted-foreground">Supplier:</Label>
                <p>{viewingProduct.supplier_name || 'N/A'}</p>

                <Label className="text-muted-foreground">Unit Price:</Label>
                <p>KES {(viewingProduct.unit_price || 0).toLocaleString()}</p>

                <Label className="text-muted-foreground">Stock Quantity:</Label>
                <p>{viewingProduct.quantity_in_stock}</p>

                <Label className="text-muted-foreground">Reorder Level:</Label>
                <p>{viewingProduct.reorder_level}</p>

                <Label className="text-muted-foreground">Active:</Label>
                <p>{viewingProduct.is_active ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description:</Label>
                <p>{viewingProduct.description || 'N/A'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewProductDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}