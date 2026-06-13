import { api } from './client';
import type { PageResponse, UserResponse, UserPageResponse, UserRole, UserStatus } from '@/types';

export const usersApi = {
  getAll: (query?: string, page = 0, size = 20) => {
    const q = new URLSearchParams({ page: String(page), size: String(size) });
    if (query) q.set('query', query);
    return api.get<PageResponse<UserPageResponse>>(`/users?${q}`);
  },

  getById: (id: number) => api.get<UserResponse>(`/users/${id}`),

  updateStatus: (id: number, status: UserStatus) =>
    api.patch<UserResponse>(`/users/${id}/status?status=${status}`),

  updateRole: (id: number, role: UserRole) =>
    api.patch<UserResponse>(`/users/${id}/role?role=${role}`),

  delete: (id: number) => api.delete<void>(`/users/${id}`),
};
