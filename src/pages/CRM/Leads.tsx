import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { crmApi } from '@/lib/api/crm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, RefreshCw, Pencil, Trash2, Eye } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Lead } from '@/types/api';
import { format } from 'date-fns';
import { LeadForm } from '@/components/crm/LeadForm'; // Import LeadForm
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Import Dialog components
import { useDeleteLead } from '@/hooks/use-crm'; // Import useDeleteLead
import { toast } from 'sonner';

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10); 
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false); // New state for form dialog
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined); // New state for editing lead

  const { data: leads, isLoading, error, refetch } = useQuery<Lead[]>({
    queryKey: ['crm', 'leads', page, limit],
    queryFn: () => crmApi.leads(page * limit, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const deleteLeadMutation = useDeleteLead(); // Initialize delete mutation

  const filteredLeads = leads?.filter(lead =>
    lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRefresh = () => {
    refetch();
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormDialogOpen(true);
  };

  const handleDeleteLead = async (leadId: number) => {
    if (window.confirm('Are you sure you want to delete this lead?')) { // Simple confirmation
      try {
        await deleteLeadMutation.mutateAsync(leadId);
        toast.success('Lead deleted successfully!');
      } catch (err: any) {
        toast.error(`Failed to delete lead: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleViewLead = (lead: Lead) => {
    // For now, just log. Later, this could open a detailed view dialog.
    console.log('View Lead:', lead);
  };

  const handleCreateLead = () => {
    setEditingLead(undefined); // Clear any editing state
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setEditingLead(undefined);
    refetch(); // Refetch leads after successful save
  };

  const handleFormCancel = () => {
    setIsFormDialogOpen(false);
    setEditingLead(undefined);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="CRM Leads" subtitle="Manage your customer leads">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="CRM Leads" subtitle="Manage your customer leads">
        <ErrorState message="Failed to load leads" onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="CRM Leads" subtitle="Manage your customer leads">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Leads</CardTitle>
                <CardDescription>
                  View and manage your current customer leads.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
                <Button size="sm" onClick={handleCreateLead}>
                  <Plus className="h-4 w-4 mr-2" /> Add Lead
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No leads found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.first_name} {lead.last_name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone || '-'}</TableCell>
                        <TableCell>{lead.company || '-'}</TableCell>
                        <TableCell><Badge variant="outline">{lead.status}</Badge></TableCell>
                        <TableCell>{lead.source || '-'}</TableCell>
                        <TableCell>{format(new Date(lead.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewLead(lead)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditLead(lead)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLead(lead.id)}>
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
            {/* Pagination controls would go here */}
          </CardContent>
        </Card>
      </div>

      {/* Lead Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
            <DialogDescription>
              {editingLead ? 'Update the details for this lead.' : 'Fill in the details for a new lead.'}
            </DialogDescription>
          </DialogHeader>
          <LeadForm
            initialData={editingLead}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}