import { api } from './client.js';

export const bookingsApi = {
  getAllBookings: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    return api.get(`/bookings/admin/all?${qs.toString()}`);
  },

  getBooking: (id) => api.get(`/bookings/${id}`),

  cancelBooking: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),

  getHostBookings: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    return api.get(`/bookings/host/bookings?${qs.toString()}`);
  },

  confirmBooking: (id) => api.post(`/bookings/${id}/confirm`),

  cancelHostBooking: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
};
