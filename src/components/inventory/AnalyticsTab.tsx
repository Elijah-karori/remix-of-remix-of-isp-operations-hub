import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useInventoryValuation, useInventoryTurnoverAnalysis, useInventoryDeadStock } from "@/hooks/use-inventory";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, PackageMinus, Scale } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsTab() {
  const { data: valuation, isLoading: valuationLoading, error: valuationError, refetch: refetchValuation } = useInventoryValuation();
  const { data: turnover, isLoading: turnoverLoading, error: turnoverError, refetch: refetchTurnover } = useInventoryTurnoverAnalysis();
  const { data: deadStock, isLoading: deadStockLoading, error: deadStockError, refetch: refetchDeadStock } = useInventoryDeadStock();

  const handleRefreshAll = () => {
    toast.info("Refreshing all analytics data...");
    refetchValuation();
    refetchTurnover();
    refetchDeadStock();
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inventory Analytics Overview</h2>
        <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={valuationLoading || turnoverLoading || deadStockLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${valuationLoading || turnoverLoading || deadStockLoading ? "animate-spin" : ""}`} />
          Refresh All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Valuation</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {valuationLoading ? (
              <LoadingSkeleton variant="text" className="h-8 w-3/4" />
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
              <LoadingSkeleton variant="text" className="h-8 w-3/4" />
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
              <LoadingSkeleton variant="text" className="h-8 w-3/4" />
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
      </div>

      {/* Placeholder for more detailed analytics like charts or tables */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
          <CardDescription>Further insights and customizable reports coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            More detailed inventory reports and charts will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}