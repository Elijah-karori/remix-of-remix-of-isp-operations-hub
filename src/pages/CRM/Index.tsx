import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { UserCircle, DollarSign, ListTodo } from 'lucide-react';

export default function CRMIndex() {
  return (
    <DashboardLayout title="Customer Relationship Management" subtitle="Overview of CRM modules">
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold">Welcome to CRM</h2>
        <p className="text-muted-foreground">
          Select a module from the sidebar to get started.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/crm/leads">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads</CardTitle>
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage Customer Leads</div>
                <p className="text-xs text-muted-foreground">Track potential customers</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/crm/deals">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deals</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Track Sales Deals</div>
                <p className="text-xs text-muted-foreground">Monitor sales opportunities</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/crm/activities">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activities</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Log Interactions</div>
                <p className="text-xs text-muted-foreground">Record customer activities</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
