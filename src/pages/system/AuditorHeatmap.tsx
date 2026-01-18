import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

// Assuming auditorHeatmap API returns an object or array of heatmap data
// For simplicity, let's assume it returns an array of objects, where each object represents
// an area/module and its associated "risk score" or "audit frequency"
interface AuditorHeatmapData {
  area: string; // e.g., "Authentication", "Finance", "Projects"
  risk_score: number; // A score from 0-100 indicating audit necessity
  last_audited: string; // Date of last audit
  audit_frequency_days: number; // Recommended audit frequency in days
  // Potentially more details
}

const AuditorHeatmap: React.FC = () => {
  const { data, isLoading, error } = useQuery<AuditorHeatmapData[], Error>({
    queryKey: ['auditorHeatmap'],
    queryFn: () => dashboardApi.auditorHeatmap(),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load auditor heatmap data: {error.message}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const getRiskColor = (score: number): string => {
    if (score > 75) return 'bg-red-100 text-red-800';
    if (score > 50) return 'bg-orange-100 text-orange-800';
    if (score > 25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <DashboardLayout title="Auditor Heatmap" subtitle="Visualize audit risk and frequency across system areas.">
      <Card>
        <CardHeader>
          <CardTitle>System Area Risk Overview</CardTitle>
          <CardDescription>Identifies areas requiring more frequent auditing based on risk scores.</CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Risk Score (0-100)</TableHead>
                  <TableHead>Last Audited</TableHead>
                  <TableHead>Audit Frequency (Days)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index} className={getRiskColor(item.risk_score)}>
                    <TableCell className="font-medium">{item.area}</TableCell>
                    <TableCell>{item.risk_score}</TableCell>
                    <TableCell>{new Date(item.last_audited).toLocaleDateString()}</TableCell>
                    <TableCell>{item.audit_frequency_days}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No auditor heatmap data available.
            </div>
          )}
          <Separator className="my-4" />
          <div className="text-sm text-muted-foreground">
            Higher risk scores indicate areas that may require more immediate attention or frequent audits.
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AuditorHeatmap;
