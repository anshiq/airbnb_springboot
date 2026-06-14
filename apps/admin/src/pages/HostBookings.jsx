import { useState, useEffect, useCallback } from "react";
import Badge from "../components/Badge.jsx";
import Modal from "../components/Modal.jsx";
import Pagination from "../components/Pagination.jsx";
import { bookingsApi } from "../api/bookings.js";

const STATUSES = [
  "",
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
];

export default function HostBookings() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelModal, setCancelModal] = useState({
    open: false,
    booking: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await bookingsApi.getHostBookings({
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

  async function handleConfirm(booking) {
    try {
      await bookingsApi.confirmBooking(booking.id);
      showToast("Booking confirmed");
      load();
    } catch (e) {
      showToast(e.message, true);
    }
  }

  async function handleCancel() {
    if (!cancelReason.trim()) return;
    setSubmitting(true);
    try {
      await bookingsApi.cancelHostBooking(cancelModal.booking.id, cancelReason);
      showToast("Booking cancelled");
      setCancelModal({ open: false });
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
    return n != null
      ? `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : "—";
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.isError ? "bg-red-600 text-white" : "bg-green-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(0);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-gray-500">
          {data?.totalElements ?? 0} bookings
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Booking ID",
                  "Guest",
                  "Property",
                  "Check-in",
                  "Check-out",
                  "Guests",
                  "Total",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : !data?.content?.length ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-gray-400 text-sm"
                  >
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
                        {b.guest?.firstName ?? "—"} {b.guest?.lastName ?? ""}
                      </p>
                      <p className="text-xs text-gray-400">
                        {b.guest?.email ?? ""}
                      </p>
                    </td>
                    <td className="table-td max-w-[140px]">
                      <p className="text-gray-800 truncate text-xs">
                        {b.property?.title ?? b.propertyTitle ?? "—"}
                      </p>
                    </td>
                    <td className="table-td whitespace-nowrap text-xs">
                      {b.checkInDate ?? "—"}
                    </td>
                    <td className="table-td whitespace-nowrap text-xs">
                      {b.checkOutDate ?? "—"}
                    </td>
                    <td className="table-td text-center">
                      {b.guestsCount ?? "—"}
                    </td>
                    <td className="table-td tabular-nums font-medium">
                      {fmtCurrency(b.totalPrice ?? b.totalAmount)}
                    </td>
                    <td className="table-td">
                      <Badge status={b.status} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 flex-wrap">
                        {b.status === "PENDING" && (
                          <button
                            onClick={() => handleConfirm(b)}
                            className="px-2.5 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {!["CANCELLED", "COMPLETED"].includes(b.status) && (
                          <button
                            onClick={() => {
                              setCancelModal({ open: true, booking: b });
                              setCancelReason("");
                            }}
                            className="px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          >
                            Cancel
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

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
      />

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
              {cancelModal.booking?.guest?.firstName}{" "}
              {cancelModal.booking?.guest?.lastName}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {cancelModal.booking?.checkInDate} →{" "}
              {cancelModal.booking?.checkOutDate}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Reason for cancellation…"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
