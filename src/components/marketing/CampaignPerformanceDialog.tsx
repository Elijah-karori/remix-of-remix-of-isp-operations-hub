import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCampaignPerformance } from "@/hooks/use-marketing";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CampaignPerformanceDialogProps {
  campaignId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignPerformanceDialog({ campaignId, isOpen, onClose }: CampaignPerformanceDialogProps) {
  const { data: performance, isLoading, error } = useCampaignPerformance(campaignId as number);

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Campaign Performance</DialogTitle>
          <DialogDescription>
            Detailed performance metrics for the selected campaign.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load campaign performance: {error.message}</AlertDescription>
          </Alert>
        ) : performance ? (
          <Card className="border-none shadow-none">
            <CardContent className="grid gap-4 py-4 px-0">
              <div className="grid grid-cols-2 gap-2">
                <Label className="text-muted-foreground">Campaign Name:</Label>
                <p className="font-medium">{performance.name || "N/A"}</p>

                <Label className="text-muted-foreground">Total Spend:</Label>
                <p>{formatCurrency(performance.total_spend || 0)}</p>

                <Label className="text-muted-foreground">Impressions:</Label>
                <p>{performance.impressions?.toLocaleString() || "N/A"}</p>

                <Label className="text-muted-foreground">Clicks:</Label>
                <p>{performance.clicks?.toLocaleString() || "N/A"}</p>

                <Label className="text-muted-foreground">Conversions:</Label>
                <p>{performance.conversions?.toLocaleString() || "N/A"}</p>
              </div>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-2">
                <Label className="text-muted-foreground">CTR:</Label>
                <p>{performance.ctr ? `${(performance.ctr * 100).toFixed(2)}%` : "N/A"}</p>

                <Label className="text-muted-foreground">Conversion Rate:</Label>
                <p>{performance.conversion_rate ? `${(performance.conversion_rate * 100).toFixed(2)}%` : "N/A"}</p>

                <Label className="text-muted-foreground">Cost per Click:</Label>
                <p>{formatCurrency(performance.cpc || 0)}</p>

                <Label className="text-muted-foreground">Cost per Conversion:</Label>
                <p>{formatCurrency(performance.cpa || 0)}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground py-8 text-center">No performance data available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}