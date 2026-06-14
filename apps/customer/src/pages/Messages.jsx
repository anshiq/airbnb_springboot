import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
  CHECKED_IN: { label: 'Checked In', className: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', className: 'bg-gray-100 text-gray-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  PAYMENT_PENDING: { label: 'Payment Pending', className: 'bg-orange-100 text-orange-800' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function Messages() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  async function fetchBookings(p = 0) {
    setLoading(true);
    setError('');
    try {
      const data = await bookingsApi.getMyTrips(p, 20);
      setBookings(data?.content || []);
      setPage(data?.page ?? 0);
      setTotalPages(data?.totalPages ?? 0);
    } catch (err) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings(0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
      <p className="text-gray-500 text-sm mb-6">
        Your conversations with hosts — one thread per booking
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse card p-4 flex gap-4">
              <div className="bg-gray-200 w-16 h-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="bg-gray-200 h-4 rounded w-3/4" />
                <div className="bg-gray-200 h-3 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => fetchBookings(0)} className="mt-4 btn-primary py-2 px-6 text-sm">
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Once you make a booking, you can message the host here.
          </p>
          <Link to="/search" className="btn-primary py-2 px-6 text-sm">
            Browse properties
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => {
            const property = booking.property || {};
            const imageUrl =
              property.images?.[0] ||
              'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop';

            const checkIn = booking.checkInDate
              ? new Date(booking.checkInDate + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '';

            return (
              <Link
                key={booking.id}
                to={`/my-trips/${booking.id}`}
                state={{ defaultTab: 'messages' }}
                className="block card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={imageUrl}
                    alt={property.title}
                    className="w-14 h-14 object-cover rounded-xl shrink-0"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {property.title || 'Property'}
                      </p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {property.city}{property.country ? `, ${property.country}` : ''}
                    </p>
                    {checkIn && (
                      <p className="text-xs text-gray-400 mt-0.5">Check-in: {checkIn}</p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => fetchBookings(page - 1)}
                disabled={page === 0}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="py-2 px-3 text-sm text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => fetchBookings(page + 1)}
                disabled={page >= totalPages - 1}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
