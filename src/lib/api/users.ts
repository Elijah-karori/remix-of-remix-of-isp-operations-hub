import { UserOut, UserCreate, UserUpdate } from '../../types/api';
import { apiFetch } from './base';

export const usersApi = {
  list: (): Promise<{ users: UserOut[] }> =>
    apiFetch("/api/v1/users/"),

  get: (userId: number): Promise<UserOut> =>
    apiFetch(`/api/v1/users/${userId}`),

  create: (data: UserCreate): Promise<UserOut> =>
    apiFetch("/api/v1/users/", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  update: (userId: number, data: UserUpdate): Promise<UserOut> =>
    apiFetch(`/api/v1/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  softDelete: (userId: number) =>
    apiFetch(`/api/v1/users/${userId}`, { method: "DELETE" }),

  restore: (userId: number) =>
    apiFetch(`/api/v1/users/${userId}/restore`, { method: "POST" }),
};
