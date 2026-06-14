import { useState, useEffect } from 'react';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import { adminApi } from '../api/admin.js';

const ACTIONS = [
  { label: 'Approve', action: 'ACTIVE', cls: 'text-green-700 hover:bg-green-50', needsReason: false },
  { label: 'Reject', action: 'REJECTED', cls: 'text-red-700 hover:bg-red-50', needsReason: true },
  { label: 'Suspend', action: 'SUSPENDED', cls: 'text-orange-700 hover:bg-orange-50', needsReason: true },
  { label: 'Archive', action: 'ARCHIVED', cls: 'text-gray-700 hover:bg-gray-100', needsReason: true },
];

export default function ListingsModeration() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState({ open: false, listing: null, action: null, needsReason: false });
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    load();
  }, [page]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getPendingListings(page, 10);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openModal(listing, actionObj) {
    setModal({ open: true, listing, action: actionObj.action, needsReason: actionObj.needsReason, label: actionObj.label });
    setReason('');
  }

  async function handleConfirm() {
    if (modal.needsReason && !reason.trim()) return;
    setSubmitting(true);
    try {
      await adminApi.moderateListing(modal.listing.id, modal.action, reason || undefined);
      showToast(`Listing ${modal.action.toLowerCase()} successfully`);
      setModal({ open: false });
      load();
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setSubmitting(false);
    }
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(''), 3500);
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Pending Listings</h3>
          <p className="text-sm text-gray-500">
            {data?.totalElements ?? 0} listing{data?.totalElements !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
        <button onClick={load} className="btn-secondary text-xs">↻ Refresh</button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Host', 'Type', 'Price/night', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : !(data?.content?.length) ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                    🎉 No pending listings — all clear!
                  </td>
                </tr>
              ) : (
                data.content.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td max-w-[180px]">
                      <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {listing.location?.city}, {listing.location?.country}
                      </p>
                    </td>
                    <td className="table-td whitespace-nowrap">
                      <p className="text-gray-900">{listing.host?.firstName} {listing.host?.lastName}</p>
                      <p className="text-xs text-gray-400">{listing.host?.email}</p>
                    </td>
                    <td className="table-td whitespace-nowrap">{listing.propertyType}</td>
                    <td className="table-td tabular-nums">${listing.basePrice}</td>
                    <td className="table-td">
                      <Badge status={listing.status ?? 'PENDING'} />
                    </td>
                    <td className="table-td whitespace-nowrap text-gray-500 text-xs">
                      {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 flex-wrap">
                        {ACTIONS.map((a) => (
                          <button
                            key={a.action}
                            onClick={() => openModal(listing, a)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${a.cls}`}
                          >
                            {a.label}
                          </button>
                        ))}
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

      {/* Moderation Modal */}
      <Modal
        open={modal.open}
        title={`${modal.label} Listing`}
        onClose={() => setModal({ open: false })}
        onConfirm={handleConfirm}
        confirmText={modal.label}
        confirmClass={
          modal.action === 'ACTIVE'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : modal.action === 'REJECTED' || modal.action === 'SUSPENDED'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-700 hover:bg-gray-800 text-white'
        }
        loading={submitting}
      >
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800">{modal.listing?.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {modal.listing?.host?.firstName} {modal.listing?.host?.lastName}
            </p>
          </div>

          {modal.action !== 'ACTIVE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason {modal.needsReason && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder={`Enter reason for ${modal.label?.toLowerCase()}…`}
              />
            </div>
          )}

          {modal.action === 'ACTIVE' && (
            <p className="text-sm text-gray-600">
              This will make the listing publicly visible. Are you sure?
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
