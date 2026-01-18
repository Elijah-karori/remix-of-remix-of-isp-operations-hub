import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, RefreshCw, Pencil, Trash2, Eye, FileText, Download, Clock } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Invoice, InvoiceItem } from '@/types/api';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InvoiceForm } from '@/components/finance/InvoiceForm';
import { useDeleteInvoice, useInvoices } from '@/hooks/use-finance';
import { toast } from 'sonner';

// Import jsPDF for client-side PDF generation
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For generating tables in PDF

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10); 

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);

  const { data: invoices, isLoading: isLoadingInvoices, error: invoicesError, refetch: refetchInvoices } = useInvoices(page * limit, limit);
  
  const deleteInvoiceMutation = useDeleteInvoice();

  const filteredInvoices = invoices?.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRefreshInvoices = () => refetchInvoices();

  const handleGenerateInvoice = () => {
    setEditingInvoice(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormDialogOpen(true);
  };

  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this Invoice?')) {
      try {
        await deleteInvoiceMutation.mutateAsync(id);
        toast.success('Invoice deleted successfully!');
      } catch (err: any) {
        toast.error(`Failed to delete invoice: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    console.log('View Invoice:', invoice);
    // Future: Implement a detailed view dialog/page
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setEditingInvoice(undefined);
    refetchInvoices();
  };

  const handleFormCancel = () => {
    setIsFormDialogOpen(false);
    setEditingInvoice(undefined);
  };

  const getStatusBadgeVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Pending': return 'secondary';
      case 'Overdue': return 'destructive';
      case 'Cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const downloadInvoicePdf = (invoice: Invoice) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Invoice #${invoice.invoice_number}`, 14, 20);

    doc.setFontSize(10);
    doc.text(`Customer: ${invoice.customer_name || 'N/A'}`, 14, 30);
    doc.text(`Issue Date: ${format(parseISO(invoice.issue_date), 'MMM d, yyyy')}`, 14, 35);
    doc.text(`Due Date: ${format(parseISO(invoice.due_date), 'MMM d, yyyy')}`, 14, 40);
    doc.text(`Status: ${invoice.status}`, 14, 45);

    // Invoice Items table
    (doc as any).autoTable({
      startY: 55,
      head: [['Description', 'Quantity', 'Unit Price', 'Total']],
      body: invoice.items.map((item: InvoiceItem) => [
        item.description,
        item.quantity,
        `KES ${item.unit_price.toLocaleString()}`,
        `KES ${(item.quantity * item.unit_price).toLocaleString()}`
      ]),
      foot: [['', '', 'Total Amount', `KES ${invoice.total_amount.toLocaleString()}`]],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      footStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    doc.save(`invoice_${invoice.invoice_number}.pdf`);
    toast.success('Invoice PDF downloaded!');
  };

  if (isLoadingInvoices) {
    return (
      <DashboardLayout title="Financial Invoices" subtitle="Generate and process invoices">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (invoicesError) {
    return (
      <DashboardLayout title="Financial Invoices" subtitle="Generate and process invoices">
        <ErrorState message="Failed to load invoices" onRetry={refetchInvoices} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Financial Invoices" subtitle="Generate and process invoices">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>Manage your customer invoices.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefreshInvoices}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
                <Button size="sm" onClick={handleGenerateInvoice}>
                  <Plus className="h-4 w-4 mr-2" /> Generate Invoice
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.customer_name || '-'}</TableCell>
                        <TableCell>{format(parseISO(invoice.issue_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{format(parseISO(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          {invoice.currency} {invoice.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(invoice)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditInvoice(invoice)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => downloadInvoicePdf(invoice)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteInvoice(invoice.id)}>
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

      {/* Invoice Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[800px]"> {/* Wider dialog for invoice form */}
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Generate New Invoice'}</DialogTitle>
            <DialogDescription>
              {editingInvoice ? 'Update the details for this invoice.' : 'Fill in the details to generate a new invoice.'}
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm
            initialData={editingInvoice}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
