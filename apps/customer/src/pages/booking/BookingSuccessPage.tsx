import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/api/bookings";
import Spinner from "@/components/common/Spinner";
import { formatDate, formatCurrency } from "@/utils/format";

export default function BookingSuccessPage() {
  const { id } = useParams({ from: "/booking/$id/success" });

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.getById(Number(id)),
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    );
  if (!booking)
    return (
      <div className="text-center py-32 text-gray-500">Booking not found</div>
    );

  const isRequest = booking.bookingType === "REQUEST";

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {isRequest ? "Request Sent!" : "Booking Confirmed!"}
      </h1>
      <p className="text-gray-600 mb-8">
        {isRequest
          ? "Your booking request has been sent to the host. You'll receive a confirmation once they approve."
          : "Your stay is confirmed. We've sent a confirmation email with all the details."}
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left mb-8">
        <h2 className="font-semibold text-gray-900 mb-4 text-center">
          Booking Summary
        </h2>
        {booking.property.primaryPhotoUrl && (
          <img
            src={booking.property.primaryPhotoUrl}
            alt=""
            className="w-full aspect-video object-cover rounded-xl mb-4"
          />
        )}
        <p className="font-semibold text-gray-900">{booking.property.title}</p>
        <p className="text-sm text-gray-500 mb-4">
          {booking.property.city}, {booking.property.country}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Booking ID</span>
            <span className="font-mono text-gray-700">#{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Check-in</span>
            <span className="font-medium text-gray-900">
              {formatDate(booking.checkInDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Check-out</span>
            <span className="font-medium text-gray-900">
              {formatDate(booking.checkOutDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Guests</span>
            <span className="font-medium text-gray-900">
              {booking.guestsCount}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
            <span className="font-semibold text-gray-900">Total paid</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(booking.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link to="/trips" className="btn-primary">
          View My Trips
        </Link>
        <Link to="/" className="btn-outline">
          Explore More
        </Link>
      </div>
    </div>
  );
}
