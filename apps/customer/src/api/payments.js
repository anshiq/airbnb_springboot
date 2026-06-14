import { api } from './client';

export const paymentsApi = {
  createOrder: (bookingId) => api.post('/payments/create-order', { bookingId }),
  verify: (razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    api.post('/payments/verify', { razorpayOrderId, razorpayPaymentId, razorpaySignature }),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};
