import { api } from './client';
import type { PageResponse, BookingResponse, BookingStatus } from '@/types';

export const bookingsApi = {
  getAll: (status?: BookingStatus, page = 0, size = 20) => {
    const q = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) q.set('status', status);
    return api.get<PageResponse<BookingResponse>>(`/bookings/admin/all?${q}`);
  },

  getById: (id: number) => api.get<BookingResponse>(`/bookings/${id}`),

  cancel: (id: number, reason: string) =>
    api.post<BookingResponse>(`/bookings/${id}/cancel`, { reason }),
};
