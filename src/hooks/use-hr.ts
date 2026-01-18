import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import { EmployeeProfileResponse, PayoutResponse } from "@/types/api";
import { toast } from "sonner";

export function useEmployees(params?: { engagement_type?: string; is_active?: boolean; skip?: number; limit?: number }) {
    return useQuery({
        queryKey: ["hr", "employees", params],
        queryFn: () => hrApi.employees(params),
        staleTime: 5 * 60 * 1000,
    });
}

export function useEmployee(id: number) {
    return useQuery({
        queryKey: ["hr", "employee", id],
        queryFn: () => hrApi.employee(id),
        enabled: !!id,
    });
}

export function usePayrollSummary(periodStart: string, periodEnd: string) {
    return useQuery({
        queryKey: ["hr", "reports", "payroll-summary", periodStart, periodEnd],
        queryFn: () => hrApi.payrollSummary(periodStart, periodEnd),
        enabled: !!periodStart && !!periodEnd,
    });
}

export function usePendingPayouts(limit = 50) {
    return useQuery({
        queryKey: ["hr", "payouts", "pending", limit],
        queryFn: () => hrApi.pendingPayouts(limit),
    });
}

export function useComplaints(employeeId?: number) {
    return useQuery({
        queryKey: ["hr", "complaints", employeeId],
        queryFn: () => hrApi.listComplaints(employeeId),
    });
}

export function useApprovePayout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ payoutId, approved, notes }: { payoutId: number; approved: boolean; notes?: string }) =>
            hrApi.approvePayout(payoutId, { approved, notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hr", "payouts"] });
            toast.success("Payout updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update payout");
        },
    });
}
