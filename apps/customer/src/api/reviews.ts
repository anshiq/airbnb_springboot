import { api } from './client';
import type { PageResponse, ReviewResponse, ReviewRequest } from '@/types';

export const reviewsApi = {
  getForProperty: (propertyId: number, page = 0, size = 10) =>
    api.get<PageResponse<ReviewResponse>>(`/reviews/property/${propertyId}?page=${page}&size=${size}`),

  getMyReviews: (page = 0, size = 10) =>
    api.get<PageResponse<ReviewResponse>>(`/reviews/my-reviews?page=${page}&size=${size}`),

  create: (data: ReviewRequest) => api.post<ReviewResponse>('/reviews', data),

  addHostResponse: (reviewId: number, response: string) =>
    api.post<ReviewResponse>(`/reviews/${reviewId}/host-response`, { response }),
};
