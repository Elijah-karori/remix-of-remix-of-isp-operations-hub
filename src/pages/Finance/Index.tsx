import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FolderKanban, ReceiptText, CreditCard, FileText, Wallet } from 'lucide-react';

export default function FinanceIndex() {
  return (
    <DashboardLayout title="Financial Management" subtitle="Overview of finance modules">
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold">Welcome to Finance Management</h2>
        <p className="text-muted-foreground">
          Select a module from the sidebar to get started, or click on a card below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/finance/budgets">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budgets</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Financial Budgets</div>
                <p className="text-xs text-muted-foreground">Allocate and track spending</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/finance/invoices">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Handle Invoices</div>
                <p className="text-xs text-muted-foreground">Generate and process invoices</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/finance/accounts">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accounts</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Financial Accounts</div>
                <p className="text-xs text-muted-foreground">Oversee all financial accounts</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/finance/reports">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Generate Financial Reports</div>
                <p className="text-xs text-muted-foreground">Access profitability and ROI reports</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}