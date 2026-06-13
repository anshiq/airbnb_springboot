import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import Badge, { bookingStatusVariant } from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import Modal from '@/components/common/Modal';
import Pagination from '@/components/common/Pagination';
import { formatDate, formatCurrency } from '@/utils/format';
import type { BookingResponse, BookingStatus } from '@/types';

const STATUS_TABS: { label: string; value: BookingStatus | undefined }[] = [
  { label: 'All',       value: undefined },
  { label: 'Pending',   value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function HostBookingsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState<BookingResponse | null>(null);
  const [cancelTarget, setCancelTarget]   = useState<BookingResponse | null>(null);
  const [cancelReason, setCancelReason]   = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['host-bookings', status, page],
    queryFn: () => bookingsApi.getHostBookings(status, page, 20),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.confirm(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['host-bookings'] }); setConfirmTarget(null); },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => bookingsApi.cancel(id, reason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['host-bookings'] }); setCancelTarget(null); setCancelReason(''); },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Bookings</h1>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {STATUS_TABS.map(({ label, value }) => (
          <button key={label} onClick={() => { setStatus(value); setPage(0); }}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              status === value ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-brand-500" /></div>
      ) : data?.content.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Guest','Property','Check-in','Check-out','Nights','Total','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.content.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">{b.guest.firstName} {b.guest.lastName}</p>
                        <p className="text-xs text-gray-500">{b.guest.email}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-[160px] truncate">{b.property.title}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(b.checkInDate)}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(b.checkOutDate)}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 text-center">{b.nights}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(b.totalPrice)}</td>
                      <td className="px-4 py-4">
                        <Badge variant={bookingStatusVariant(b.status)}>{b.status}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5">
                          {b.status === 'PENDING' && (
                            <button onClick={() => setConfirmTarget(b)}
                              className="text-xs bg-green-50 text-green-700 font-medium px-2 py-1 rounded-lg hover:bg-green-100">Confirm</button>
                          )}
                          {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                            <button onClick={() => setCancelTarget(b)}
                              className="text-xs bg-red-50 text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-100">Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {data && <Pagination currentPage={data.number} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* Confirm modal */}
      <Modal isOpen={!!confirmTarget} onClose={() => setConfirmTarget(null)} title="Confirm Booking" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Confirm booking for <strong>{confirmTarget?.guest.firstName}</strong>? ({formatDate(confirmTarget?.checkInDate ?? '')} → {formatDate(confirmTarget?.checkOutDate ?? '')})
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirmTarget(null)} className="btn-outline text-sm">Cancel</button>
          <button onClick={() => confirmTarget && confirmMutation.mutate(confirmTarget.id)}
            disabled={confirmMutation.isPending}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50">
            {confirmMutation.isPending ? 'Confirming…' : 'Confirm'}
          </button>
        </div>
      </Modal>

      {/* Cancel modal */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Booking" size="sm">
        <p className="text-sm text-gray-600 mb-4">Cancel booking for <strong>{cancelTarget?.guest.firstName}</strong>?</p>
        <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation" rows={3} className="input-base resize-none mb-4" />
        <div className="flex justify-end gap-2">
          <button onClick={() => setCancelTarget(null)} className="btn-outline text-sm">Keep</button>
          <button onClick={() => cancelTarget && cancelMutation.mutate({ id: cancelTarget.id, reason: cancelReason })}
            disabled={cancelMutation.isPending}
            className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-600 disabled:opacity-50">
            {cancelMutation.isPending ? 'Cancelling…' : 'Cancel booking'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
