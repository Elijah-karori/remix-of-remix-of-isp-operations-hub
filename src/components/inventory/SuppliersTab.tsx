import { useState } from "react";
import { useSuppliers } from "@/hooks/use-inventory";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Truck, Phone, Mail } from "lucide-react";

export function SuppliersTab() {
  const { data: suppliers, isLoading, error, refetch } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuppliers = suppliers?.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSkeleton variant="table" count={5} />;
  }

  if (error) {
    return <ErrorState message="Failed to load suppliers" onRetry={refetch} />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Suppliers ({suppliers?.length || 0})
        </CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
