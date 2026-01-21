import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketingApi } from "@/lib/api";
import { MarketingCampaignOut } from "@/types/api";

export function useCampaigns() {
  return useQuery<MarketingCampaignOut[]>({
    queryKey: ["marketingCampaigns"],
    queryFn: () => marketingApi.listCampaigns() as Promise<MarketingCampaignOut[]>,
    staleTime: 60000,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string }) => marketingApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketingCampaigns"] });
    },
  });
}

export function useCampaignPerformance(campaignId: number) {
  return useQuery<any>({ // Type can be refined based on actual API response
    queryKey: ["campaignPerformance", campaignId],
    queryFn: () => marketingApi.getCampaignPerformance(campaignId),
    enabled: !!campaignId,
    staleTime: 60000,
  });
}