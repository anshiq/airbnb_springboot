import { api } from './client';
import type { UserResponse } from '@/types';

export interface UpdateProfilePayload {
  firstName?: string; lastName?: string;
  phone?: string; bio?: string; profilePhotoUrl?: string;
}

export const usersApi = {
  getMe:          ()                          => api.get<UserResponse>('/users/me'),
  updateProfile:  (data: UpdateProfilePayload) => api.patch<UserResponse>('/users/me', data),
};
