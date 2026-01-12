import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "list" | "stat" | "chart" | "table";
  count?: number;
}

export function LoadingSkeleton({ className, variant = "card", count = 1 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "stat") {
    return (
      <>
        {items.map((i) => (
          <div key={i} className={cn("stat-card animate-pulse", className)}>
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 animate-pulse">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={cn("glass rounded-xl p-6 animate-pulse", className)}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

  if (variant === "table") {
    return (
      <div className={cn("rounded-md border", className)}>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {items.map((i) => (
        <div key={i} className={cn("glass rounded-xl p-6 animate-pulse", className)}>
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}
