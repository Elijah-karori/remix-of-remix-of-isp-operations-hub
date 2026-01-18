import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useInventoryValuation, useInventoryTurnoverAnalysis, useInventoryDeadStock, useSpendingTrends } from "@/hooks/use-inventory"; // Import useSpendingTrends
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, TrendingUp, TrendingDown, PackageMinus, Scale, DollarSign, History } from "lucide-react"; // Added DollarSign, History
import { toast } from "sonner";
import { format } from "date-fns";

export default function AnalyticsTab() {
  const { data: valuation, isLoading: valuationLoading, error: valuationError, refetch: refetchValuation } = useInventoryValuation();
  const { data: turnover, isLoading: turnoverLoading, error: turnoverError, refetch: refetchTurnover } = useInventoryTurnoverAnalysis();
  const { data: deadStock, isLoading: deadStockLoading, error: deadStockError, refetch: refetchDeadStock } = useInventoryDeadStock();
  const { data: spendingTrends, isLoading: spendingTrendsLoading, error: spendingTrendsError, refetch: refetchSpendingTrends } = useSpendingTrends();


  const handleRefreshAll = () => {
    toast.info("Refreshing all analytics data...");
    refetchValuation();
    refetchTurnover();
    refetchDeadStock();
    refetchSpendingTrends(); // Refresh spending trends
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inventory Analytics Overview</h2>
        <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={valuationLoading || turnoverLoading || deadStockLoading || spendingTrendsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${valuationLoading || turnoverLoading || deadStockLoading || spendingTrendsLoading ? "animate-spin" : ""}`} />
          Refresh All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Changed to lg:grid-cols-4 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Valuation</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {valuationLoading ? (
              <LoadingSkeleton variant="stat" count={1} />
            ) : valuationError ? (
              <ErrorState message="Failed to load valuation" onRetry={refetchValuation} />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(valuation?.total_value || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Across {valuation?.total_products || 0} products
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate (90 Days)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {turnoverLoading ? (
              <LoadingSkeleton variant="stat" count={1} />
            ) : turnoverError ? (
              <ErrorState message="Failed to load turnover" onRetry={refetchTurnover} />
            ) : (
              <>
                <div className="text-2xl font-bold">{turnover?.turnover_rate?.toFixed(2) || 0}x</div>
                <p className="text-xs text-muted-foreground">
                  Average inventory turnover
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dead Stock Value</CardTitle>
            <PackageMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {deadStockLoading ? (
              <LoadingSkeleton variant="stat" count={1} />
            ) : deadStockError ? (
              <ErrorState message="Failed to load dead stock" onRetry={refetchDeadStock} />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(deadStock?.total_dead_stock_value || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {deadStock?.dead_stock_items?.length || 0} items identified as dead stock
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Spending Trends Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Spending Trends (90 Days)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {spendingTrendsLoading ? (
              <LoadingSkeleton variant="stat" count={1} />
            ) : spendingTrendsError ? (
              <ErrorState message="Failed to load spending trends" onRetry={refetchSpendingTrends} />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(spendingTrends?.total_spent || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Average monthly spend: {formatCurrency(spendingTrends?.average_monthly_spend || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports for Turnover, Dead Stock, Spending Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Turnover Breakdown</CardTitle>
            <CardDescription>Detailed look at product turnover rates.</CardDescription>
          </CardHeader>
          <CardContent>
            {turnoverLoading ? (
              <LoadingSkeleton variant="table" count={3} />
            ) : turnoverError ? (
              <ErrorState message="Failed to load turnover breakdown" onRetry={refetchTurnover} />
            ) : turnover?.items && turnover.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Turnover Ratio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turnover.items.map((item: any) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="text-right">{item.turnover_ratio?.toFixed(2) || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No turnover data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dead Stock Items</CardTitle>
            <CardDescription>Products identified as having no sales over a period.</CardDescription>
          </CardHeader>
          <CardContent>
            {deadStockLoading ? (
              <LoadingSkeleton variant="table" count={3} />
            ) : deadStockError ? (
              <ErrorState message="Failed to load dead stock items" onRetry={refetchDeadStock} />
            ) : deadStock?.dead_stock_items && deadStock.dead_stock_items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deadStock.dead_stock_items.map((item: any) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total_value || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No dead stock items identified.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2"> {/* Full width card */}
          <CardHeader>
            <CardTitle>Spending Trends Breakdown</CardTitle>
            <CardDescription>Monthly or supplier-wise spending trends.</CardDescription>
          </CardHeader>
          <CardContent>
            {spendingTrendsLoading ? (
              <LoadingSkeleton variant="table" count={3} />
            ) : spendingTrendsError ? (
              <ErrorState message="Failed to load spending trends breakdown" onRetry={refetchSpendingTrends} />
            ) : spendingTrends?.items && spendingTrends.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group (e.g., Supplier/Month)</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Items Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spendingTrends.items.map((item: any) => (
                    <TableRow key={item.group_id || item.month || item.supplier_id}>
                      <TableCell className="font-medium">{item.group_name || item.month || item.supplier_name || 'N/A'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total_spent || 0)}</TableCell>
                      <TableCell className="text-right">{item.items_count || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No spending trends data available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2"> {/* Full width card */}
          <CardHeader>
            <CardTitle>Product Price History</CardTitle>
            <CardDescription>View historical price changes for products.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Price history data can be viewed for individual products. Select a product in the Products tab to see its price history.
            </p>
            <Button variant="outline" size="sm" className="mt-4">
                <History className="h-4 w-4 mr-2" /> View Product Price History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}