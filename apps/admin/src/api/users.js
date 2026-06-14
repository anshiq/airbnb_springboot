import { api } from './client.js';

export const usersApi = {
  getUsers: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    return api.get(`/admin/users?${qs.toString()}`);
  },

  getUser: (id) => api.get(`/admin/users/${id}`),

  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),

  updateUserStatus: (id, status) => api.patch(`/users/${id}/status?status=${status}`),

  deleteUser: (id) => api.delete(`/users/${id}`),
};
