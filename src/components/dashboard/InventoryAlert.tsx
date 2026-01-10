import { Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  status: "critical" | "low" | "warning";
}

const lowStockItems: InventoryItem[] = [
  { id: 1, name: "Cat6 Ethernet Cable (100m)", sku: "ETH-CAT6-100M", currentStock: 15, reorderLevel: 200, status: "critical" },
  { id: 2, name: "Fiber Splice Box", sku: "FSB-12PORT", currentStock: 8, reorderLevel: 50, status: "critical" },
  { id: 3, name: "RJ45 Connectors (100pk)", sku: "RJ45-CAT6-100", currentStock: 45, reorderLevel: 100, status: "low" },
  { id: 4, name: "Wireless Access Point", sku: "WAP-AC1200", currentStock: 12, reorderLevel: 25, status: "warning" },
];

const statusStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  low: "bg-warning/10 text-warning border-warning/20",
  warning: "bg-primary/10 text-primary border-primary/20",
};

export function InventoryAlert() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Package className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Low Stock Alert</h2>
            <p className="text-sm text-muted-foreground">Items needing reorder</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
          {lowStockItems.length} Items
        </Badge>
      </div>

      <div className="space-y-3">
        {lowStockItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <AlertTriangle
                className={cn(
                  "w-5 h-5",
                  item.status === "critical"
                    ? "text-destructive"
                    : item.status === "low"
                    ? "text-warning"
                    : "text-primary"
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.sku}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.currentStock}</span>
                <span className="text-xs text-muted-foreground">/ {item.reorderLevel}</span>
              </div>
              <Badge className={cn("text-xs mt-1", statusStyles[item.status])}>
                {item.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full mt-4 gradient-primary text-primary-foreground">
        <ShoppingCart className="w-4 h-4 mr-2" />
        Create Reorder
      </Button>
    </div>
  );
}
