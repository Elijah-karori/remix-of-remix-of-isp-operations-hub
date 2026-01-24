import { apiFetch } from './base';

export interface CampaignOut {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  budget?: number;
  // Add other relevant fields for a campaign list item
}

export const marketingApi = {
  // Campaigns
  listCampaigns: (): Promise<CampaignOut[]> =>
    apiFetch<CampaignOut[]>("/api/v1/marketing/campaigns"),

  createCampaign: (data: any) =>
    apiFetch("/api/v1/marketing/campaigns", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getCampaignPerformance: (campaignId: number) =>
    apiFetch(`/api/v1/marketing/campaigns/${campaignId}/performance`),

  // Leads
  recordLead: (data: any) =>
    apiFetch("/api/v1/marketing/leads", {
      method: "POST",
      body: JSON.stringify(data)
    }),
};
