import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, FileText, Download, Calendar as CalendarIcon, LineChart } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { InfrastructureProfitabilityResponse, ProfitabilityReportResponse } from '@/types/api';
import { format, subYears } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import {
  useInfrastructureProfitability,
  useGenerateProfitabilityReport,
  useMonthlyProfit
} from '@/hooks/use-finance';
import { toast } from 'sonner';

// For PDF generation
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subYears(new Date(), 1), // Default to last year
    to: new Date(),
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const {
    data: infrastructureProfitability,
    isLoading: isLoadingInfraProfit,
    error: infraProfitError,
    refetch: refetchInfraProfit,
  } = useInfrastructureProfitability(
    dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
  );

  const {
    data: monthlyProfit,
    isLoading: isLoadingMonthlyProfit,
    error: monthlyProfitError,
    refetch: refetchMonthlyProfit,
  } = useMonthlyProfit(selectedYear, selectedMonth);

  const generateProfitabilityReportMutation = useGenerateProfitabilityReport();
  const [generatedReport, setGeneratedReport] = useState<ProfitabilityReportResponse | null>(null);

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a valid date range for the report.');
      return;
    }
    try {
      toast.info('Generating profitability report...');
      const reportData = await generateProfitabilityReportMutation.mutateAsync({
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
      });
      setGeneratedReport(reportData);
      toast.success('Profitability Report generated!');
    } catch (err: any) {
      toast.error(`Failed to generate report: ${err.message || 'Unknown error'}`);
    }
  };

  const handleRefreshAllReports = () => {
    refetchInfraProfit();
    refetchMonthlyProfit();
    // No direct refetch for generatedReport as it's a mutation result
    toast.info('Refreshing report data...');
  };

  const downloadProfitabilityPdf = (report: ProfitabilityReportResponse) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Profitability Report', 14, 20);

    doc.setFontSize(10);
    doc.text(`Period: ${dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : ''} - ${dateRange?.to ? format(dateRange.to, 'MMM d, yyyy') : ''}`, 14, 30);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 14, 35);

    (doc as any).autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `KES ${report.total_revenue?.toLocaleString() ?? '0'}`],
        ['Total Cost', `KES ${report.total_cost?.toLocaleString() ?? '0'}`],
        ['Gross Profit', `KES ${report.gross_profit?.toLocaleString() ?? '0'}`],
        ['Net Profit', `KES ${report.net_profit?.toLocaleString() ?? '0'}`],
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      footStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    // Add detailed sections if available in report.details
    if (report.details && report.details.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Detailed Breakdown', 14, 20);
      (doc as any).autoTable({
        startY: 30,
        head: [Object.keys(report.details[0])], // Assumes all detail objects have same keys
        body: report.details.map(row => Object.values(row).map(val => typeof val === 'number' ? val.toLocaleString() : val)),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      });
    }

    doc.save(`Profitability_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
    toast.success('Profitability Report PDF downloaded!');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12

  if (isLoadingInfraProfit || isLoadingMonthlyProfit) {
    return (
      <DashboardLayout title="Financial Reports" subtitle="Access profitability and ROI reports">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (infraProfitError || monthlyProfitError) {
    return (
      <DashboardLayout title="Financial Reports" subtitle="Access profitability and ROI reports">
        <ErrorState message="Failed to load reports" onRetry={handleRefreshAllReports} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Financial Reports" subtitle="Access profitability and ROI reports">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generate Profitability Report</CardTitle>
                <CardDescription>Select a date range to generate a comprehensive financial profitability report.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefreshAllReports}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                </Button>
                <Button size="sm" onClick={handleGenerateReport} disabled={generateProfitabilityReportMutation.isPending || !dateRange?.from || !dateRange?.to}>
                  {generateProfitabilityReportMutation.isPending ? 'Generating...' : 'Generate Report'}
                </Button>
                {generatedReport && (
                  <Button variant="outline" size="sm" onClick={() => downloadProfitabilityPdf(generatedReport)}>
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!dateRange?.from && "text-muted-foreground"
                      }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {generatedReport && (
              <div className="mt-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-2">Generated Report Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold">KES {generatedReport.total_revenue?.toLocaleString() ?? '0'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Cost</p>
                    <p className="text-xl font-bold">KES {generatedReport.total_cost?.toLocaleString() ?? '0'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gross Profit</p>
                    <p className="text-xl font-bold text-green-600">KES {generatedReport.gross_profit?.toLocaleString() ?? '0'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Net Profit</p>
                    <p className="text-xl font-bold text-green-600">KES {generatedReport.net_profit?.toLocaleString() ?? '0'}</p>
                  </div>
                </div>
                {/* Add detailed breakdown if report.details exists */}
                {generatedReport.details && generatedReport.details.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-muted-foreground mb-2">Detailed Breakdown</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {/* Assuming all detail objects have same keys */}
                          {Object.keys(generatedReport.details[0]).map(key => (
                            <TableHead key={key}>{key.replace(/_/g, ' ')}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedReport.details.map((row, idx) => (
                          <TableRow key={idx}>
                            {Object.values(row).map((val, valIdx) => (
                              <TableCell key={valIdx}>{typeof val === 'number' ? val?.toLocaleString() : (val ?? '-')}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Infrastructure Profitability */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Infrastructure Profitability</CardTitle>
              <CardDescription>Profitability by infrastructure type over the selected period.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refetchInfraProfit}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingInfraProfit ? (
              <LoadingSkeleton variant="inline" count={3} />
            ) : infrastructureProfitability && infrastructureProfitability.length > 0 ? (
              <div className="space-y-4">
                {infrastructureProfitability.map((item, index) => (
                  <Card key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <LineChart className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{item.infrastructure_type}</p>
                        <p className="text-sm text-muted-foreground">Revenue: KES {item.revenue?.toLocaleString() ?? '0'} | Cost: KES {item.cost?.toLocaleString() ?? '0'}</p>
                      </div>
                    </div>
                    <Badge variant={item.profit_margin >= 0 ? 'default' : 'destructive'}>
                      {item.profit_margin.toFixed(2)}% Profit
                    </Badge>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No infrastructure profitability data for the selected period.</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Monthly Profit</CardTitle>
              <CardDescription>View profit for a specific month and year.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month.toString()}>{format(new Date(currentYear, month - 1, 1), 'MMM')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={refetchMonthlyProfit}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMonthlyProfit ? (
              <LoadingSkeleton variant="inline" count={1} />
            ) : monthlyProfitError ? (
              <ErrorState message="Failed to load monthly profit" onRetry={refetchMonthlyProfit} />
            ) : monthlyProfit !== undefined ? (
              <p className="text-3xl font-bold">KES {monthlyProfit?.toLocaleString() ?? '0'}</p>
            ) : (
              <p className="text-muted-foreground">No data for selected month.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}