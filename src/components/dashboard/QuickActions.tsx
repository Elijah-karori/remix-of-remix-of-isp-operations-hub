import {
  FolderPlus,
  ClipboardPlus,
  UserPlus,
  Package,
  FileText,
  Send,
  Calculator,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  { label: "New Project", icon: FolderPlus, color: "text-chart-1", bgColor: "bg-chart-1/10 hover:bg-chart-1/20" },
  { label: "Create Task", icon: ClipboardPlus, color: "text-chart-2", bgColor: "bg-chart-2/10 hover:bg-chart-2/20" },
  { label: "Add Lead", icon: UserPlus, color: "text-chart-3", bgColor: "bg-chart-3/10 hover:bg-chart-3/20" },
  { label: "New Order", icon: ShoppingCart, color: "text-chart-4", bgColor: "bg-chart-4/10 hover:bg-chart-4/20" },
  { label: "Send Invoice", icon: Send, color: "text-primary", bgColor: "bg-primary/10 hover:bg-primary/20" },
  { label: "Stock Check", icon: Package, color: "text-warning", bgColor: "bg-warning/10 hover:bg-warning/20" },
  { label: "Payroll", icon: Calculator, color: "text-success", bgColor: "bg-success/10 hover:bg-success/20" },
  { label: "Reports", icon: FileText, color: "text-muted-foreground", bgColor: "bg-muted/50 hover:bg-muted" },
];

export function QuickActions() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.label}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 group",
              action.bgColor
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <action.icon
              className={cn("w-6 h-6 transition-transform group-hover:scale-110", action.color)}
            />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
