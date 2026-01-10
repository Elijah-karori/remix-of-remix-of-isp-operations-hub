import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jul", revenue: 450000, expenses: 320000 },
  { month: "Aug", revenue: 520000, expenses: 380000 },
  { month: "Sep", revenue: 480000, expenses: 350000 },
  { month: "Oct", revenue: 610000, expenses: 420000 },
  { month: "Nov", revenue: 580000, expenses: 390000 },
  { month: "Dec", revenue: 720000, expenses: 450000 },
  { month: "Jan", revenue: 680000, expenses: 410000 },
];

const transactions = [
  { id: 1, type: "income", description: "M-Pesa Payment - ABC Ltd", amount: 150000, time: "2h ago" },
  { id: 2, type: "expense", description: "Fiber Cable Purchase", amount: -45000, time: "4h ago" },
  { id: 3, type: "income", description: "Project Milestone - Westlands", amount: 200000, time: "6h ago" },
  { id: 4, type: "expense", description: "Technician Payroll", amount: -125000, time: "1d ago" },
];

export function FinanceOverview() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <Wallet className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Finance Overview</h2>
            <p className="text-sm text-muted-foreground">Revenue & Expenses</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View Reports
        </Button>
      </div>

      {/* Chart */}
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
            <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" fontSize={12} />
            <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} tickFormatter={(v) => `${v / 1000}K`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 13%)",
                border: "1px solid hsl(217, 33%, 20%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
              }}
              formatter={(value: number) => [`KES ${value.toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(173, 80%, 40%)"
              fill="url(#revenueGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(0, 84%, 60%)"
              fill="url(#expenseGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Transactions</h3>
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === "income" ? "bg-success/20" : "bg-destructive/20"
              }`}
            >
              {tx.type === "income" ? (
                <ArrowUpRight className="w-5 h-5 text-success" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-destructive" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{tx.time}</p>
            </div>
            <span
              className={`text-sm font-semibold ${
                tx.amount > 0 ? "text-success" : "text-destructive"
              }`}
            >
              {tx.amount > 0 ? "+" : ""}KES {Math.abs(tx.amount).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
