import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Budgets() {
  return (
    <DashboardLayout title="Financial Budgets" subtitle="Allocate and track spending">
      <div className="container mx-auto py-6">
        <h2 className="text-2xl font-bold">Budget Management</h2>
        <p className="text-muted-foreground mt-2">
          This page is under construction. Coming soon! Manage Master and Sub Budgets here.
        </p>
      </div>
    </DashboardLayout>
  );
}