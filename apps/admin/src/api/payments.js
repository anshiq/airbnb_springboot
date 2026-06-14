import { api } from './client.js';

export const paymentsApi = {
  refund: (bookingId, amount) => api.post('/payments/refund', { bookingId, amount }),
};
