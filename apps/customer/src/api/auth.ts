import { api } from './client';
import type { AuthResponse, UserResponse } from '@/types';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  firstName: string; lastName: string;
  email: string; password: string; phone?: string;
}
export interface ForgotPasswordPayload { email: string; }
export interface ResetPasswordPayload { token: string; newPassword: string; }
export interface ChangePasswordPayload { currentPassword: string; newPassword: string; }

export const authApi = {
  login:              (data: LoginPayload)           => api.post<AuthResponse>('/auth/login', data),
  register:           (data: RegisterPayload)        => api.post<AuthResponse>('/auth/register', data),
  logout:             (refreshToken: string)         => api.post<void>('/auth/logout', { refreshToken }),
  forgotPassword:     (data: ForgotPasswordPayload)  => api.post<void>('/auth/forgot-password', data),
  resetPassword:      (data: ResetPasswordPayload)   => api.post<void>('/auth/reset-password', data),
  changePassword:     (data: ChangePasswordPayload)  => api.post<void>('/auth/change-password', data),
  verifyEmail:        (token: string)                => api.get<void>(`/auth/verify-email?token=${token}`),
  resendVerification: (email: string)                => api.post<void>(`/auth/resend-verification?email=${encodeURIComponent(email)}`),
  getMe:             ()                              => api.get<UserResponse>('/users/me'),
};
