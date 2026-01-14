import { useHealthCheck, usePing } from "@/hooks/use-health";
import { API_BASE_URL } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, XCircle, Loader2, Server, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export function HealthIndicator() {
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useHealthCheck();
  const { data: ping, isLoading: pingLoading } = usePing();

  const isLoading = healthLoading || pingLoading;
  const isHealthy = health?.status === "healthy";
  const isReachable = ping?.reachable;

  const getStatusColor = () => {
    if (isLoading) return "bg-muted";
    if (isHealthy) return "bg-green-500";
    if (isReachable) return "bg-yellow-500";
    return "bg-destructive";
  };

  const getStatusText = () => {
    if (isLoading) return "Checking...";
    if (isHealthy) return "Connected";
    if (isReachable) return "Degraded";
    return "Offline";
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-3 h-3 animate-spin" />;
    if (isHealthy) return <CheckCircle className="w-3 h-3" />;
    if (isReachable) return <Activity className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => refetchHealth()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                getStatusColor()
              )}
            />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {getStatusText()}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-72">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Backend Status</span>
              <Badge
                variant={isHealthy ? "default" : isReachable ? "secondary" : "destructive"}
                className="text-xs"
              >
                {getStatusIcon()}
                <span className="ml-1">{getStatusText()}</span>
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Server className="w-3 h-3 text-muted-foreground" />
                  <span>Server</span>
                </div>
                <span className="text-muted-foreground truncate max-w-[140px]">
                  {API_BASE_URL.replace("https://", "")}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Wifi className="w-3 h-3 text-muted-foreground" />
                  <span>Network</span>
                </div>
                <span className={isReachable ? "text-green-500" : "text-destructive"}>
                  {isReachable ? "Reachable" : "Unreachable"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-muted-foreground" />
                  <span>Latency</span>
                </div>
                <span className="text-muted-foreground">
                  {health?.latency ? `${health.latency}ms` : ping?.latency ? `${ping.latency}ms` : "—"}
                </span>
              </div>

              {health?.error && (
                <div className="p-2 bg-destructive/10 rounded text-destructive">
                  Error: {health.error}
                </div>
              )}

              {health?.timestamp && (
                <div className="text-muted-foreground text-[10px] text-center pt-1">
                  Last checked: {new Date(health.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Click to refresh status
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
