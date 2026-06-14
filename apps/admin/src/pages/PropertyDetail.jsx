import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import { propertiesApi } from '../api/properties.js';

// Simple calendar component for availability
function AvailabilityCalendar({ propertyId }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, [year, month]);

  async function loadAvailability() {
    setLoading(true);
    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
    try {
      const data = await propertiesApi.getAvailability(propertyId, start, end);
      setAvailability(Array.isArray(data) ? data : data?.dates ?? []);
    } catch (_) {}
    setLoading(false);
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const availMap = {};
  availability.forEach((a) => { availMap[a.date] = a; });

  function pad(n) { return String(n).padStart(2, '0'); }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const days = [];
  for (let i = 0; i < firstDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">‹</button>
        <span className="text-sm font-semibold text-gray-800">
          {monthNames[month]} {year}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">›</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
          const avail = availMap[dateStr];
          const isPast = new Date(dateStr) < today;
          const isAvailable = avail ? avail.available !== false : !isPast;
          return (
            <div
              key={d}
              title={avail?.customPrice ? `$${avail.customPrice}` : undefined}
              className={`py-1.5 text-xs rounded transition-colors ${
                isPast
                  ? 'text-gray-300 bg-gray-50'
                  : isAvailable
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'bg-red-50 text-red-500 line-through'
              }`}
            >
              {d}
              {avail?.customPrice && !isPast && (
                <div className="text-[9px] text-indigo-500 leading-none">${avail.customPrice}</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 inline-block" /> Blocked
        </span>
      </div>
      {loading && <p className="text-xs text-gray-400 mt-1 text-center">Loading…</p>}
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [responseModal, setResponseModal] = useState({ open: false, review: null });
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [prop, revs] = await Promise.all([
        propertiesApi.getProperty(id),
        propertiesApi.getReviews(id).catch(() => []),
      ]);
      setProperty(prop);
      setReviews(Array.isArray(revs) ? revs : revs?.content ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitForReview() {
    try {
      await propertiesApi.submitProperty(id);
      showToast('Submitted for review');
      load();
    } catch (e) {
      showToast(e.message, true);
    }
  }

  async function handleHostResponse() {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try {
      await propertiesApi.respondToReview(responseModal.review.id, responseText);
      showToast('Response posted');
      setResponseModal({ open: false });
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
        <button onClick={() => navigate('/my-listings')} className="btn-secondary">← Back</button>
      </div>
    );
  }

  const primaryPhoto = property?.photos?.find((p) => p.primary) ?? property?.photos?.[0];

  return (
    <div className="space-y-4 max-w-4xl">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => navigate('/my-listings')} className="btn-secondary text-xs">
          ← Back to My Properties
        </button>
        <div className="flex gap-2 flex-wrap">
          {(property?.status === 'INACTIVE' || property?.status === 'DRAFT') && (
            <button onClick={handleSubmitForReview} className="btn-primary text-xs">
              Submit for Review
            </button>
          )}
          <Link to={`/my-listings/${id}/edit`} className="btn-secondary text-xs">
            Edit Property
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="h-52 bg-gradient-to-br from-indigo-100 to-blue-50 relative">
          {primaryPhoto?.url ? (
            <img src={primaryPhoto.url} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-indigo-200">🏠</div>
          )}
          <div className="absolute top-3 right-3">
            <Badge status={property.status} />
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{property.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {property.location?.city}, {property.location?.state} {property.location?.country}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">${property.basePrice}</p>
              <p className="text-xs text-gray-400">per night</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>👥 {property.maxGuests} guests</span>
            <span>🛏 {property.bedrooms} bed</span>
            <span>🛁 {property.bathrooms} bath</span>
            <span className="capitalize">{property.propertyType?.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['details', 'availability', 'reviews', 'photos'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {activeTab === 'details' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Pricing & Policies</h4>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                ['Base Price', `$${property.basePrice}/night`],
                ['Cleaning Fee', property.cleaningFee ? `$${property.cleaningFee}` : 'None'],
                ['Min Nights', property.minNights],
                ['Max Nights', property.maxNights],
                ['Booking Type', property.bookingType?.replace('_', ' ')],
                ['Cancellation', property.cancellationPolicy],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
                  <dd className="mt-1 text-gray-900">{value ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {property.amenities?.length > 0 && (
            <div className="card p-5">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a.id ?? a} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium">
                    {a.name ?? a.label ?? a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Availability tab */}
      {activeTab === 'availability' && (
        <div className="card p-5 max-w-sm">
          <h4 className="font-semibold text-gray-800 mb-4 text-sm">Availability Calendar</h4>
          <AvailabilityCalendar propertyId={id} />
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">
              Guest Reviews ({reviews.length})
            </h4>
          </div>
          {reviews.length === 0 ? (
            <div className="card p-8 text-center text-gray-400 text-sm">No reviews yet</div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                      {r.guest?.firstName?.[0] ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {r.guest?.firstName} {r.guest?.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        {'★'.repeat(r.rating ?? 0)}{'☆'.repeat(5 - (r.rating ?? 0))}
                        <span className="text-gray-400 ml-1">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!r.hostResponse && (
                    <button
                      onClick={() => { setResponseModal({ open: true, review: r }); setResponseText(''); }}
                      className="px-2.5 py-1 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                    >
                      Respond
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700">{r.comment ?? r.text}</p>
                {r.hostResponse && (
                  <div className="ml-4 p-3 bg-gray-50 rounded-lg border-l-2 border-indigo-300">
                    <p className="text-xs font-medium text-indigo-700 mb-1">Your Response</p>
                    <p className="text-sm text-gray-600">{r.hostResponse}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Photos tab */}
      {activeTab === 'photos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">
              Photos ({property.photos?.length ?? 0})
            </h4>
            <Link to={`/my-listings/${id}/edit`} className="text-xs text-indigo-600 hover:underline">
              Manage photos →
            </Link>
          </div>
          {!(property.photos?.length) ? (
            <div className="card p-8 text-center text-gray-400 text-sm">No photos added</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.photos.map((photo, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <img
                    src={photo.url}
                    alt={photo.caption ?? `Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; }}
                  />
                  {photo.primary && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded font-medium">
                      Primary
                    </span>
                  )}
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <p className="text-white text-xs truncate">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Host response modal */}
      <Modal
        open={responseModal.open}
        title="Respond to Review"
        onClose={() => setResponseModal({ open: false })}
        onConfirm={handleHostResponse}
        confirmText="Post Response"
        loading={submitting}
      >
        <div className="space-y-3">
          {responseModal.review && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-yellow-500 mb-1">
                {'★'.repeat(responseModal.review.rating ?? 0)}{'☆'.repeat(5 - (responseModal.review.rating ?? 0))}
              </div>
              <p className="text-sm text-gray-700">
                {responseModal.review.comment ?? responseModal.review.text}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Response <span className="text-red-500">*</span>
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="Thank the guest and address their feedback…"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
