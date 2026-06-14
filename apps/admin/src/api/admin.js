import { api } from './client.js';

export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  getPendingListings: (page = 0, size = 10) =>
    api.get(`/admin/listings/pending?page=${page}&size=${size}`),

  moderateListing: (id, action, reason) =>
    api.patch(`/admin/listings/${id}/moderate`, { action, ...(reason ? { reason } : {}) }),

  getPendingHostApplications: (page = 0, size = 10) =>
    api.get(`/admin/host-applications/pending?page=${page}&size=${size}`),

  reviewHostApplication: (id, approved, note) =>
    api.patch(`/admin/host-applications/${id}/review`, { approved, note }),

  getConfig: () => api.get('/admin/config'),

  updateConfig: (key, value, description) =>
    api.put('/admin/config', { key, value, description }),
};
