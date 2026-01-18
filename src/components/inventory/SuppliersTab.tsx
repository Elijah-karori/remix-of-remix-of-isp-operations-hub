import { toast } from "sonner";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, Supplier } from "@/hooks/use-inventory"; // Import useDeleteSupplier
import { exportToExcel } from "@/lib/export";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label"; // Keep Label for view dialog
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
import { Plus, Search, Truck, Phone, Mail, RefreshCw, Download, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect } from "react";

// react-hook-form and zod imports
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


// Zod schema for supplier validation
const supplierFormSchema = z.object({
  name: z.string().min(1, { message: "Supplier name is required." }),
  contact_person: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).min(1, { message: "Email is required." }),
  phone: z.string().min(1, { message: "Phone number is required." }),
  address: z.string().optional(),
  is_active: z.boolean().default(true),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;


export function SuppliersTab() {
  const { data: suppliers, isLoading, error, refetch } = useSuppliers();
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDeleteId, setSupplierToDeleteId] = useState<number | null>(null);
  const [isViewSupplierDialogOpen, setIsViewSupplierDialogOpen] = useState(false); // State for view dialog
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null); // State for supplier to view


  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isAddSupplierDialogOpen && isEditingSupplier && supplierToDeleteId) {
      const supplierToEdit = suppliers?.find(s => s.id === supplierToDeleteId);
      if (supplierToEdit) {
        form.reset({
          name: supplierToEdit.name || "",
          contact_person: supplierToEdit.contact_person || "",
          email: supplierToEdit.email || "",
          phone: supplierToEdit.phone || "",
          address: supplierToEdit.address || "",
          is_active: supplierToEdit.is_active ?? true,
        });
      }
    } else if (!isAddSupplierDialogOpen) {
      form.reset();
      setSupplierToDeleteId(null);
    }
  }, [isAddSupplierDialogOpen, isEditingSupplier, supplierToDeleteId, suppliers, form]);


  const handleOpenAddSupplierDialog = () => {
    setIsEditingSupplier(false);
    setSupplierToDeleteId(null);
    form.reset();
    setIsAddSupplierDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setIsEditingSupplier(true);
    setSupplierToDeleteId(supplier.id);
    setIsAddSupplierDialogOpen(true);
  };

  const handleDeleteClick = (supplierId: number) => {
    setSupplierToDeleteId(supplierId);
    setIsDeleteDialogOpen(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setIsViewSupplierDialogOpen(true);
  };


  const handleConfirmDelete = async () => {
    if (supplierToDeleteId) {
      try {
        await deleteSupplierMutation.mutateAsync(supplierToDeleteId);
        toast.success("Supplier deleted successfully!");
        refetch();
      } catch (err: any) {
        toast.error(`Failed to delete supplier: ${err.message || 'Unknown error'}`);
      } finally {
        setIsDeleteDialogOpen(false);
        setSupplierToDeleteId(null);
      }
    }
  };

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      if (isEditingSupplier && supplierToDeleteId) {
        await updateSupplierMutation.mutateAsync({ id: supplierToDeleteId, data: values });
        toast.success("Supplier updated successfully!");
      } else {
        await createSupplierMutation.mutateAsync(values);
        toast.success("Supplier added successfully!");
      }
      setIsAddSupplierDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to save supplier: ${err.message || 'Unknown error'}`);
    }
  };

  const handleExport = (format: string) => {
    if (filteredSuppliers && filteredSuppliers.length > 0) {
      exportToExcel(filteredSuppliers, "suppliers", "Suppliers");
      toast.success("Suppliers exported successfully!");
    } else {
      toast.error("No suppliers to export.");
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing suppliers...");
    refetch();
  };

  const filteredSuppliers = suppliers?.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (isLoading) {
    return <LoadingSkeleton variant="table" count={5} />;
  }

  if (error) {
    return <ErrorState message="Failed to load suppliers" onRetry={refetch} />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Suppliers ({suppliers?.length || 0})
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
            <Button size="sm" onClick={handleOpenAddSupplierDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers?.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contact_person || "-"}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${supplier.email}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {supplier.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`tel:${supplier.phone}`}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Phone className="h-3 w-3" />
                          {supplier.phone}
                        </a>
                      </TableCell>
                      <TableCell>{supplier.products_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.is_active ? "default" : "secondary"}>
                          {supplier.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditSupplier(supplier)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleViewSupplier(supplier)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(supplier.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteSupplierMutation.isPending}>
              {deleteSupplierMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Supplier Add/Edit Dialog */}
      <Dialog open={isAddSupplierDialogOpen} onOpenChange={setIsAddSupplierDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
            <DialogDescription>
              {isEditingSupplier ? "Make changes to the supplier details." : "Fill in the details for the new supplier."}
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
                name="contact_person"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="contact_person" className="text-right">Contact Person</FormLabel>
                    <FormControl>
                      <Input id="contact_person" {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="email" className="text-right">Email</FormLabel>
                    <FormControl>
                      <Input id="email" type="email" {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="phone" className="text-right">Phone</FormLabel>
                    <FormControl>
                      <Input id="phone" {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-2" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="address" className="text-right">Address</FormLabel>
                    <FormControl>
                      <Input id="address" {...field} className="col-span-3" />
                    </FormControl>
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
                <Button variant="outline" type="button" onClick={() => setIsAddSupplierDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting || createSupplierMutation.isPending || updateSupplierMutation.isPending}>
                  {form.formState.isSubmitting || createSupplierMutation.isPending || updateSupplierMutation.isPending ? "Saving..." : "Save Supplier"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Supplier Details Dialog */}
      <Dialog open={isViewSupplierDialogOpen} onOpenChange={setIsViewSupplierDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
            <DialogDescription>Detailed information about the selected supplier.</DialogDescription>
          </DialogHeader>
          {viewingSupplier && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2">
                <Label className="text-muted-foreground">Name:</Label>
                <p className="font-medium">{viewingSupplier.name}</p>

                <Label className="text-muted-foreground">Contact Person:</Label>
                <p>{viewingSupplier.contact_person || 'N/A'}</p>

                <Label className="text-muted-foreground">Email:</Label>
                <p>{viewingSupplier.email}</p>

                <Label className="text-muted-foreground">Phone:</Label>
                <p>{viewingSupplier.phone}</p>

                <Label className="text-muted-foreground">Address:</Label>
                <p>{viewingSupplier.address || 'N/A'}</p>

                <Label className="text-muted-foreground">Active:</Label>
                <p>{viewingSupplier.is_active ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewSupplierDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}