import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import { propertiesApi } from '../api/properties.js';

const PROPERTY_TYPES = [
  'APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'STUDIO', 'CABIN', 'COTTAGE', 'LOFT', 'OTHER',
];

export default function HostDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, property: null });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
  }, [page]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await propertiesApi.getMyListings(page, 10);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(id) {
    try {
      await propertiesApi.submitProperty(id);
      showToast('Property submitted for review');
      load();
    } catch (e) {
      showToast(e.message, true);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      await propertiesApi.deleteProperty(deleteModal.property.id);
      showToast('Property deleted');
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

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">My Properties</h3>
          <p className="text-sm text-gray-500">
            {data?.totalElements ?? 0} propert{data?.totalElements !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <Link to="/my-listings/new" className="btn-primary flex items-center gap-1">
          + New Property
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : !(data?.content?.length) ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🏡</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No properties yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first listing to start accepting bookings.
          </p>
          <Link to="/my-listings/new" className="btn-primary inline-flex">
            Create Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.content.map((p) => (
            <div key={p.id} className="card overflow-hidden hover:shadow-md transition-shadow">
              {/* Photo */}
              <div className="h-40 bg-gradient-to-br from-indigo-100 to-blue-50 relative overflow-hidden">
                {p.photos?.[0]?.url ? (
                  <img
                    src={p.photos[0].url}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-indigo-300">
                    🏠
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge status={p.status} />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 truncate">{p.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {p.location?.city}, {p.location?.country}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-800">
                    ${p.basePrice}<span className="text-xs text-gray-400">/night</span>
                  </span>
                  <span className="text-xs text-gray-500">{p.propertyType}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Link
                    to={`/my-listings/${p.id}`}
                    className="px-2.5 py-1 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    to={`/my-listings/${p.id}/edit`}
                    className="px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                  >
                    Edit
                  </Link>
                  {(p.status === 'INACTIVE' || p.status === 'DRAFT') && (
                    <button
                      onClick={() => handleSubmit(p.id)}
                      className="px-2.5 py-1 text-xs text-green-700 hover:bg-green-50 rounded-lg border border-green-200 transition-colors"
                    >
                      Submit
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModal({ open: true, property: p })}
                    className="px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />

      <Modal
        open={deleteModal.open}
        title="Delete Property"
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        loading={submitting}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <strong>{deleteModal.property?.title}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
