import { useState, useEffect } from "react";
import Modal from "../components/Modal.jsx";
import Pagination from "../components/Pagination.jsx";
import { adminApi } from "../api/admin.js";

export default function HostApplications() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Detail view modal
  const [detailModal, setDetailModal] = useState({ open: false, app: null });
  // Action modal
  const [actionModal, setActionModal] = useState({
    open: false,
    app: null,
    approved: null,
  });
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    load();
  }, [page]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getPendingHostApplications(page, 10);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openAction(app, approved) {
    setActionModal({ open: true, app, approved });
    setNote("");
  }

  async function handleConfirm() {
    if (!note.trim()) {
      setNote("");
      return;
    } // note is required by API
    setSubmitting(true);
    try {
      await adminApi.reviewHostApplication(
        actionModal.app.id,
        actionModal.approved,
        note,
      );
      showToast(
        `Application ${actionModal.approved ? "approved" : "rejected"} successfully`,
      );
      setActionModal({ open: false });
      load();
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setSubmitting(false);
    }
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(""), 3500);
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

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Pending Host Applications
          </h3>
          <p className="text-sm text-gray-500">
            {data?.totalElements ?? 0} application
            {data?.totalElements !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
        <button onClick={load} className="btn-secondary text-xs">
          ↻ Refresh
        </button>
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
                  "Applicant",
                  "Email",
                  "Bio",
                  "Reason",
                  "Submitted",
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
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : !data?.content?.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400 text-sm"
                  >
                    No pending host applications
                  </td>
                </tr>
              ) : (
                data.content.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="table-td whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold flex-shrink-0">
                          {(app.userFullName ?? "").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {app.userFullName ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="table-td text-gray-500 text-xs">
                      {app.userEmail ?? "—"}
                    </td>
                    <td className="table-td max-w-[160px]">
                      <p className="text-gray-600 truncate text-xs">
                        {app.bio ?? "—"}
                      </p>
                    </td>
                    <td className="table-td max-w-[160px]">
                      <p className="text-gray-600 truncate text-xs">
                        {app.reason ?? "—"}
                      </p>
                    </td>
                    <td className="table-td whitespace-nowrap text-gray-500 text-xs">
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailModal({ open: true, app })}
                          className="px-2.5 py-1 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openAction(app, true)}
                          className="px-2.5 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openAction(app, false)}
                          className="px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
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

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
      />

      {/* Detail Modal */}
      <Modal
        open={detailModal.open}
        title="Host Application Details"
        onClose={() => setDetailModal({ open: false })}
      >
        {detailModal.app && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">
                {(detailModal.app.userFullName ?? "").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {detailModal.app.userFullName}
                </p>
                <p className="text-xs text-gray-500">
                  {detailModal.app.userEmail}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Bio
              </p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-xs leading-relaxed">
                {detailModal.app.bio ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Why they want to be a host
              </p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-xs leading-relaxed">
                {detailModal.app.reason ?? "—"}
              </p>
            </div>
            {detailModal.app.governmentIdUrl && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Government ID
                </p>
                <a
                  href={detailModal.app.governmentIdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 text-xs hover:underline"
                >
                  View document →
                </a>
              </div>
            )}
            <div className="text-xs text-gray-400">
              Submitted:{" "}
              {detailModal.app.createdAt
                ? new Date(detailModal.app.createdAt).toLocaleString()
                : "—"}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setDetailModal({ open: false });
                  openAction(detailModal.app, true);
                }}
                className="btn-primary text-sm flex-1"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setDetailModal({ open: false });
                  openAction(detailModal.app, false);
                }}
                className="px-4 py-2 text-sm text-red-700 border border-red-200 rounded-lg hover:bg-red-50 flex-1"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        open={actionModal.open}
        title={
          actionModal.approved
            ? "Approve Host Application"
            : "Reject Host Application"
        }
        onClose={() => setActionModal({ open: false })}
        onConfirm={handleConfirm}
        confirmText={actionModal.approved ? "Approve" : "Reject"}
        confirmClass={
          actionModal.approved
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }
        loading={submitting}
      >
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800">
              {actionModal.app?.userFullName}
            </p>
            <p className="text-xs text-gray-500">
              {actionModal.app?.userEmail}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Note to applicant <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 font-normal ml-1">
                (required — sent via email)
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder={
                actionModal.approved
                  ? "Welcome message or instructions for the new host…"
                  : "Reason for rejection and any guidance…"
              }
            />
            {note.trim() === "" && (
              <p className="text-xs text-red-500 mt-1">
                A note is required by the system.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
