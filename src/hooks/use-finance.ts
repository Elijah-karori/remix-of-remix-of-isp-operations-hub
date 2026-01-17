import { useQuery } from "@tanstack/react-query";
import { financeApi, mpesaApi } from "@/lib/api";

// Fetch financial snapshot
export const useFinancialSnapshot = () => {
  return useQuery({
    queryKey: ["financialSnapshot"],
    queryFn: financeApi.snapshot,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    
  });
};

// Fetch infrastructure profitability
export const useInfrastructureProfitability = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["infrastructureProfitability", startDate, endDate],
    queryFn: () => financeApi.infrastructureProfitability(startDate, endDate),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    
  });
};

// Fetch recent M-Pesa transactions (as a stand-in for all transactions for now)
export const useRecentTransactions = (limit = 10) => {
  return useQuery({
    queryKey: ["recentTransactions", limit],
    queryFn: () => mpesaApi.transactions({ limit }),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    
  });
};

// Fetch overdue invoices
export const useOverdueInvoices = (daysOverdue = 0) => {
  return useQuery({
    queryKey: ["overdueInvoices", daysOverdue],
    queryFn: () => financeApi.overdueInvoices(daysOverdue),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    
  });
};

// Fetch pending variances
export const usePendingVariances = (limit = 5) => {
  return useQuery({
    queryKey: ["pendingVariances", limit],
    queryFn: () => financeApi.pendingVariances(limit),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    
  });
};

// Fetch M-Pesa balance (example, assuming an endpoint exists)
export const useMpesaBalance = () => {
    return useQuery({
        queryKey: ["mpesaBalance"],
        queryFn: mpesaApi.checkBalance,
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        
    });
};
