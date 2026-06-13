import { api } from './client';
import type {
  PageResponse, PropertySummaryResponse,
  DashboardStats, HostApplicationResponse, PlatformConfigResponse,
  ListingModerationPayload, HostApplicationReviewPayload, PlatformConfigPayload,
} from '@/types';

export const adminApi = {
  // Dashboard
  getDashboardStats: () => api.get<DashboardStats>('/admin/dashboard/stats'),

  // Listing moderation
  getPendingListings: (page = 0, size = 20) =>
    api.get<PageResponse<PropertySummaryResponse>>(`/admin/listings/pending?page=${page}&size=${size}`),

  moderateListing: (id: number, data: ListingModerationPayload) =>
    api.patch<PropertySummaryResponse>(`/admin/listings/${id}/moderate`, data),

  // Host applications
  getPendingApplications: (page = 0, size = 20) =>
    api.get<PageResponse<HostApplicationResponse>>(`/admin/host-applications/pending?page=${page}&size=${size}`),

  reviewApplication: (id: number, data: HostApplicationReviewPayload) =>
    api.patch<HostApplicationResponse>(`/admin/host-applications/${id}/review`, data),

  // Platform config
  getConfigs: () => api.get<PlatformConfigResponse[]>('/admin/config'),

  upsertConfig: (data: PlatformConfigPayload) => api.put<PlatformConfigResponse>('/admin/config', data),
};
