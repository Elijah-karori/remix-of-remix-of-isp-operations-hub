import { useQuery } from "@tanstack/react-query";
import { techniciansApi } from "@/lib/api";
import { TechnicianKPI, CustomerSatisfaction } from "@/types/api";

export function useTechnicianPerformance(technicianId: number, periodStart?: string, periodEnd?: string) {
    return useQuery({
        queryKey: ["technicians", "performance", technicianId, periodStart, periodEnd],
        queryFn: () => techniciansApi.performance(technicianId, periodStart, periodEnd),
        enabled: !!technicianId,
    });
}

export function useTechnicianLeaderboard(periodStart?: string, periodEnd?: string, limit = 10) {
    return useQuery({
        queryKey: ["technicians", "leaderboard", periodStart, periodEnd, limit],
        queryFn: () => techniciansApi.leaderboard(periodStart, periodEnd, limit),
    });
}

export function useCustomerSatisfaction(params?: { technician_id?: number; task_id?: number; limit?: number }) {
    return useQuery({
        queryKey: ["technicians", "satisfaction", params],
        queryFn: () => techniciansApi.listSatisfaction(params),
    });
}
