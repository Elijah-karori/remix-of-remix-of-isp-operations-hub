import {
  Lead,
  LeadCreate,
  LeadUpdate,
  Deal,
  DealCreate,
  DealUpdate,
  Activity,
  ActivityCreate,
  ActivityUpdate,
} from '../../types/api';
import { apiFetch } from './base';

export const crmApi = {
  // Leads
  leads: (skip = 0, limit = 100): Promise<Lead[]> =>
    apiFetch<Lead[]>(`/api/v1/crm/leads?skip=${skip}&limit=${limit}`),

  lead: (id: number): Promise<Lead> =>
    apiFetch<Lead>(`/api/v1/crm/leads/${id}`),

  createLead: (data: LeadCreate): Promise<Lead> =>
    apiFetch<Lead>("/api/v1/crm/leads", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateLead: (id: number, data: LeadUpdate): Promise<Lead> =>
    apiFetch<Lead>(`/api/v1/crm/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteLead: (id: number) =>
    apiFetch(`/api/v1/crm/leads/${id}`, {
      method: "DELETE",
    }),

  // Deals
  deals: (skip = 0, limit = 100): Promise<Deal[]> =>
    apiFetch<Deal[]>(`/api/v1/crm/deals?skip=${skip}&limit=${limit}`),

  deal: (id: number): Promise<Deal> =>
    apiFetch<Deal>(`/api/v1/crm/deals/${id}`),

  createDeal: (data: DealCreate): Promise<Deal> =>
    apiFetch<Deal>("/api/v1/crm/deals", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateDeal: (id: number, data: DealUpdate): Promise<Deal> =>
    apiFetch<Deal>(`/api/v1/crm/deals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteDeal: (id: number) =>
    apiFetch(`/api/v1/crm/deals/${id}`, {
      method: "DELETE",
    }),

  // Activities
  activities: (skip = 0, limit = 100): Promise<Activity[]> =>
    apiFetch<Activity[]>(`/api/v1/crm/activities?skip=${skip}&limit=${limit}`),

  activity: (id: number): Promise<Activity> =>
    apiFetch<Activity>(`/api/v1/crm/activities/${id}`),

  logActivity: (data: ActivityCreate): Promise<Activity> =>
    apiFetch<Activity>("/api/v1/crm/activities", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateActivity: (id: number, data: ActivityUpdate): Promise<Activity> =>
    apiFetch<Activity>(`/api/v1/crm/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deleteActivity: (id: number) =>
    apiFetch(`/api/v1/crm/activities/${id}`, {
      method: "DELETE",
    }),
};
