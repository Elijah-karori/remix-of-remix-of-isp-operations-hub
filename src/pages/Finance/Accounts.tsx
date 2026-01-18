import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, RefreshCw, Pencil, Trash2, CreditCard, DollarSign } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { FinancialAccount } from '@/types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FinancialAccountForm } from '@/components/finance/FinancialAccountForm';
import { useDeleteFinancialAccount, useFinancialAccounts } from '@/hooks/use-finance';
import { toast } from 'sonner';

export default function Accounts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10); 

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | undefined>(undefined);

  const { data: accounts, isLoading: isLoadingAccounts, error: accountsError, refetch: refetchAccounts } = useFinancialAccounts(page * limit, limit);
  
  const deleteAccountMutation = useDeleteFinancialAccount();

  const filteredAccounts = accounts?.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.currency.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRefreshAccounts = () => refetchAccounts();

  const handleCreateAccount = () => {
    setEditingAccount(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditAccount = (account: FinancialAccount) => {
    setEditingAccount(account);
    setIsFormDialogOpen(true);
  };

  const handleDeleteAccount = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this Financial Account?')) {
      try {
        await deleteAccountMutation.mutateAsync(id);
        toast.success('Financial Account deleted successfully!');
      } catch (err: any) {
        toast.error(`Failed to delete financial account: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setEditingAccount(undefined);
    refetchAccounts();
  };

  const handleFormCancel = () => {
    setIsFormDialogOpen(false);
    setEditingAccount(undefined);
  };

  if (isLoadingAccounts) {
    return (
      <DashboardLayout title="Financial Accounts" subtitle="Oversee all financial accounts">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (accountsError) {
    return (
      <DashboardLayout title="Financial Accounts" subtitle="Oversee all financial accounts">
        <ErrorState message="Failed to load financial accounts" onRetry={refetchAccounts} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Financial Accounts" subtitle="Oversee all financial accounts">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Financial Accounts</CardTitle>
                <CardDescription>Manage your bank accounts, cash, and other financial instruments.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefreshAccounts}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
                <Button size="sm" onClick={handleCreateAccount}>
                  <Plus className="h-4 w-4 mr-2" /> Add Account
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
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
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No financial accounts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-right">
                          {account.balance.toLocaleString()}
                        </TableCell>
                        <TableCell>{account.currency}</TableCell>
                        <TableCell>
                          <Badge variant={account.is_active ? 'default' : 'secondary'}>
                            {account.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditAccount(account)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)}>
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

      {/* Financial Account Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Financial Account' : 'Add New Financial Account'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Update the details for this financial account.' : 'Fill in the details for a new financial account.'}
            </DialogDescription>
          </DialogHeader>
          <FinancialAccountForm
            initialData={editingAccount}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
