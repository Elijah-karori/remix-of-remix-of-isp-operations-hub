import { apiFetch } from './base';

export const auditApi = {
  logs: (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
    action?: string;
    resource?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined) searchParams.append("skip", String(params.skip));
    if (params?.limit !== undefined) searchParams.append("limit", String(params.limit));
    if (params?.user_id) searchParams.append("user_id", String(params.user_id));
    if (params?.action) searchParams.append("action", params.action);
    if (params?.resource) searchParams.append("resource", params.resource);
    if (params?.date_from) searchParams.append("date_from", params.date_from);
    if (params?.date_to) searchParams.append("date_to", params.date_to);
    return apiFetch(`/api/v1/audit/?${searchParams}`);
  },

  stats: (days = 7) =>
    apiFetch(`/api/v1/audit/stats?days=${days}`),

  export: (format = "csv", days = 30) =>
    apiFetch(`/api/v1/audit/export?format=${format}&days=${days}`),
};
