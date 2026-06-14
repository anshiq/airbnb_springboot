import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { propertiesApi } from "../api/properties";
import { reviewsApi } from "../api/reviews";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import Pagination from "../components/Pagination";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [booking, setBooking] = useState({
    checkIn: today,
    checkOut: tomorrow,
    guests: 1,
  });

  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState({ page: 0, totalPages: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    propertiesApi
      .getById(id)
      .then((data) => setProperty(data))
      .catch((err) => setError(err.message || "Failed to load property."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    reviewsApi
      .getByProperty(id, 0, 5)
      .then((data) => {
        setReviews(data?.content || []);
        setReviewPage({
          page: data?.page ?? 0,
          totalPages: data?.totalPages ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [id]);

  async function loadMoreReviews(page) {
    setReviewsLoading(true);
    try {
      const data = await reviewsApi.getByProperty(id, page, 5);
      setReviews(data?.content || []);
      setReviewPage({
        page: data?.page ?? 0,
        totalPages: data?.totalPages ?? 0,
      });
    } catch {}
    setReviewsLoading(false);
  }

  function handleBookingChange(e) {
    const { name, value } = e.target;
    setBooking((b) => ({ ...b, [name]: value }));
  }

  function handleReserve() {
    if (!user) {
      navigate("/login", {
        state: { from: { pathname: `/properties/${id}` } },
      });
      return;
    }
    const params = new URLSearchParams({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
    });
    navigate(`/booking/${id}/confirm?${params.toString()}`);
  }

  function calcNights() {
    if (!booking.checkIn || !booking.checkOut) return 0;
    const diff = new Date(booking.checkOut) - new Date(booking.checkIn);
    return Math.max(0, Math.floor(diff / 86400000));
  }

  const nights = calcNights();
  const estimatedTotal = nights * (property?.basePrice || 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="bg-gray-200 rounded-2xl h-72 mb-6" />
        <div className="space-y-3">
          <div className="bg-gray-200 h-7 rounded w-2/3" />
          <div className="bg-gray-200 h-4 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-24">
        <p className="text-red-500">{error || "Property not found."}</p>
        <Link
          to="/search"
          className="btn-primary inline-block mt-4 py-2 px-6 text-sm"
        >
          Browse properties
        </Link>
      </div>
    );
  }

  const images =
    property.images && property.images.length > 0
      ? property.images
      : [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
        ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden mb-8 h-72 md:h-96">
        <div className="md:col-span-2 relative">
          <img
            src={images[activeImage]}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop";
            }}
          />
        </div>
        {images.length > 1 && (
          <div className="hidden md:grid grid-rows-2 gap-2">
            {images.slice(1, 3).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i + 1)}
                className={`relative overflow-hidden ${activeImage === i + 1 ? "ring-2 ring-rose-500" : ""}`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop";
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip (mobile) */}
      {images.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto md:hidden">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden ${activeImage === i ? "ring-2 ring-rose-500" : ""}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & meta */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {property.title}
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {property.city}
                  {property.state ? `, ${property.state}` : ""}
                  {property.country ? `, ${property.country}` : ""}
                </p>
              </div>
              {property.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={property.averageRating} size="md" />
                  <span className="font-semibold text-gray-900">
                    {Number(property.averageRating).toFixed(1)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({property.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-600">
              {property.maxGuests && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {property.maxGuests} guests
                </span>
              )}
              {property.bedrooms && (
                <span className="flex items-center gap-1">
                  🛏 {property.bedrooms} bedroom
                  {property.bedrooms !== 1 ? "s" : ""}
                </span>
              )}
              {property.bathrooms && (
                <span className="flex items-center gap-1">
                  🚿 {property.bathrooms} bathroom
                  {property.bathrooms !== 1 ? "s" : ""}
                </span>
              )}
              {property.propertyType && (
                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-xs font-medium">
                  {property.propertyType}
                </span>
              )}
            </div>
          </div>

          {/* Host info */}
          {property.host && (
            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
              <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {property.host.firstName?.[0]?.toUpperCase() || "H"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Hosted by {property.host.firstName} {property.host.lastName}
                </p>
                {property.host.bio && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                    {property.host.bio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                About this place
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity.id || amenity.name}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span className="text-lg">{amenity.icon || "✓"}</span>
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
              {property.averageRating > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={property.averageRating} size="sm" />
                  <span className="text-sm font-medium text-gray-700">
                    {Number(property.averageRating).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    · {property.reviewCount || 0} reviews
                  </span>
                </div>
              )}
            </div>
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="bg-gray-200 h-3 w-24 rounded" />
                        <div className="bg-gray-200 h-3 w-16 rounded" />
                      </div>
                    </div>
                    <div className="bg-gray-200 h-3 rounded w-full" />
                    <div className="bg-gray-200 h-3 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm shrink-0">
                          {review.guest?.firstName?.[0]?.toUpperCase() || "G"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {review.guest?.firstName} {review.guest?.lastName}
                          </p>
                          <div className="flex items-center gap-2">
                            <StarRating
                              rating={review.overallRating}
                              size="sm"
                            />
                            <span className="text-xs text-gray-400">
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString(
                                    "en-IN",
                                    { month: "long", year: "numeric" },
                                  )
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 ml-13 leading-relaxed">
                        {review.comment}
                      </p>
                      {review.hostResponse && (
                        <div className="ml-13 mt-3 bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            Response from host
                          </p>
                          <p className="text-xs text-gray-600">
                            {review.hostResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Pagination
                  page={reviewPage.page}
                  totalPages={reviewPage.totalPages}
                  onPageChange={loadMoreReviews}
                />
              </>
            )}
          </div>
        </div>

        {/* Right: Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 card p-6">
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-2xl font-bold text-gray-900">
                ₹{Number(property.basePrice).toLocaleString("en-IN")}
              </span>
              <span className="text-gray-500 text-sm">/ night</span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
              <div className="grid grid-cols-2 divide-x divide-gray-200">
                <div className="p-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={booking.checkIn}
                    min={today}
                    onChange={handleBookingChange}
                    className="w-full text-sm text-gray-900 border-0 outline-none bg-transparent"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={booking.checkOut}
                    min={booking.checkIn || today}
                    onChange={handleBookingChange}
                    className="w-full text-sm text-gray-900 border-0 outline-none bg-transparent"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 p-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Guests
                </label>
                <input
                  type="number"
                  name="guests"
                  value={booking.guests}
                  min={1}
                  max={property.maxGuests || 20}
                  onChange={handleBookingChange}
                  className="w-full text-sm text-gray-900 border-0 outline-none bg-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleReserve}
              disabled={nights === 0}
              className="btn-primary w-full py-3 text-base mb-4"
            >
              {user ? "Reserve" : "Log in to reserve"}
            </button>

            {nights > 0 && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>
                    ₹{Number(property.basePrice).toLocaleString("en-IN")} ×{" "}
                    {nights} night{nights !== 1 ? "s" : ""}
                  </span>
                  <span>₹{estimatedTotal.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  You won't be charged yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
