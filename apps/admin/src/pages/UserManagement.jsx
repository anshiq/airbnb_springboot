import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import { usersApi } from '../api/users.js';
import { useAuth } from '../context/AuthContext.jsx';

const ROLES = ['', 'SUPER_ADMIN', 'PROPERTY_MANAGER', 'HOST', 'GUEST', 'SUPPORT_AGENT'];
const STATUSES = ['', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];

export default function UserManagement() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isSuperAdmin = hasRole('SUPER_ADMIN');

  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [roleModal, setRoleModal] = useState({ open: false, user: null, newRole: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
  }, [page, roleFilter, statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.getUsers({
        page,
        size: 15,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(0);
    load();
  }

  async function handleStatusToggle(user) {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await usersApi.updateUserStatus(user.id, newStatus);
      showToast(`User ${newStatus.toLowerCase()} successfully`);
      load();
    } catch (e) {
      showToast(e.message, true);
    }
  }

  async function handleRoleChange() {
    setSubmitting(true);
    try {
      await usersApi.updateUserRole(roleModal.user.id, roleModal.newRole);
      showToast('Role updated successfully');
      setRoleModal({ open: false });
      load();
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      await usersApi.deleteUser(deleteModal.user.id);
      showToast('User deleted');
      setDeleteModal({ open: false });
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

      {/* Search + filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="input flex-1 min-w-[200px]"
          />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="input w-auto"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r || 'All Roles'}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="input w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || 'All Statuses'}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Search</button>
          <button
            type="button"
            onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); setPage(0); }}
            className="btn-secondary"
          >
            Clear
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {data?.totalElements ?? 0} user{data?.totalElements !== 1 ? 's' : ''} found
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Verified', 'Joined', 'Actions'].map((h) => (
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
                    No users found
                  </td>
                </tr>
              ) : (
                data.content.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold flex-shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="table-td text-gray-500 text-xs">{u.email}</td>
                    <td className="table-td"><Badge status={u.role} /></td>
                    <td className="table-td"><Badge status={u.status} /></td>
                    <td className="table-td">
                      <Badge status={u.emailVerified ? 'YES' : 'NO'} label={u.emailVerified ? 'Yes' : 'No'} />
                    </td>
                    <td className="table-td whitespace-nowrap text-gray-500 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => navigate(`/users/${u.id}`)}
                          className="px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => setRoleModal({ open: true, user: u, newRole: u.role })}
                            className="px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Role
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusToggle(u)}
                          className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'text-orange-700 hover:bg-orange-50'
                              : 'text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => setDeleteModal({ open: true, user: u })}
                            className="px-2 py-1 text-xs text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Delete
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

      {/* Role change modal */}
      <Modal
        open={roleModal.open}
        title="Change User Role"
        onClose={() => setRoleModal({ open: false })}
        onConfirm={handleRoleChange}
        confirmText="Update Role"
        loading={submitting}
      >
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800">
              {roleModal.user?.firstName} {roleModal.user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{roleModal.user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Role</label>
            <select
              value={roleModal.newRole}
              onChange={(e) => setRoleModal((m) => ({ ...m, newRole: e.target.value }))}
              className="input"
            >
              {ROLES.filter(Boolean).map((r) => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={deleteModal.open}
        title="Delete User"
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        loading={submitting}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to permanently delete{' '}
          <strong>{deleteModal.user?.firstName} {deleteModal.user?.lastName}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
