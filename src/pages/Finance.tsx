import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Receipt,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone,
  Building2,
  FileText,
  RefreshCw,
  Download,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data - will be replaced with API calls
const revenueData = [
  { month: "Jul", revenue: 1450000, expenses: 920000, profit: 530000 },
  { month: "Aug", revenue: 1720000, expenses: 1080000, profit: 640000 },
  { month: "Sep", revenue: 1380000, expenses: 850000, profit: 530000 },
  { month: "Oct", revenue: 1910000, expenses: 1120000, profit: 790000 },
  { month: "Nov", revenue: 1680000, expenses: 990000, profit: 690000 },
  { month: "Dec", revenue: 2120000, expenses: 1250000, profit: 870000 },
  { month: "Jan", revenue: 1880000, expenses: 1010000, profit: 870000 },
];

const infrastructureProfitability = [
  { name: "Fiber", revenue: 4200000, cost: 2100000, profit: 2100000, color: "hsl(173, 80%, 40%)" },
  { name: "Wireless", revenue: 2800000, cost: 1680000, profit: 1120000, color: "hsl(142, 76%, 36%)" },
  { name: "PPOE", revenue: 1900000, cost: 1140000, profit: 760000, color: "hsl(38, 92%, 50%)" },
  { name: "Hotspot", revenue: 1200000, cost: 600000, profit: 600000, color: "hsl(262, 83%, 58%)" },
];

const recentTransactions = [
  { id: 1, type: "income", method: "M-Pesa", description: "ABC Company Ltd - Invoice #INV-2026-001", amount: 350000, status: "completed", time: "2h ago", reference: "QL78234567" },
  { id: 2, type: "expense", method: "Bank Transfer", description: "Fiber Cable Purchase - TechSupply Ltd", amount: -125000, status: "completed", time: "4h ago", reference: "BNK-89012" },
  { id: 3, type: "income", method: "M-Pesa", description: "Smith Enterprises - Milestone Payment", amount: 200000, status: "pending", time: "5h ago", reference: "QL78234890" },
  { id: 4, type: "expense", method: "M-Pesa B2C", description: "Technician Payroll - James Mwangi", amount: -45000, status: "completed", time: "1d ago", reference: "B2C-12345" },
  { id: 5, type: "income", method: "Bank Transfer", description: "City Mall - Project Completion", amount: 480000, status: "completed", time: "1d ago", reference: "BNK-89045" },
  { id: 6, type: "expense", method: "M-Pesa", description: "Equipment Purchase - Splice Tools", amount: -28000, status: "completed", time: "2d ago", reference: "QL78235123" },
];

const pendingInvoices = [
  { id: 1, customer: "Westlands Holdings", project: "Office Network Setup", amount: 275000, dueDate: "2026-01-15", daysOverdue: 0 },
  { id: 2, customer: "Karen Residences", project: "PPOE Installation", amount: 150000, dueDate: "2026-01-08", daysOverdue: 2 },
  { id: 3, customer: "Mombasa Cement", project: "Hybrid Network", amount: 480000, dueDate: "2026-01-05", daysOverdue: 5 },
];

const pendingVariances = [
  { id: 1, task: "Fiber Cable Installation", project: "Kilimani Fiber", type: "material", budgeted: 75000, actual: 82000, variance: 7000, reason: "Additional splicing required" },
  { id: 2, task: "Access Point Setup", project: "CBD Hotspot", type: "labor", budgeted: 16000, actual: 20000, variance: 4000, reason: "Extended working hours" },
];

const mpesaBalance = {
  available: 1250000,
  pending: 350000,
  todayIn: 550000,
  todayOut: 173000,
};

export default function Finance() {
  return (
    <DashboardLayout title="Finance" subtitle="Revenue, expenses & payments">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass border-primary/20 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">KES 12.1M</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">+18.2%</span>
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
                <p className="text-3xl font-bold text-foreground">KES 4.8M</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">+12.5%</span>
                  <span className="text-sm text-muted-foreground">margin 39.7%</span>
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
                <p className="text-3xl font-bold text-foreground">KES 905K</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-sm text-warning">3 invoices</span>
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
                <p className="text-3xl font-bold text-foreground">KES 1.25M</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-success">+550K today</span>
                  <span className="text-sm text-muted-foreground">|</span>
                  <span className="text-sm text-destructive">-173K out</span>
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
      <Tabs defaultValue="overview" className="space-y-6">
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
                      <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} tickFormatter={(v) => `${v / 1000000}M`} />
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                </div>
                <div className="space-y-3">
                  {infrastructureProfitability.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        KES {(item.profit / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions & Pending Invoices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTransactions.slice(0, 5).map((tx) => (
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
                      <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{tx.method}</span>
                        <span>•</span>
                        <span>{tx.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          tx.amount > 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {tx.amount > 0 ? "+" : ""}KES {Math.abs(tx.amount).toLocaleString()}
                      </span>
                      <Badge
                        className={cn(
                          "ml-2 text-xs",
                          tx.status === "completed"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pending Invoices */}
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Pending Invoices</CardTitle>
                <Button className="gradient-primary text-primary-foreground" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        invoice.daysOverdue > 0 ? "bg-destructive/20" : "bg-primary/20"
                      )}
                    >
                      <FileText
                        className={cn(
                          "w-5 h-5",
                          invoice.daysOverdue > 0 ? "text-destructive" : "text-primary"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{invoice.customer}</p>
                      <p className="text-sm text-muted-foreground truncate">{invoice.project}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        KES {invoice.amount.toLocaleString()}
                      </p>
                      {invoice.daysOverdue > 0 ? (
                        <Badge className="bg-destructive/10 text-destructive text-xs">
                          {invoice.daysOverdue}d overdue
                        </Badge>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="glass">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search transactions..." className="pl-10 bg-secondary border-border" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        tx.type === "income" ? "bg-success/20" : "bg-destructive/20"
                      )}
                    >
                      {tx.type === "income" ? (
                        <ArrowUpRight className="w-6 h-6 text-success" />
                      ) : (
                        <ArrowDownRight className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{tx.description}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{tx.method}</span>
                        <span>•</span>
                        <span>Ref: {tx.reference}</span>
                        <span>•</span>
                        <span>{tx.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-lg font-semibold",
                          tx.amount > 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {tx.amount > 0 ? "+" : ""}KES {Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <Badge
                        className={cn(
                          "text-xs",
                          tx.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Invoices</CardTitle>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Invoice management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mpesa">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* M-Pesa Balance Card */}
            <Card className="glass lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-success" />
                  M-Pesa Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                  <p className="text-4xl font-bold text-success">
                    KES {mpesaBalance.available.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    +KES {mpesaBalance.pending.toLocaleString()} pending
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/50 text-center">
                    <ArrowUpRight className="w-5 h-5 text-success mx-auto mb-2" />
                    <p className="text-lg font-semibold text-foreground">
                      +{(mpesaBalance.todayIn / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-muted-foreground">Today In</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 text-center">
                    <ArrowDownRight className="w-5 h-5 text-destructive mx-auto mb-2" />
                    <p className="text-lg font-semibold text-foreground">
                      -{(mpesaBalance.todayOut / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-muted-foreground">Today Out</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full gradient-primary text-primary-foreground">
                    <Send className="w-4 h-4 mr-2" />
                    STK Push Request
                  </Button>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    B2C Payment
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reconcile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* M-Pesa Transactions */}
            <Card className="glass lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>M-Pesa Transactions</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions
                    .filter((tx) => tx.method.includes("M-Pesa"))
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
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
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Ref: {tx.reference} • {tx.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "font-semibold",
                              tx.amount > 0 ? "text-success" : "text-destructive"
                            )}
                          >
                            {tx.amount > 0 ? "+" : ""}KES {Math.abs(tx.amount).toLocaleString()}
                          </p>
                          <Badge className="bg-success/10 text-success text-xs">{tx.status}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
              {pendingVariances.map((variance) => (
                <div
                  key={variance.id}
                  className="p-4 rounded-xl bg-secondary/30 border border-warning/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{variance.task}</h4>
                      <p className="text-sm text-muted-foreground">{variance.project}</p>
                    </div>
                    <Badge className="bg-warning/10 text-warning capitalize">{variance.type}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">Budgeted</p>
                      <p className="font-semibold text-foreground">
                        KES {variance.budgeted.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">Actual</p>
                      <p className="font-semibold text-foreground">
                        KES {variance.actual.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <p className="text-xs text-muted-foreground mb-1">Variance</p>
                      <p className="font-semibold text-destructive">
                        +KES {variance.variance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 mb-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Reason:</span> {variance.reason}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm">
                      Reject
                    </Button>
                    <Button className="bg-success hover:bg-success/90 text-success-foreground" size="sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
