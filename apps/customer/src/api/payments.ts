import { api } from './client';
import type { PaymentResponse, CreateOrderRequest, PaymentVerifyRequest } from '@/types';

export const paymentsApi = {
  createOrder:  (data: CreateOrderRequest)  => api.post<PaymentResponse>('/payments/create-order', data),
  verify:       (data: PaymentVerifyRequest) => api.post<PaymentResponse>('/payments/verify', data),
  getByBooking: (bookingId: number)          => api.get<PaymentResponse>(`/payments/booking/${bookingId}`),
};
