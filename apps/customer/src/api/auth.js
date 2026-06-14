import { api } from './client';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  resendVerification: (email) =>
    api.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`, {}),
  verifyEmail: (token) =>
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
};
