import { useState, useEffect, useCallback } from 'react';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import { bookingsApi } from '../api/bookings.js';
import { paymentsApi } from '../api/payments.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

export default function BookingManagement() {
  const { hasRole } = useAuth();
  const canRefund = hasRole('SUPER_ADMIN', 'PROPERTY_MANAGER');

  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [cancelReason, setCancelReason] = useState('');

  const [refundModal, setRefundModal] = useState({ open: false, booking: null });
  const [refundAmount, setRefundAmount] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingsApi.getAllBookings({
        page,
        size: 15,
        status: statusFilter || undefined,
      });
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetail(booking) {
    setSelectedBooking(booking);
    setDetailModal(true);
    try {
      const full = await bookingsApi.getBooking(booking.id);
      setSelectedBooking(full);
    } catch (_) {}
  }

  async function handleCancel() {
    if (!cancelReason.trim()) return;
    setSubmitting(true);
    try {
      await bookingsApi.cancelBooking(cancelModal.booking.id, cancelReason);
      showToast('Booking cancelled');
      setCancelModal({ open: false });
      load();
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefund() {
    const amount = parseFloat(refundAmount);
    if (!amount || amount <= 0) return;
    setSubmitting(true);
    try {
      await paymentsApi.refund(refundModal.booking.id, amount);
      showToast('Refund processed successfully');
      setRefundModal({ open: false });
      load();
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setSubmitting(false);
    }
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  }

  function fmtCurrency(n) {
    return n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-gray-500">
          {data?.totalElements ?? 0} bookings
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Guest', 'Property', 'Check-in', 'Check-out', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : !(data?.content?.length) ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No bookings found
                  </td>
                </tr>
              ) : (
                data.content.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <span className="font-mono text-xs text-gray-500">
                        #{String(b.id).slice(-8)}
                      </span>
                    </td>
                    <td className="table-td whitespace-nowrap">
                      <p className="text-gray-900 font-medium">
                        {b.guest?.firstName ?? b.guestName ?? '—'} {b.guest?.lastName ?? ''}
                      </p>
                      <p className="text-xs text-gray-400">{b.guest?.email ?? ''}</p>
                    </td>
                    <td className="table-td max-w-[160px]">
                      <p className="truncate text-gray-900">
                        {b.property?.title ?? b.propertyTitle ?? '—'}
                      </p>
                    </td>
                    <td className="table-td whitespace-nowrap text-xs">{b.checkInDate ?? '—'}</td>
                    <td className="table-td whitespace-nowrap text-xs">{b.checkOutDate ?? '—'}</td>
                    <td className="table-td tabular-nums font-medium">
                      {fmtCurrency(b.totalPrice ?? b.totalAmount)}
                    </td>
                    <td className="table-td"><Badge status={b.status} /></td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => openDetail(b)}
                          className="px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        {!['CANCELLED', 'COMPLETED', 'REFUNDED'].includes(b.status) && (
                          <button
                            onClick={() => { setCancelModal({ open: true, booking: b }); setCancelReason(''); }}
                            className="px-2 py-1 text-xs text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        {canRefund && ['COMPLETED', 'CANCELLED'].includes(b.status) && (
                          <button
                            onClick={() => { setRefundModal({ open: true, booking: b }); setRefundAmount(''); }}
                            className="px-2 py-1 text-xs text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />

      {/* Detail Modal */}
      <Modal
        open={detailModal}
        title="Booking Details"
        onClose={() => setDetailModal(false)}
      >
        {selectedBooking && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Booking ID</p>
                <p className="font-mono text-gray-800 text-xs">{selectedBooking.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <Badge status={selectedBooking.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Guest</p>
                <p className="text-gray-800">
                  {selectedBooking.guest?.firstName} {selectedBooking.guest?.lastName}
                </p>
                <p className="text-xs text-gray-400">{selectedBooking.guest?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Property</p>
                <p className="text-gray-800">{selectedBooking.property?.title ?? selectedBooking.propertyTitle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Check-in</p>
                <p className="text-gray-800">{selectedBooking.checkInDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Check-out</p>
                <p className="text-gray-800">{selectedBooking.checkOutDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Guests</p>
                <p className="text-gray-800">{selectedBooking.numGuests ?? selectedBooking.guestCount ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="font-semibold text-gray-900">
                  {fmtCurrency(selectedBooking.totalPrice ?? selectedBooking.totalAmount)}
                </p>
              </div>
            </div>
            {selectedBooking.specialRequests && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Special Requests</p>
                <p className="text-gray-700 text-xs">{selectedBooking.specialRequests}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal
        open={cancelModal.open}
        title="Cancel Booking"
        onClose={() => setCancelModal({ open: false })}
        onConfirm={handleCancel}
        confirmText="Cancel Booking"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        loading={submitting}
      >
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-800">
              Booking #{String(cancelModal.booking?.id ?? '').slice(-8)}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {cancelModal.booking?.checkInDate} → {cancelModal.booking?.checkOutDate}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Enter reason for cancellation…"
            />
          </div>
        </div>
      </Modal>

      {/* Refund Modal */}
      <Modal
        open={refundModal.open}
        title="Process Refund"
        onClose={() => setRefundModal({ open: false })}
        onConfirm={handleRefund}
        confirmText="Issue Refund"
        confirmClass="bg-purple-600 hover:bg-purple-700 text-white"
        loading={submitting}
      >
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-800">
              Booking #{String(refundModal.booking?.id ?? '').slice(-8)}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              Total paid: {fmtCurrency(refundModal.booking?.totalPrice ?? refundModal.booking?.totalAmount)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Refund Amount ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="input"
              placeholder="0.00"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
