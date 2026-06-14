import { api } from './client.js';

export const propertiesApi = {
  getMyListings: (page = 0, size = 10) =>
    api.get(`/properties/host/my-listings?page=${page}&size=${size}`),

  getProperty: (id) => api.get(`/properties/${id}`),

  createProperty: (data) => api.post('/properties', data),

  updateProperty: (id, data) => api.put(`/properties/${id}`, data),

  submitProperty: (id) => api.post(`/properties/${id}/submit`),

  addPhotos: (id, photos) => api.post(`/properties/${id}/photos`, photos),

  deletePhoto: (propertyId, photoId) =>
    api.delete(`/properties/${propertyId}/photos/${photoId}`),

  updateAvailability: (id, dates) =>
    api.put(`/properties/${id}/availability`, { dates }),

  getAvailability: (id, start, end) =>
    api.get(`/properties/${id}/availability?start=${start}&end=${end}`),

  deleteProperty: (id) => api.delete(`/properties/${id}`),

  getAmenities: () => api.get('/properties/amenities'),

  getReviews: (propertyId) => api.get(`/reviews/property/${propertyId}`),

  respondToReview: (reviewId, response) =>
    api.post(`/reviews/${reviewId}/host-response`, { response }),
};
