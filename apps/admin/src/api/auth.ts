import { api } from './client';
import type { AuthResponse } from '@/types';

export const authApi = {
  login:   (email: string, password: string) => api.post<AuthResponse>('/auth/login', { email, password }),
  logout:  (refreshToken: string)             => api.post<void>('/auth/logout', { refreshToken }),
};
