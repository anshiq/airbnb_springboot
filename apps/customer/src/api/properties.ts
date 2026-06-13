import { api } from './client';
import type {
  PageResponse, PropertyResponse, PropertySummaryResponse,
  AmenityResponse, SearchParams,
} from '@/types';

export interface PropertyCreatePayload {
  title: string; description: string; propertyType: string;
  maxGuests: number; bedrooms: number; bathrooms: number; beds: number;
  basePrice: number; cleaningFee?: number;
  bookingType: string; cancellationPolicy: string;
  minNights: number; maxNights: number;
  location: {
    addressLine1: string; city: string; state: string;
    country: string; zipCode: string;
    latitude?: number; longitude?: number;
  };
  amenityIds: number[];
  photos: { url: string; caption?: string; primary: boolean; displayOrder: number }[];
}

function buildSearchQuery(params: SearchParams): string {
  const q = new URLSearchParams();
  if (params.city)         q.set('city', params.city);
  if (params.checkIn)      q.set('checkIn', params.checkIn);
  if (params.checkOut)     q.set('checkOut', params.checkOut);
  if (params.guests)       q.set('guests', String(params.guests));
  if (params.minPrice)     q.set('minPrice', String(params.minPrice));
  if (params.maxPrice)     q.set('maxPrice', String(params.maxPrice));
  if (params.propertyType) q.set('propertyType', params.propertyType);
  if (params.amenityIds?.length) params.amenityIds.forEach(id => q.append('amenityIds', String(id)));
  q.set('page', String(params.page ?? 0));
  q.set('size', String(params.size ?? 20));
  q.set('sortBy',  params.sortBy  ?? 'basePrice');
  q.set('sortDir', params.sortDir ?? 'asc');
  return q.toString();
}

export const propertiesApi = {
  search:      (params: SearchParams)        => api.get<PageResponse<PropertySummaryResponse>>(`/properties/search?${buildSearchQuery(params)}`),
  getById:     (id: number)                  => api.get<PropertyResponse>(`/properties/${id}`),
  getAmenities:()                            => api.get<AmenityResponse[]>('/properties/amenities'),
  create:      (data: PropertyCreatePayload) => api.post<PropertyResponse>('/properties', data),
  update:      (id: number, data: Partial<PropertyCreatePayload>) => api.put<PropertyResponse>(`/properties/${id}`, data),
  submitForReview: (id: number)              => api.post<PropertyResponse>(`/properties/${id}/submit`),
  delete:      (id: number)                  => api.delete<void>(`/properties/${id}`),
  getMyListings: (page = 0, size = 20)       => api.get<PageResponse<PropertySummaryResponse>>(`/properties/host/my-listings?page=${page}&size=${size}`),
  updateAvailability: (id: number, data: { blockedDates: string[]; priceOverrides: Record<string, number> }) =>
    api.put<void>(`/properties/${id}/availability`, data),
  getAvailability: (id: number, start: string, end: string) =>
    api.get<{ date: string; available: boolean; price?: number }[]>(`/properties/${id}/availability?start=${start}&end=${end}`),
};
