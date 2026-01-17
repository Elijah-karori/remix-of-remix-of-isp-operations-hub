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
  useFinancialSnapshot,
  useInfrastructureProfitability,
  useRecentTransactions,
  useOverdueInvoices,
  usePendingVariances,
  useMpesaBalance,
} from "@/hooks/use-finance";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { MpesaTransactionOut, BOMVarianceOut } from "@/types/api";
import { useState } from "react";
import { toast } from "sonner";

// Define proper types based on your API responses
interface FinancialSnapshot {
  total_revenue: number;
  net_profit: number;
  pending_payments: number;
  overdue_invoices_count: number;
  revenue_change_percentage: number;
  profit_change_percentage: number;
  profit_margin: number;
  revenue_profit_trend: Array<{
    month: string;
    revenue: number;
    profit: number;
  }>;
}

interface InfrastructureProfitabilityItem {
  name: string;
  profit: number;
}

interface Invoice {
  id: number;
  customer_name: string;
  project_name: string;
  amount: number;
  due_date: string;
  days_overdue: number;
}

interface MpesaBalance {
  WorkingAccount?: number;
  UtilityAccount?: number;
  OrganizationAccount?: number;
  balance?: number;
  [key: string]: any;
}

const infrastructureColors: Record<string, string> = {
  "Fiber": "hsl(173, 80%, 40%)",
  "Wireless": "hsl(142, 76%, 36%)",
  "PPOE": "hsl(38, 92%, 50%)",
  "Hotspot": "hsl(262, 83%, 58%)",
};

export default function Finance() {
  const { data: snapshotData, isLoading: snapshotLoading, error: snapshotError } = useFinancialSnapshot();
  const { data: profitabilityData, isLoading: profitabilityLoading, error: profitabilityError } = useInfrastructureProfitability();
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useRecentTransactions(10);
  const { data: invoicesData, isLoading: invoicesLoading, error: invoicesError } = useOverdueInvoices();
  const { data: variancesData, isLoading: variancesLoading, error: variancesError } = usePendingVariances();
  const { data: mpesaBalanceData, isLoading: mpesaBalanceLoading, error: mpesaBalanceError } = useMpesaBalance();
  
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

  // Type assertions for API responses
  const financialSnapshot = snapshotData as unknown as FinancialSnapshot;
  const revenueData = financialSnapshot?.revenue_profit_trend || [];
  
  // Type and transform infrastructure profitability data
  const infrastructureProfitability = Array.isArray(profitabilityData) 
    ? (profitabilityData as InfrastructureProfitabilityItem[]).map(item => ({
        ...item,
        color: infrastructureColors[item.name] || "hsl(210, 40%, 96.1%)"
      }))
    : [];

  const recentTransactions = (transactionsData as MpesaTransactionOut[] || []).slice(0, 5);
  const pendingInvoices = (invoicesData as Invoice[]) || [];
  const pendingVariances = (variancesData as BOMVarianceOut[] || []).slice(0, 5);
  const mpesaBalance = mpesaBalanceData as MpesaBalance;

  const handleSendInvoice = (invoiceId: number) => {
    // Implement invoice sending logic
    toast.info(`Sending invoice ${invoiceId}...`);
  };

  const handleApproveVariance = (varianceId: number, approved: boolean) => {
    // Implement variance approval logic
    toast.info(`${approved ? 'Approving' : 'Rejecting'} variance ${varianceId}...`);
  };

  // Helper function to get M-Pesa balance
  const getMpesaBalance = () => {
    if (!mpesaBalance) return 0;
    // Try different possible response formats
    if (mpesaBalance.WorkingAccount !== undefined) return mpesaBalance.WorkingAccount;
    if (mpesaBalance.balance !== undefined) return mpesaBalance.balance;
    if (mpesaBalance.available_balance !== undefined) return mpesaBalance.available_balance;
    return 0;
  };

  return (
    <DashboardLayout title="Finance" subtitle="Revenue, expenses & payments">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {snapshotLoading ? <LoadingSkeleton variant="stat" count={4} /> : snapshotError ? <ErrorState message="Failed to load stats" /> : (
          <>
            <Card className="glass border-primary/20 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(financialSnapshot?.total_revenue || 0, 1)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm text-success">+{(financialSnapshot?.revenue_change_percentage || 0).toFixed(1)}%</span>
                      <span className="text-sm text-muted-foreground">vs last month</span>
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
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(financialSnapshot?.net_profit || 0, 1)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm text-success">+{(financialSnapshot?.profit_change_percentage || 0).toFixed(1)}%</span>
                      <span className="text-sm text-muted-foreground">margin {(financialSnapshot?.profit_margin || 0).toFixed(1)}%</span>
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
                    <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(financialSnapshot?.pending_payments || 0, 0)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="text-sm text-warning">{financialSnapshot?.overdue_invoices_count || 0} invoices</span>
                      <span className="text-sm text-muted-foreground">overdue</span>
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
                      {mpesaBalanceLoading ? "..." : mpesaBalanceError ? "Error" : formatCurrency(getMpesaBalance(), 0)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-success">
                        {recentTransactions.filter(tx => tx.type === 'income').length} in
                      </span>
                      <span className="text-sm text-muted-foreground">|</span>
                      <span className="text-sm text-destructive">
                        {recentTransactions.filter(tx => tx.type === 'expense').length} out
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-chart-4/10">
                    <Smartphone className="w-6 h-6 text-chart-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
          <TabsTrigger value="variances">Variances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="glass lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Revenue & Profit Trend</CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Profit</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {snapshotLoading ? <LoadingSkeleton variant="chart" /> : snapshotError ? <ErrorState message="Failed to load chart" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                        <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                        <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 13%)",
                            border: "1px solid hsl(217, 33%, 20%)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`KES ${(value / 1000000).toFixed(2)}M`, ""]}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(173, 80%, 40%)" fill="url(#revenueGrad)" strokeWidth={2} />
                        <Area type="monotone" dataKey="profit" stroke="hsl(142, 76%, 36%)" fill="url(#profitGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Infrastructure Profitability */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">By Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 mb-4">
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
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="profit"
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
                          formatter={(value: number) => [`KES ${(value / 1000000).toFixed(2)}M`, "Profit"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="space-y-3">
                  {infrastructureProfitability.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No infrastructure data
                    </div>
                  ) : (
                    infrastructureProfitability.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(item.profit, 1)}
                        </span>
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
                  recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          tx.type === "income" ? "bg-success/20" : "bg-destructive/20"
                        )}
                      >
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.description || tx.receipt_number || "Transaction"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{tx.transaction_type || "Payment"}</span>
                          <span>•</span>
                          <span>{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            tx.type === "income" ? "text-success" : "text-destructive"
                          )}
                        >
                          {tx.type === "income" ? "+" : "-"}KES {Math.abs(tx.amount).toLocaleString()}
                        </span>
                        <Badge
                          className={cn(
                            "ml-2 text-xs",
                            tx.status === "completed"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          )}
                        >
                          {tx.status || "pending"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Pending Invoices</CardTitle>
                <Button className="gradient-primary text-primary-foreground" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoicesLoading ? <LoadingSkeleton variant="list" count={3} /> : invoicesError ? <ErrorState message="Failed to load invoices" /> : pendingInvoices.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No pending invoices
                  </div>
                ) : (
                  pendingInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          invoice.days_overdue > 0 ? "bg-destructive/20" : "bg-primary/20"
                        )}
                      >
                        <FileText
                          className={cn(
                            "w-5 h-5",
                            invoice.days_overdue > 0 ? "text-destructive" : "text-primary"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{invoice.customer_name || "Unknown Customer"}</p>
                        <p className="text-sm text-muted-foreground truncate">{invoice.project_name || "No Project"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          KES {invoice.amount.toLocaleString()}
                        </p>
                        {invoice.days_overdue > 0 ? (
                          <Badge className="bg-destructive/10 text-destructive text-xs">
                            {invoice.days_overdue}d overdue
                          </Badge>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Due {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleSendInvoice(invoice.id)}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Variances Tab */}
        <TabsContent value="variances">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Variances</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Budget variances requiring approval
                </p>
              </div>
              <Badge className="bg-warning/10 text-warning">
                {pendingVariances.length} Pending
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {variancesLoading ? <LoadingSkeleton variant="list" count={2} /> : variancesError ? <ErrorState message="Failed to load variances" /> : pendingVariances.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No pending variances
                </div>
              ) : (
                pendingVariances.map((variance) => (
                  <div
                    key={variance.id}
                    className="p-4 rounded-xl bg-secondary/30 border border-warning/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{variance.item_name || "Unnamed Item"}</h4>
                        <p className="text-sm text-muted-foreground">Task ID: {variance.task_id}</p>
                      </div>
                      <Badge className="bg-warning/10 text-warning capitalize">{variance.variance_type || "variance"}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Budgeted Cost</p>
                        <p className="font-semibold text-foreground">
                          KES {variance.budgeted_cost.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Actual Cost</p>
                        <p className="font-semibold text-foreground">
                          KES {variance.actual_cost.toLocaleString()}
                        </p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-lg",
                        variance.variance_amount >= 0 ? "bg-destructive/10" : "bg-success/10"
                      )}>
                        <p className="text-xs text-muted-foreground mb-1">Variance</p>
                        <p className={cn(
                          "font-semibold",
                          variance.variance_amount >= 0 ? "text-destructive" : "text-success"
                        )}>
                          {variance.variance_amount >= 0 ? "+" : "-"}KES {Math.abs(variance.variance_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 mb-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Reason:</span> {variance.notes || "No reason provided"}
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleApproveVariance(variance.id, false)}
                      >
                        Reject
                      </Button>
                      <Button 
                        className="bg-success hover:bg-success/90 text-success-foreground" 
                        size="sm"
                        onClick={() => handleApproveVariance(variance.id, true)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tabs with placeholders */}
        <TabsContent value="transactions">
          <Card className="glass">
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete transaction history
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                Transaction management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage invoices
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                Invoice management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mpesa">
          <Card className="glass">
            <CardHeader>
              <CardTitle>M-Pesa Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                M-Pesa transactions and operations
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                M-Pesa dashboard coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}