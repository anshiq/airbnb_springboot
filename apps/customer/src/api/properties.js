import { api } from './client';

export const propertiesApi = {
  search: (params) => {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined),
    );
    const query = new URLSearchParams(filtered).toString();
    return api.get(`/properties/search?${query}`);
  },
  getById: (id) => api.get(`/properties/${id}`),
  getAmenities: () => api.get('/properties/amenities'),
  getAvailability: (id, start, end) =>
    api.get(`/properties/${id}/availability?start=${start}&end=${end}`),
};
