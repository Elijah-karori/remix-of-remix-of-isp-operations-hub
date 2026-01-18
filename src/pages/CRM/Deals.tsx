import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { crmApi } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, RefreshCw, Pencil, Trash2, Eye, DollarSign } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Deal } from '@/types/api';
import { format } from 'date-fns';
import { DealForm } from '@/components/crm/DealForm'; // Import DealForm
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Import Dialog components
import { useDeleteDeal } from '@/hooks/use-crm'; // Import useDeleteDeal
import { toast } from 'sonner';

export default function Deals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10); 
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>(undefined);

  const { data: deals, isLoading, error, refetch } = useQuery<Deal[]>({
    queryKey: ['crm', 'deals', page, limit],
    queryFn: () => crmApi.deals(page * limit, limit),
    staleTime: 5 * 60 * 1000,
  });

  const deleteDealMutation = useDeleteDeal();

  const filteredDeals = deals?.filter(deal =>
    deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRefresh = () => {
    refetch();
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setIsFormDialogOpen(true);
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteDealMutation.mutateAsync(dealId);
        toast.success('Deal deleted successfully!');
      } catch (err: any) {
        toast.error(`Failed to delete deal: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleViewDeal = (deal: Deal) => {
    console.log('View Deal:', deal);
    // Future: Implement a detailed view dialog/page
  };

  const handleCreateDeal = () => {
    setEditingDeal(undefined);
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setEditingDeal(undefined);
    refetch();
  };

  const handleFormCancel = () => {
    setIsFormDialogOpen(false);
    setEditingDeal(undefined);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="CRM Deals" subtitle="Manage your sales deals">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="CRM Deals" subtitle="Manage your sales deals">
        <ErrorState message="Failed to load deals" onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="CRM Deals" subtitle="Manage your sales deals">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Deals</CardTitle>
                <CardDescription>
                  View and manage your current sales deals.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
                <Button size="sm" onClick={handleCreateDeal}>
                  <Plus className="h-4 w-4 mr-2" /> Add Deal
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Close Date</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No deals found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.name}</TableCell>
                        <TableCell>KES {deal.amount.toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{deal.stage}</Badge></TableCell>
                        <TableCell>{deal.close_date ? format(new Date(deal.close_date), 'MMM d, yyyy') : '-'}</TableCell>
                        <TableCell>{format(new Date(deal.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewDeal(deal)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditDeal(deal)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDeal(deal.id)}>
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
      </div>

      {/* Deal Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingDeal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
            <DialogDescription>
              {editingDeal ? 'Update the details for this deal.' : 'Fill in the details for a new deal.'}
            </DialogDescription>
          </DialogHeader>
          <DealForm
            initialData={editingDeal}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
