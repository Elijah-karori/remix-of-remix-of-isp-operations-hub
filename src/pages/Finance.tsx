import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Send,
  CheckCircle,
  Clock,
  Smartphone,
  FileText,
  Plus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  useInfrastructureProfitability,
  useOverdueInvoices,
  useMpesaTransactions,
  useCheckMpesaBalance,
} from "@/hooks/use-finance";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useState } from "react";
import { toast } from "sonner";

const infrastructureColors: Record<string, string> = {
  "Fiber": "hsl(173, 80%, 40%)",
  "Wireless": "hsl(142, 76%, 36%)",
  "PPOE": "hsl(38, 92%, 50%)",
  "Hotspot": "hsl(262, 83%, 58%)",
  "fiber": "hsl(173, 80%, 40%)",
  "wireless": "hsl(142, 76%, 36%)",
  "ppoe": "hsl(38, 92%, 50%)",
  "hotspot": "hsl(262, 83%, 58%)",
};

export default function Finance() {
  const { data: profitabilityData, isLoading: profitabilityLoading, error: profitabilityError } = useInfrastructureProfitability();
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useMpesaTransactions({ limit: 10 });
  const { data: invoicesData, isLoading: invoicesLoading, error: invoicesError } = useOverdueInvoices();
  const { data: mpesaBalanceData, isLoading: mpesaBalanceLoading, error: mpesaBalanceError } = useCheckMpesaBalance();
  
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number, precision = 2) => {
    if (!amount && amount !== 0) return "KES 0";
    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(precision)}M`;
    }
    if (amount >= 1000) {
      return `KES ${(amount / 1000).toFixed(precision)}K`;
    }
    return `KES ${amount.toLocaleString()}`;
  };

  // Transform infrastructure profitability data
  const infrastructureProfitability = Array.isArray(profitabilityData) 
    ? profitabilityData.map(item => ({
        name: item.infrastructure_type,
        profit: item.revenue - item.cost,
        revenue: item.revenue,
        cost: item.cost,
        profit_margin: item.profit_margin,
        color: infrastructureColors[item.infrastructure_type] || "hsl(210, 40%, 96.1%)"
      }))
    : [];

  const recentTransactions = (transactionsData || []).slice(0, 5);
  const pendingInvoices = (invoicesData || []).slice(0, 5);
  const mpesaBalance = typeof mpesaBalanceData === 'number' ? mpesaBalanceData : 0;

  // Calculate stats from available data
  const totalRevenue = infrastructureProfitability.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalProfit = infrastructureProfitability.reduce((sum, item) => sum + (item.profit || 0), 0);

  const handleSendInvoice = (invoiceId: number) => {
    toast.info(`Sending invoice ${invoiceId}...`);
  };

  // Determine transaction type based on transaction_type field
  const getTransactionType = (tx: any) => {
    const type = tx.transaction_type?.toLowerCase() || '';
    if (type.includes('b2c') || type.includes('payout') || type.includes('payment')) return 'expense';
    return 'income';
  };

  return (
    <DashboardLayout title="Finance" subtitle="Revenue, expenses & payments">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass border-primary/20 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue, 1)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">From infrastructure</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-success/20 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalProfit, 1)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Infrastructure profit</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-warning/20 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Invoices</p>
                <p className="text-3xl font-bold text-foreground">{pendingInvoices.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-sm text-warning">Overdue</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <Receipt className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-chart-4/20 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">M-Pesa Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  {mpesaBalanceLoading ? "..." : mpesaBalanceError ? "Error" : formatCurrency(mpesaBalance, 0)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">
                    {recentTransactions.length} recent transactions
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-chart-4/10">
                <Smartphone className="w-6 h-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Infrastructure Profitability Chart */}
            <Card className="glass lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Infrastructure Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {profitabilityLoading ? <LoadingSkeleton variant="chart" /> : profitabilityError ? <ErrorState message="Failed to load chart" /> : infrastructureProfitability.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No profitability data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={infrastructureProfitability}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="profit"
                          nameKey="name"
                        >
                          {infrastructureProfitability.map((entry, index) => (
                            <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 13%)",
                            border: "1px solid hsl(217, 33%, 20%)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`KES ${value.toLocaleString()}`, "Profit"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* By Infrastructure */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">By Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profitabilityLoading ? (
                    <LoadingSkeleton variant="list" count={4} />
                  ) : infrastructureProfitability.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No infrastructure data
                    </div>
                  ) : (
                    infrastructureProfitability.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(item.profit, 1)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {item.profit_margin?.toFixed(1)}% margin
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => setActiveTab("transactions")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactionsLoading ? <LoadingSkeleton variant="list" count={5} /> : transactionsError ? <ErrorState message="Failed to load transactions" /> : recentTransactions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No recent transactions
                  </div>
                ) : (
                  recentTransactions.map((tx: any) => {
                    const txType = getTransactionType(tx);
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            txType === "income" ? "bg-success/20" : "bg-destructive/20"
                          )}
                        >
                          {txType === "income" ? (
                            <ArrowUpRight className="w-5 h-5 text-success" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tx.description || tx.mpesa_receipt_number || tx.reference || "Transaction"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{tx.transaction_type || "Payment"}</span>
                            <span>•</span>
                            <span>{new Date(tx.transaction_date || tx.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              txType === "income" ? "text-success" : "text-destructive"
                            )}
                          >
                            {txType === "income" ? "+" : "-"}KES {Math.abs(tx.amount).toLocaleString()}
                          </span>
                          <Badge
                            className={cn(
                              "ml-2 text-xs",
                              tx.status === "completed" || tx.status === "success"
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            )}
                          >
                            {tx.status || "pending"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Overdue Invoices</CardTitle>
                <Button className="gradient-primary text-primary-foreground" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoicesLoading ? <LoadingSkeleton variant="list" count={3} /> : invoicesError ? <ErrorState message="Failed to load invoices" /> : pendingInvoices.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No overdue invoices
                  </div>
                ) : (
                  pendingInvoices.map((invoice: any) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning/20">
                        <FileText className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {invoice.customer_name || `Invoice #${invoice.invoice_number}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">
                          KES {invoice.total_amount?.toLocaleString() || 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleSendInvoice(invoice.id)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>All M-Pesa Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? <LoadingSkeleton variant="table" count={10} /> : transactionsError ? <ErrorState message="Failed to load transactions" /> : (
                <div className="space-y-3">
                  {(transactionsData || []).map((tx: any) => {
                    const txType = getTransactionType(tx);
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            txType === "income" ? "bg-success/20" : "bg-destructive/20"
                          )}
                        >
                          {txType === "income" ? (
                            <ArrowUpRight className="w-5 h-5 text-success" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tx.description || tx.mpesa_receipt_number || tx.reference || "Transaction"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{tx.transaction_type || "Payment"}</span>
                            <span>•</span>
                            <span>{tx.phone_number}</span>
                            <span>•</span>
                            <span>{new Date(tx.transaction_date || tx.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              txType === "income" ? "text-success" : "text-destructive"
                            )}
                          >
                            {txType === "income" ? "+" : "-"}KES {Math.abs(tx.amount).toLocaleString()}
                          </span>
                          <Badge
                            className={cn(
                              "ml-2 text-xs",
                              tx.status === "completed" || tx.status === "success"
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            )}
                          >
                            {tx.status || "pending"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? <LoadingSkeleton variant="table" count={5} /> : invoicesError ? <ErrorState message="Failed to load invoices" /> : (
                <div className="space-y-3">
                  {(invoicesData || []).map((invoice: any) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning/20">
                        <FileText className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {invoice.customer_name || `Invoice #${invoice.invoice_number}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Invoice #{invoice.invoice_number} • Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-foreground">
                          {invoice.currency || 'KES'} {invoice.total_amount?.toLocaleString() || 0}
                        </span>
                        <Badge variant="destructive" className="ml-2">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
