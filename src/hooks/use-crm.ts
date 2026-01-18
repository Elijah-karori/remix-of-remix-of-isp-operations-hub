import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { crmApi } from '@/lib/api';
import { LeadCreate, LeadUpdate, Lead, Deal, DealCreate, DealUpdate, Activity, ActivityCreate, ActivityUpdate } from '@/types/api'; // Added Deal and Activity types
import { toast } from 'sonner';

// Leads Hooks
export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newLead: LeadCreate) => crmApi.createLead(newLead),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] });
      toast.success(`Lead "${data.first_name} ${data.last_name}" created.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create lead: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LeadUpdate }) => crmApi.updateLead(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'lead', data.id] }); // Invalidate specific lead query
      toast.success(`Lead "${data.first_name} ${data.last_name}" updated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update lead: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => crmApi.deleteLead(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] });
      toast.success(`Lead (ID: ${id}) deleted.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete lead: ${error.message || 'Unknown error'}`);
    },
  });
};

// Deals Hooks
export const useDeals = (skip = 0, limit = 100) => {
  return useQuery<Deal[]>({
    queryKey: ['crm', 'deals', skip, limit],
    queryFn: async () => {
      try {
        return await crmApi.deals(skip, limit);
      } catch (error) {
        console.warn("CRM - Failed to fetch deals, using fallback:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDeal: DealCreate) => crmApi.createDeal(newDeal),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
      toast.success(`Deal "${data.name}" created.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create deal: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DealUpdate }) => crmApi.updateDeal(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'deal', data.id] });
      toast.success(`Deal "${data.name}" updated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update deal: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => crmApi.deleteDeal(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
      toast.success(`Deal (ID: ${id}) deleted.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete deal: ${error.message || 'Unknown error'}`);
    },
  });
};

// Activities Hooks
export const useActivities = (skip = 0, limit = 100) => {
  return useQuery<Activity[]>({
    queryKey: ['crm', 'activities', skip, limit],
    queryFn: async () => {
      try {
        return await crmApi.activities(skip, limit);
      } catch (error) {
        console.warn("CRM - Failed to fetch activities, using fallback:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useLogActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newActivity: ActivityCreate) => crmApi.logActivity(newActivity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'activities'] });
      toast.success(`Activity "${data.activity_type}" logged.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to log activity: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActivityUpdate }) => crmApi.updateActivity(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'activities'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'activity', data.id] });
      toast.success(`Activity (ID: ${data.id}) updated.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update activity: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => crmApi.deleteActivity(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'activities'] });
      toast.success(`Activity (ID: ${id}) deleted.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete activity: ${error.message || 'Unknown error'}`);
    },
  });
};