import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import { usersApi } from '../api/users.js';
import { useAuth } from '../context/AuthContext.jsx';

const ROLES = ['SUPER_ADMIN', 'PROPERTY_MANAGER', 'HOST', 'GUEST', 'SUPPORT_AGENT'];

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isSuperAdmin = hasRole('SUPER_ADMIN');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [roleModal, setRoleModal] = useState({ open: false, newRole: '' });
  const [deleteModal, setDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.getUser(id);
      setUser(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusToggle() {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await usersApi.updateUserStatus(user.id, newStatus);
      setUser((u) => ({ ...u, status: newStatus }));
      showToast(`User ${newStatus.toLowerCase()}`);
    } catch (e) {
      showToast(e.message, true);
    }
  }

  async function handleRoleChange() {
    setSubmitting(true);
    try {
      await usersApi.updateUserRole(user.id, roleModal.newRole);
      setUser((u) => ({ ...u, role: roleModal.newRole }));
      showToast('Role updated');
      setRoleModal({ open: false });
    } catch (e) {
      showToast(e.message, true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      await usersApi.deleteUser(user.id);
      navigate('/users');
    } catch (e) {
      showToast(e.message, true);
      setSubmitting(false);
      setDeleteModal(false);
    }
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
        <button onClick={() => navigate('/users')} className="btn-secondary">← Back to Users</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Back + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/users')}
          className="btn-secondary flex items-center gap-1"
        >
          ← Back to Users
        </button>
        <div className="flex gap-2 flex-wrap">
          {isSuperAdmin && (
            <button
              onClick={() => setRoleModal({ open: true, newRole: user.role })}
              className="btn-secondary"
            >
              Change Role
            </button>
          )}
          <button
            onClick={handleStatusToggle}
            className={user.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}
          >
            {user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
          </button>
          {isSuperAdmin && (
            <button onClick={() => setDeleteModal(true)} className="btn-danger">
              Delete User
            </button>
          )}
        </div>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold flex-shrink-0">
            {user?.profilePhotoUrl ? (
              <img
                src={user.profilePhotoUrl}
                alt=""
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <Badge status={user.role} />
              <Badge status={user.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
            {user.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{user.bio}</p>}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="card p-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">Account Details</h4>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <Field label="User ID" value={user.id} />
          <Field label="Email Verified" value={user.emailVerified ? 'Yes' : 'No'} />
          <Field label="Phone" value={user.phone} />
          <Field label="Role" value={user.role?.replace(/_/g, ' ')} />
          <Field label="Status" value={user.status} />
          <Field
            label="Joined"
            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null}
          />
          <Field
            label="Last Updated"
            value={user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : null}
          />
        </dl>
      </div>

      {/* Role modal */}
      <Modal
        open={roleModal.open}
        title="Change User Role"
        onClose={() => setRoleModal({ open: false })}
        onConfirm={handleRoleChange}
        confirmText="Update Role"
        loading={submitting}
      >
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            Changing role for <strong>{user.firstName} {user.lastName}</strong>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Role</label>
            <select
              value={roleModal.newRole}
              onChange={(e) => setRoleModal((m) => ({ ...m, newRole: e.target.value }))}
              className="input"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={deleteModal}
        title="Delete User"
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText="Delete Permanently"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        loading={submitting}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to permanently delete{' '}
          <strong>{user.firstName} {user.lastName}</strong>? All their data will be removed and
          this cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
