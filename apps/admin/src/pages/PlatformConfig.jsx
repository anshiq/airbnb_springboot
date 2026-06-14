import { useState, useEffect } from 'react';
import Modal from '../components/Modal.jsx';
import { adminApi } from '../api/admin.js';

export default function PlatformConfig() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editModal, setEditModal] = useState({ open: false, config: null });
  const [form, setForm] = useState({ key: '', value: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getConfig();
      setConfigs(Array.isArray(res) ? res : res?.content ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(config) {
    setEditModal({ open: true, config });
    setForm({
      key: config.key ?? '',
      value: config.value ?? '',
      description: config.description ?? '',
    });
  }

  async function handleSave() {
    if (!form.key.trim() || !form.value.trim()) return;
    setSubmitting(true);
    try {
      await adminApi.updateConfig(form.key, form.value, form.description);
      showToast('Configuration updated');
      setEditModal({ open: false });
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
          <h3 className="text-lg font-semibold text-gray-800">Platform Configuration</h3>
          <p className="text-sm text-gray-500">Manage global platform settings and parameters</p>
        </div>
        <button onClick={load} className="btn-secondary text-xs">↻ Refresh</button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Key', 'Value', 'Description', 'Last Updated', 'Actions'].map((h) => (
                    <th key={h} className="table-th whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {configs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                      No configuration entries found
                    </td>
                  </tr>
                ) : (
                  configs.map((c, i) => (
                    <tr key={c.id ?? c.key ?? i} className="hover:bg-gray-50 transition-colors">
                      <td className="table-td">
                        <code className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-mono">
                          {c.key}
                        </code>
                      </td>
                      <td className="table-td max-w-[200px]">
                        <p className="text-gray-900 truncate font-medium text-sm">{c.value}</p>
                      </td>
                      <td className="table-td max-w-[250px]">
                        <p className="text-gray-500 text-xs truncate">{c.description ?? '—'}</p>
                      </td>
                      <td className="table-td whitespace-nowrap text-gray-500 text-xs">
                        {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '—'}
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => openEdit(c)}
                          className="px-3 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={editModal.open}
        title="Edit Configuration"
        onClose={() => setEditModal({ open: false })}
        onConfirm={handleSave}
        confirmText="Save Changes"
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Key</label>
            <input
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              className="input font-mono"
              placeholder="config.key.name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Value <span className="text-red-500">*</span>
            </label>
            <input
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              className="input"
              placeholder="Configuration value"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="input resize-none"
              placeholder="What does this config control?"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
