import { api } from './client';

export const reviewsApi = {
  create: (data) => api.post('/reviews', data),
  getByProperty: (propertyId, page = 0, size = 10) =>
    api.get(`/reviews/property/${propertyId}?page=${page}&size=${size}`),
  getMyReviews: (page = 0, size = 10) =>
    api.get(`/reviews/my-reviews?page=${page}&size=${size}`),
  addHostResponse: (reviewId, response) =>
    api.post(`/reviews/${reviewId}/host-response`, { response }),
};
