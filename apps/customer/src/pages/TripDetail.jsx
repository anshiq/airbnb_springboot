import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';
import { messagesApi } from '../api/messages';
import { reviewsApi } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';

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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

const REVIEW_FIELDS = [
  { key: 'overallRating', label: 'Overall' },
  { key: 'cleanlinessRating', label: 'Cleanliness' },
  { key: 'accuracyRating', label: 'Accuracy' },
  { key: 'checkinRating', label: 'Check-in' },
  { key: 'communicationRating', label: 'Communication' },
  { key: 'locationRating', label: 'Location' },
  { key: 'valueRating', label: 'Value' },
];

export default function TripDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('details');

  // Messages
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Cancel modal
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Review modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    overallRating: 0,
    cleanlinessRating: 0,
    accuracyRating: 0,
    checkinRating: 0,
    communicationRating: 0,
    locationRating: 0,
    valueRating: 0,
    comment: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    bookingsApi
      .getById(id)
      .then((data) => setBooking(data))
      .catch((err) => setError(err.message || 'Failed to load booking.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === 'messages' && booking) {
      loadMessages();
    }
  }, [activeTab, booking]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function loadMessages() {
    setMsgLoading(true);
    try {
      const data = await messagesApi.getByBooking(id, 0, 100);
      setMessages(data?.content ? [...data.content].reverse() : []);
      await messagesApi.markRead(id).catch(() => {});
    } catch {}
    setMsgLoading(false);
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const msg = await messagesApi.send(Number(id), newMsg.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMsg('');
    } catch {}
    setSending(false);
  }

  async function handleCancel() {
    setCancelError('');
    setCancelling(true);
    try {
      const updated = await bookingsApi.cancel(id, cancelReason);
      setBooking((b) => ({ ...b, status: updated?.status || 'CANCELLED' }));
      setCancelOpen(false);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewError('');
    if (reviewForm.overallRating === 0) {
      setReviewError('Please provide an overall rating.');
      return;
    }
    setReviewSubmitting(true);
    try {
      await reviewsApi.create({
        bookingId: Number(id),
        ...reviewForm,
      });
      setReviewDone(true);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="bg-gray-200 h-6 w-1/3 rounded" />
        <div className="bg-gray-200 h-40 rounded-xl" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-24">
        <p className="text-red-500">{error || 'Booking not found.'}</p>
        <Link to="/my-trips" className="btn-primary inline-block mt-4 py-2 px-6 text-sm">
          Back to trips
        </Link>
      </div>
    );
  }

  const property = booking.property || {};
  const imageUrl =
    property.images?.[0] ||
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop';

  const checkIn = booking.checkInDate
    ? new Date(booking.checkInDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  const checkOut = booking.checkOutDate
    ? new Date(booking.checkOutDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const canCancel = ['PENDING', 'CONFIRMED', 'PAYMENT_PENDING'].includes(booking.status);
  const canReview = booking.status === 'COMPLETED' && !reviewDone;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/my-trips" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to my trips
      </Link>

      {location.state?.paymentSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-green-800 font-medium">Booking confirmed and payment successful!</p>
        </div>
      )}

      {/* Property card */}
      <div className="card p-4 mb-6 flex gap-4">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-28 h-24 object-cover rounded-xl shrink-0"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop';
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 justify-between flex-wrap">
            <div>
              <h1 className="font-bold text-gray-900">{property.title || 'Property'}</h1>
              <p className="text-sm text-gray-500">{property.city}{property.country ? `, ${property.country}` : ''}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Booking #{booking.id}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['details', 'messages'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-rose-500 text-rose-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Booking info */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Booking details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">Check-in</dt>
                <dd className="text-gray-900 font-medium">{checkIn}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">Check-out</dt>
                <dd className="text-gray-900 font-medium">{checkOut}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">Guests</dt>
                <dd className="text-gray-900 font-medium">{booking.guestsCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">Total paid</dt>
                <dd className="text-gray-900 font-medium">
                  {booking.totalAmount ? `₹${Number(booking.totalAmount).toLocaleString('en-IN')}` : '—'}
                </dd>
              </div>
              {booking.specialRequests && (
                <div className="col-span-2">
                  <dt className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">Special requests</dt>
                  <dd className="text-gray-700">{booking.specialRequests}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Link to={`/properties/${property.id}`} className="btn-secondary py-2 px-5 text-sm">
              View property
            </Link>
            {canCancel && (
              <button
                onClick={() => setCancelOpen(true)}
                className="py-2 px-5 text-sm font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel booking
              </button>
            )}
            {canReview && (
              <button onClick={() => setReviewOpen(true)} className="btn-primary py-2 px-5 text-sm">
                Leave a review
              </button>
            )}
          </div>

          {reviewDone && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✓ Your review has been submitted. Thank you!
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="flex flex-col" style={{ height: '500px' }}>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {msgLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id || msg.sender?.id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-rose-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {msg.sender?.firstName || 'Host'}
                        </p>
                      )}
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 opacity-60 ${isMe ? 'text-right' : ''}`}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type a message…"
              className="input-field flex-1"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMsg.trim()}
              className="btn-primary py-2 px-4 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Cancel Modal */}
      <Modal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel booking">
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Tell us why you're cancelling…"
            className="input-field resize-none"
          />
        </div>
        {cancelError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {cancelError}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => setCancelOpen(false)} className="btn-secondary flex-1 py-2 text-sm">
            Keep booking
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling…' : 'Cancel booking'}
          </button>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="Leave a review">
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          {REVIEW_FIELDS.map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              <StarRating
                rating={reviewForm[field.key]}
                interactive
                size="lg"
                onRate={(val) => setReviewForm((f) => ({ ...f, [field.key]: val }))}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your review</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              rows={4}
              required
              placeholder="Share your experience…"
              className="input-field resize-none"
            />
          </div>
          {reviewError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {reviewError}
            </div>
          )}
          <button
            type="submit"
            disabled={reviewSubmitting}
            className="btn-primary w-full py-3"
          >
            {reviewSubmitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
