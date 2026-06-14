import { api } from './client';

export const messagesApi = {
  send: (bookingId, content) => api.post('/messages', { bookingId, content }),
  getByBooking: (bookingId, page = 0, size = 50) =>
    api.get(`/messages/booking/${bookingId}?page=${page}&size=${size}`),
  markRead: (bookingId) => api.post(`/messages/booking/${bookingId}/read`, {}),
};
