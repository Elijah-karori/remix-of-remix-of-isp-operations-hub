import { useState, useEffect } from "react";
import { useProduct, useSetStockAlert } from "@/hooks/use-inventory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell, X, Plus, Mail } from "lucide-react";

interface StockAlertDialogProps {
  productId: number | null;
  onClose: () => void;
}

export function StockAlertDialog({ productId, onClose }: StockAlertDialogProps) {
  const { data: product, isLoading: loadingProduct } = useProduct(productId || 0);
  const setStockAlert = useSetStockAlert();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [threshold, setThreshold] = useState(1.0);

  useEffect(() => {
    if (product) {
      setEnabled(product.low_stock_alert_enabled || false);
      setEmails(product.low_stock_alert_emails || []);
    }
  }, [product]);

  const handleAddEmail = () => {
    if (newEmail && !emails.includes(newEmail)) {
      setEmails([...emails, newEmail]);
      setNewEmail("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSave = async () => {
    if (!productId) return;

    if (enabled && emails.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one email address for alerts",
        variant: "destructive",
      });
      return;
    }

    try {
      await setStockAlert.mutateAsync({
        product_id: productId,
        enabled,
        alert_emails: emails,
        threshold_multiplier: threshold,
      });

      toast({
        title: "Success",
        description: enabled
          ? "Low stock alert enabled successfully"
          : "Low stock alert disabled",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock alert settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!productId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Low Stock Alert Settings
          </DialogTitle>
          <DialogDescription>
            {loadingProduct ? (
              "Loading..."
            ) : (
              <>Configure email alerts for <strong>{product?.name}</strong></>
            )}
          </DialogDescription>
        </DialogHeader>

        {loadingProduct ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Send email when stock falls below reorder level
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            {enabled && (
              <>
                {/* Threshold Multiplier */}
                <div className="space-y-2">
                  <Label>Alert Threshold</Label>
                  <p className="text-xs text-muted-foreground">
                    Alert when stock falls below reorder level × this multiplier
                  </p>
                  <Input
                    type="number"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alert at: {Math.round((product?.reorder_level || 0) * threshold)} units
                  </p>
                </div>

                {/* Email Addresses */}
                <div className="space-y-2">
                  <Label>Alert Recipients</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                    />
                    <Button type="button" variant="outline" onClick={handleAddEmail}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {emails.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recipients added</p>
                    ) : (
                      emails.map((email) => (
                        <Badge key={email} variant="secondary" className="gap-1">
                          <Mail className="h-3 w-3" />
                          {email}
                          <button
                            onClick={() => handleRemoveEmail(email)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={setStockAlert.isPending}>
            {setStockAlert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
