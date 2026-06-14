import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewsApi } from '../api/reviews';
import StarRating from '../components/StarRating';
import Pagination from '../components/Pagination';

const RATING_LABELS = [
  { key: 'cleanlinessRating', label: 'Cleanliness' },
  { key: 'accuracyRating', label: 'Accuracy' },
  { key: 'checkinRating', label: 'Check-in' },
  { key: 'communicationRating', label: 'Communication' },
  { key: 'locationRating', label: 'Location' },
  { key: 'valueRating', label: 'Value' },
];

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  async function fetchReviews(page = 0) {
    setLoading(true);
    setError('');
    try {
      const data = await reviewsApi.getMyReviews(page, 8);
      setReviews(data?.content || []);
      setPagination({ page: data?.page ?? 0, totalPages: data?.totalPages ?? 0 });
    } catch (err) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews(0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Reviews</h1>
      <p className="text-gray-500 text-sm mb-6">Reviews you've written for stays</p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse card p-5 space-y-3">
              <div className="flex gap-4">
                <div className="bg-gray-200 w-20 h-16 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-2/3" />
                  <div className="bg-gray-200 h-3 rounded w-1/3" />
                  <div className="bg-gray-200 h-3 rounded w-1/4" />
                </div>
              </div>
              <div className="bg-gray-200 h-3 rounded w-full" />
              <div className="bg-gray-200 h-3 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => fetchReviews(0)} className="mt-4 btn-primary py-2 px-6 text-sm">
            Retry
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⭐</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            After your stay is completed, you can leave a review from My Trips.
          </p>
          <Link to="/my-trips" className="btn-primary py-2 px-6 text-sm">
            My trips
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => {
              const property = review.property || review.booking?.property || {};
              const imageUrl =
                property.images?.[0] ||
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=150&fit=crop';
              const isExpanded = expandedId === review.id;

              return (
                <div key={review.id} className="card p-5">
                  <div className="flex gap-4 mb-3">
                    <img
                      src={imageUrl}
                      alt={property.title}
                      className="w-20 h-16 object-cover rounded-xl shrink-0"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=150&fit=crop';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <Link
                            to={`/properties/${property.id}`}
                            className="font-semibold text-gray-900 text-sm hover:text-rose-500 transition-colors line-clamp-1"
                          >
                            {property.title || 'Property'}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {property.city}{property.country ? `, ${property.country}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <StarRating rating={review.overallRating} size="sm" />
                          <span className="text-sm font-semibold text-gray-900">
                            {review.overallRating}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : ''}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Sub-ratings */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : review.id)}
                    className="mt-3 text-xs text-rose-500 hover:text-rose-600 font-medium"
                  >
                    {isExpanded ? 'Hide ratings ↑' : 'Show detailed ratings ↓'}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {RATING_LABELS.map(({ key, label }) => (
                        review[key] > 0 && (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-24">{label}</span>
                            <StarRating rating={review[key]} size="sm" />
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {/* Host response */}
                  {review.hostResponse && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Host's response</p>
                      <p className="text-xs text-gray-600">{review.hostResponse}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchReviews}
          />
        </>
      )}
    </div>
  );
}
