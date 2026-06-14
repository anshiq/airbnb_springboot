import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';
import Pagination from '../components/Pagination';

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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function MyTrips() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchBookings(page = 0) {
    setLoading(true);
    setError('');
    try {
      const data = await bookingsApi.getMyTrips(page, 8);
      setBookings(data?.content || []);
      setPagination({ page: data?.page ?? 0, totalPages: data?.totalPages ?? 0 });
    } catch (err) {
      setError(err.message || 'Failed to load trips.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings(0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Trips</h1>
      <p className="text-gray-500 text-sm mb-6">Your upcoming and past bookings</p>

      {location.state?.paymentSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-green-800 font-medium">Booking confirmed and payment successful!</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse card p-4 flex gap-4">
              <div className="bg-gray-200 w-28 h-24 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="bg-gray-200 h-4 rounded w-3/4" />
                <div className="bg-gray-200 h-3 rounded w-1/2" />
                <div className="bg-gray-200 h-3 rounded w-1/3" />
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
          <div className="text-5xl mb-4">🧳</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Start exploring and book your first stay!
          </p>
          <Link to="/search" className="btn-primary py-2 px-6 text-sm">
            Explore properties
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => {
              const imageUrl =
                booking.property?.images?.[0] ||
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop';

              const checkIn = booking.checkInDate
                ? new Date(booking.checkInDate + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—';
              const checkOut = booking.checkOutDate
                ? new Date(booking.checkOutDate + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—';

              return (
                <Link
                  key={booking.id}
                  to={`/my-trips/${booking.id}`}
                  className="block card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <img
                      src={imageUrl}
                      alt={booking.property?.title}
                      className="w-28 h-24 object-cover rounded-xl shrink-0"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h2 className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {booking.property?.title || 'Property'}
                        </h2>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.property?.city}{booking.property?.country ? `, ${booking.property.country}` : ''}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                        <span>📅 {checkIn} → {checkOut}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>👥 {booking.guestsCount} guest{booking.guestsCount !== 1 ? 's' : ''}</span>
                        {booking.totalAmount && (
                          <span>₹{Number(booking.totalAmount).toLocaleString('en-IN')} total</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchBookings}
          />
        </>
      )}
    </div>
  );
}
