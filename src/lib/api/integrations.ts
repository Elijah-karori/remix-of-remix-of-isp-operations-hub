import { apiFetch } from './base';

export const integrationsApi = {
  // ClickUp
  getClickUpTeams: () =>
    apiFetch("/api/v1/integrations/clickup/teams"),

  getClickUpSpaces: (teamId: string) =>
    apiFetch(`/api/v1/integrations/clickup/teams/${teamId}/spaces`),

  getClickUpLists: (spaceId: string) =>
    apiFetch(`/api/v1/integrations/clickup/spaces/${spaceId}/lists`),

  createClickUpWebhook: (teamId: string) =>
    apiFetch(`/api/v1/integrations/clickup/teams/${teamId}/webhook`, { method: "POST" }),
};
