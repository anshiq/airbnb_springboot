import { api } from "./client";

export const bookingsApi = {
  priceCheck: (propertyId, checkInDate, checkOutDate, guestsCount) => {
    const params = new URLSearchParams({
      propertyId: propertyId,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      guestsCount: guestsCount,
    }).toString();
    return api.get(`/bookings/price-check?${params}`);
  },
  create: (data) => api.post("/bookings", data),
  getMyTrips: (page = 0, size = 10) =>
    api.get(`/bookings/my-trips?page=${page}&size=${size}`),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
};
