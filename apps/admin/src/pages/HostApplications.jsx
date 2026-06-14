import { useState, useEffect } from 'react';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import { adminApi } from '../api/admin.js';

export default function HostApplications() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState({ open: false, app: null, approved: null });
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    load();
  }, [page]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getPendingHostApplications(page, 10);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openModal(app, approved) {
    setModal({ open: true, app, approved });
    setNote('');
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await adminApi.reviewHostApplication(modal.app.id, modal.approved, note);
      showToast(`Application ${modal.approved ? 'approved' : 'rejected'} successfully`);
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
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Pending Host Applications</h3>
          <p className="text-sm text-gray-500">
            {data?.totalElements ?? 0} application{data?.totalElements !== 1 ? 's' : ''} awaiting review
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
                {['Applicant', 'Email', 'Phone', 'Bio', 'Submitted', 'Actions'].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : !(data?.content?.length) ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No pending host applications
                  </td>
                </tr>
              ) : (
                data.content.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
                          {app.user?.firstName?.[0]}{app.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {app.user?.firstName} {app.user?.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-500">{app.user?.email ?? app.email}</td>
                    <td className="table-td text-gray-500">{app.user?.phone ?? app.phone ?? '—'}</td>
                    <td className="table-td max-w-[200px]">
                      <p className="text-gray-600 truncate text-xs">
                        {app.bio ?? app.user?.bio ?? '—'}
                      </p>
                    </td>
                    <td className="table-td whitespace-nowrap text-gray-500 text-xs">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(app, true)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openModal(app, false)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        >
                          Reject
                        </button>
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

      <Modal
        open={modal.open}
        title={modal.approved ? 'Approve Host Application' : 'Reject Host Application'}
        onClose={() => setModal({ open: false })}
        onConfirm={handleConfirm}
        confirmText={modal.approved ? 'Approve' : 'Reject'}
        confirmClass={
          modal.approved
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }
        loading={submitting}
      >
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800">
              {modal.app?.user?.firstName} {modal.app?.user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{modal.app?.user?.email ?? modal.app?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder={`Add a note to send to the applicant…`}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
