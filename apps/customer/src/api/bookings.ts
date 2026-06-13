import { api } from './client';
import type { PageResponse, BookingResponse, BookingRequest, PriceBreakdownResponse, BookingStatus } from '@/types';

export const bookingsApi = {
  create: (data: BookingRequest)     => api.post<BookingResponse>('/bookings', data),

  priceCheck: (propertyId: number, checkInDate: string, checkOutDate: string, guestsCount: number) =>
    api.get<PriceBreakdownResponse>(
      `/bookings/price-check?propertyId=${propertyId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guestsCount=${guestsCount}`
    ),

  getById: (id: number) => api.get<BookingResponse>(`/bookings/${id}`),

  cancel: (id: number, reason: string) =>
    api.post<BookingResponse>(`/bookings/${id}/cancel`, { reason }),

  getMyTrips: (page = 0, size = 10) =>
    api.get<PageResponse<BookingResponse>>(`/bookings/my-trips?page=${page}&size=${size}`),

  getHostBookings: (status?: BookingStatus, page = 0, size = 20) => {
    const q = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) q.set('status', status);
    return api.get<PageResponse<BookingResponse>>(`/bookings/host/bookings?${q}`);
  },

  confirm: (id: number) => api.post<BookingResponse>(`/bookings/${id}/confirm`),
};
