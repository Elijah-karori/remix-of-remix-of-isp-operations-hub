import { useQuery } from "@tanstack/react-query";
import { healthApi, HealthStatus } from "@/lib/api";

export function useHealthCheck(enabled = true) {
  return useQuery<HealthStatus>({
    queryKey: ["health-check"],
    queryFn: healthApi.check,
    enabled,
    refetchInterval: 30000, // Check every 30 seconds
    retry: 1,
    staleTime: 10000,
  });
}

export function usePing(enabled = true) {
  return useQuery({
    queryKey: ["ping"],
    queryFn: healthApi.ping,
    enabled,
    refetchInterval: 15000, // Ping every 15 seconds
    retry: 1,
    staleTime: 5000,
  });
}
