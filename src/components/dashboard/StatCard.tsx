import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number | string;
  changeLabel?: string;
  icon: React.ElementType | ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "blue" | "green" | "orange" | "red" | "purple";
  className?: string;
  style?: React.CSSProperties;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
  className,
  style,
}: StatCardProps) {
  const isPositive = typeof change === 'number' ? change > 0 : !change?.toString().includes("-");

  const variantStyles = {
    default: "border-border",
    primary: "border-primary/30 bg-primary/5",
    success: "border-success/30 bg-success/5",
    warning: "border-warning/30 bg-warning/5",
    destructive: "border-destructive/30 bg-destructive/5",
    blue: "border-blue-500/30 bg-blue-500/5",
    green: "border-green-500/30 bg-green-500/5",
    orange: "border-orange-500/30 bg-orange-500/5",
    red: "border-red-500/30 bg-red-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
  };

  const iconStyles = {
    default: "bg-secondary text-muted-foreground",
    primary: "bg-primary/20 text-primary",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    destructive: "bg-destructive/20 text-destructive",
    blue: "bg-blue-500/20 text-blue-500",
    green: "bg-green-500/20 text-green-500",
    orange: "bg-orange-500/20 text-orange-500",
    red: "bg-red-500/20 text-red-500",
    purple: "bg-purple-500/20 text-purple-500",
  };

  return (
    <div className={cn("stat-card animate-fade-in", variantStyles[variant as keyof typeof variantStyles], className)} style={style}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {typeof change === 'number' && change > 0 ? "+" : ""}
                {change}{typeof change === 'number' ? "%" : ""}
              </span>
              {changeLabel && (
                <span className="text-sm text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconStyles[variant as keyof typeof iconStyles])}>
          {Icon && (typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : Icon)}
        </div>
      </div>
    </div>
  );
}
