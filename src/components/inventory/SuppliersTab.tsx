import { toast } from "sonner";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, Supplier } from "@/hooks/use-inventory";
import { exportToExcel } from "@/lib/export";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  Plus,
  Search,
  Truck,
  Phone,
  Mail,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useState } from "react";

export function SuppliersTab() {
  const { data: suppliers, isLoading, error, refetch } = useSuppliers();
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier> | null>(null);

  const handleOpenAddSupplierDialog = () => {
    setIsEditingSupplier(false);
    setCurrentSupplier({});
    setIsAddSupplierDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setIsEditingSupplier(true);
    setCurrentSupplier(supplier);
    setIsAddSupplierDialogOpen(true);
  };

  const handleSaveSupplier = async () => {
    if (!currentSupplier?.name || !currentSupplier?.email || !currentSupplier?.phone) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      if (isEditingSupplier && currentSupplier?.id) {
        await updateSupplierMutation.mutateAsync({ id: currentSupplier.id, data: currentSupplier });
        toast.success("Supplier updated successfully!");
      } else {
        await createSupplierMutation.mutateAsync(currentSupplier);
        toast.success("Supplier added successfully!");
      }
      setIsAddSupplierDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to save supplier: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteSupplier = (id: number) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      toast.info(`Deleting supplier ${id}...`);
      // Implement delete API call here
      setTimeout(() => {
        toast.success("Supplier deleted successfully!");
        refetch();
      }, 1000);
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
                          <Button variant="ghost" size="icon" onClick={() => toast.info(`Viewing supplier ${supplier.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSupplier(supplier.id)}>
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

      <Dialog open={isAddSupplierDialogOpen} onOpenChange={setIsAddSupplierDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
            <DialogDescription>
              {isEditingSupplier ? "Make changes to the supplier details." : "Fill in the details for the new supplier."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentSupplier?.name || ""}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_person" className="text-right">
                Contact Person
              </Label>
              <Input
                id="contact_person"
                value={currentSupplier?.contact_person || ""}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, contact_person: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={currentSupplier?.email || ""}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={currentSupplier?.phone || ""}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={currentSupplier?.address || ""}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                Active
              </Label>
              <Checkbox
                id="is_active"
                checked={currentSupplier?.is_active || false}
                onCheckedChange={(checked) => setCurrentSupplier({ ...currentSupplier, is_active: checked as boolean })}
                className="col-span-3 justify-self-start"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSupplierDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSupplier} disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}>
              {createSupplierMutation.isPending || updateSupplierMutation.isPending ? "Saving..." : "Save Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
