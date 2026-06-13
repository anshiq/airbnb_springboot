import { useState } from "react";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertiesApi } from "@/api/properties";
import { bookingsApi } from "@/api/bookings";
import { reviewsApi } from "@/api/reviews";
import { useAuth } from "@/store/authStore";
import Spinner from "@/components/common/Spinner";
import StarRating from "@/components/common/StarRating";
import ReviewCard from "@/components/reviews/ReviewCard";
import PriceBreakdown from "@/components/booking/PriceBreakdown";
import {
  formatCurrency,
  formatDate,
  formatRating,
  getInitials,
  propertyTypeLabel,
} from "@/utils/format";
import type { AmenityResponse } from "@/types";

const AMENITY_ICONS: Record<string, string> = {
  WiFi: "📶",
  Pool: "🏊",
  Parking: "🅿️",
  Kitchen: "🍳",
  "Air conditioning": "❄️",
  Gym: "💪",
  Washer: "🫧",
  TV: "📺",
  Balcony: "🌅",
  Garden: "🌿",
};

function AmenityChip({ amenity }: { amenity: AmenityResponse }) {
  const icon = AMENITY_ICONS[amenity.name] ?? "✓";
  return (
    <div className="flex items-center gap-2 py-2">
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-gray-700">{amenity.name}</span>
    </div>
  );
}

function BookingWidget({
  property,
}: {
  property: {
    id: number;
    basePrice: number;
    bookingType: string;
    maxGuests: number;
    cancellationPolicy: string;
  };
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const today = new Date().toISOString().split("T")[0];

  const { data: breakdown, isLoading: bpLoading } = useQuery({
    queryKey: ["price-check", property.id, checkIn, checkOut, guests],
    queryFn: () =>
      bookingsApi.priceCheck(property.id, checkIn, checkOut, guests),
    enabled: !!(checkIn && checkOut && checkIn < checkOut),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        propertyId: property.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestsCount: guests,
      }),
    onSuccess: (booking) =>
      navigate({ to: "/booking/$id", params: { id: String(booking.id) } }),
  });

  const handleReserve = () => {
    if (!isAuthenticated) {
      navigate({ to: "/auth/login" });
      return;
    }
    if (!checkIn || !checkOut) return;
    createMutation.mutate();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg sticky top-20">
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(property.basePrice)}
        </span>
        <span className="text-gray-500 text-sm">/ night</span>
      </div>
      {property.bookingType === "INSTANT" ? (
        <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full mb-4 w-fit">
          <span>⚡</span> Instant Book
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-4 w-fit">
          <span>📋</span> Request to Book
        </div>
      )}

      <div className="border border-gray-300 rounded-xl overflow-hidden mb-3">
        <div className="grid grid-cols-2 divide-x divide-gray-300">
          <div className="p-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) setCheckOut("");
              }}
              className="w-full text-sm text-gray-900 outline-none bg-transparent"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm text-gray-900 outline-none bg-transparent"
            />
          </div>
        </div>
        <div className="border-t border-gray-300 p-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
            Guests
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 text-gray-700"
            >
              −
            </button>
            <span className="text-sm font-medium">{guests}</span>
            <button
              onClick={() =>
                setGuests((g) => Math.min(property.maxGuests, g + 1))
              }
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 text-gray-700"
            >
              +
            </button>
            <span className="text-xs text-gray-500 ml-1">
              Max {property.maxGuests}
            </span>
          </div>
        </div>
      </div>

      {bpLoading && (
        <div className="text-center py-2">
          <Spinner size="sm" className="text-brand-500" />
        </div>
      )}
      {breakdown && (
        <div className="mb-3 pt-2">
          <PriceBreakdown breakdown={breakdown} />
        </div>
      )}

      {createMutation.error && (
        <p className="text-xs text-red-600 mb-2">
          {(createMutation.error as Error).message}
        </p>
      )}

      <button
        onClick={handleReserve}
        disabled={createMutation.isPending || !checkIn || !checkOut}
        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {createMutation.isPending && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {isAuthenticated ? "Reserve" : "Log in to Reserve"}
      </button>
      <p className="text-center text-xs text-gray-500 mt-2">
        You won't be charged yet
      </p>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          <span className="font-medium">Cancellation: </span>
          {property.cancellationPolicy === "FLEXIBLE"
            ? "Free cancellation before check-in"
            : property.cancellationPolicy === "MODERATE"
              ? "Partial refund if cancelled 5 days before"
              : "Non-refundable"}
        </p>
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams({ from: "/properties/$id" });
  const [reviewPage, setReviewPage] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertiesApi.getById(Number(id)),
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id, reviewPage],
    queryFn: () => reviewsApi.getForProperty(Number(id), reviewPage, 5),
    enabled: !!property,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    );
  }
  if (!property) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500">Property not found.</p>
      </div>
    );
  }

  const visibleAmenities = showAllAmenities
    ? property.amenities
    : property.amenities.slice(0, 10);
  const primaryPhoto =
    property.photos.find((p) => p.primary) ?? property.photos[0];
  const otherPhotos = property.photos.filter((p) => !p.primary).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-gray-700">
          Home
        </Link>
        <span>/</span>
        <Link to="/search" className="hover:text-gray-700">
          Search
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">
          {property.title}
        </span>
      </div>

      {/* Title + meta */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {property.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
          {property.averageRating != null && (
            <span className="flex items-center gap-1 font-medium text-gray-900">
              ★ {formatRating(property.averageRating)}
              <span className="text-gray-500 font-normal">
                ({property.reviewCount} reviews)
              </span>
            </span>
          )}
          <span>
            {property.location.city}, {property.location.state},{" "}
            {property.location.country}
          </span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
            {propertyTypeLabel(property.propertyType)}
          </span>
        </div>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-8 aspect-[16/7]">
        <div className="col-span-2 row-span-2">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-500 text-5xl">
              🏠
            </div>
          )}
        </div>
        {otherPhotos.map((p, i) => (
          <div key={i} className="col-span-1">
            <img src={p.url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Host info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Hosted by {property.host.firstName} {property.host.lastName}
              </h2>
              <p className="text-sm text-gray-500">
                {property.maxGuests} guests · {property.bedrooms} bedrooms ·{" "}
                {property.beds} beds · {property.bathrooms} bathrooms
              </p>
            </div>
            {property.host.profilePhotoUrl ? (
              <img
                src={property.host.profilePhotoUrl}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-lg">
                {getInitials(property.host.firstName, property.host.lastName)}
              </div>
            )}
          </div>
          <hr className="border-gray-100" />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              About this place
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>
          <hr className="border-gray-100" />

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What this place offers
            </h3>
            <div className="grid grid-cols-2 gap-x-8">
              {visibleAmenities.map((a) => (
                <AmenityChip key={a.id} amenity={a} />
              ))}
            </div>
            {property.amenities.length > 10 && (
              <button
                onClick={() => setShowAllAmenities((v) => !v)}
                className="mt-3 border border-gray-300 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {showAllAmenities
                  ? "Show fewer"
                  : `Show all ${property.amenities.length} amenities`}
              </button>
            )}
          </div>
          <hr className="border-gray-100" />

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Location
            </h3>
            <p className="text-gray-600 text-sm">
              {property.location.addressLine1}, {property.location.city},{" "}
              {property.location.state} {property.location.zipCode},{" "}
              {property.location.country}
            </p>
            <div className="mt-3 bg-gray-100 rounded-xl h-40 flex items-center justify-center text-gray-400 text-sm">
              📍 Map view coming soon
            </div>
          </div>

          {/* Reviews */}
          {reviews && reviews.totalElements > 0 && (
            <>
              <hr className="border-gray-100" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ★{" "}
                    {property.averageRating
                      ? formatRating(property.averageRating)
                      : ""}{" "}
                    · {reviews.totalElements} review
                    {reviews.totalElements !== 1 ? "s" : ""}
                  </h3>
                </div>
                <div>
                  {reviews.content.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
                {reviews.totalPages > 1 && (
                  <div className="flex gap-2 mt-4">
                    <button
                      disabled={reviewPage === 0}
                      onClick={() => setReviewPage((p) => p - 1)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                    >
                      ← Prev
                    </button>
                    <button
                      disabled={reviews.last}
                      onClick={() => setReviewPage((p) => p + 1)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Booking widget */}
        <div className="lg:col-span-1">
          <BookingWidget property={property} />
        </div>
      </div>
    </div>
  );
}
