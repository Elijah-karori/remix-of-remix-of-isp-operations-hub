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

// Assuming testerCoverage API returns an object or array of coverage data
interface TesterCoverageData {
  module: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  coverage_percentage: number;
  last_run_date: string;
  // Potentially more details like breakdown by test type, etc.
}

const TesterCoverage: React.FC = () => {
  const { data, isLoading, error } = useQuery<TesterCoverageData[], Error>({
    queryKey: ['testerCoverage'],
    queryFn: () => dashboardApi.testerCoverage(),
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
          <AlertDescription>Failed to load tester coverage data: {error.message}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tester Coverage" subtitle="Overview of test coverage across modules.">
      <Card>
        <CardHeader>
          <CardTitle>Module Test Coverage</CardTitle>
          <CardDescription>Detailed breakdown of automated test coverage per application module.</CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Total Tests</TableHead>
                  <TableHead>Passed</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Coverage (%)</TableHead>
                  <TableHead>Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((coverage, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{coverage.module}</TableCell>
                    <TableCell>{coverage.total_tests}</TableCell>
                    <TableCell>{coverage.passed_tests}</TableCell>
                    <TableCell>{coverage.failed_tests}</TableCell>
                    <TableCell>{coverage.coverage_percentage.toFixed(2)}%</TableCell>
                    <TableCell>{new Date(coverage.last_run_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No tester coverage data available.
            </div>
          )}
          <Separator className="my-4" />
          <div className="text-sm text-muted-foreground">
            This data reflects the latest automated test runs.
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TesterCoverage;