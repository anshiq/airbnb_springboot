import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { bookingsApi } from "@/api/bookings";
import { paymentsApi } from "@/api/payments";
import PriceBreakdown from "@/components/booking/PriceBreakdown";
import Spinner from "@/components/common/Spinner";
import Badge, { bookingStatusVariant } from "@/components/common/Badge";
import { formatDate, formatCurrency } from "@/utils/format";

declare const Razorpay: new (options: Record<string, unknown>) => {
  open(): void;
};

export default function BookingPage() {
  const { id } = useParams({ from: "/booking/$id" });
  const navigate = useNavigate();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.getById(Number(id)),
  });

  const orderMutation = useMutation({
    mutationFn: () => paymentsApi.createOrder({ bookingId: Number(id) }),
    onSuccess: (order) => {
      if (typeof Razorpay !== "undefined") {
        const rzp = new Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID ?? "rzp_test_placeholder",
          order_id: order.razorpayOrderId,
          amount: order.amount * 100,
          currency: order.currency ?? "INR",
          name: "StayEase",
          description: `Booking #${id}`,
          handler: (resp: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            verifyMutation.mutate({
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
              bookingId: Number(id),
            });
          },
        });
        rzp.open();
      } else {
        // Razorpay SDK not loaded — show order ID for manual flow
        alert(
          `Razorpay order created: ${order.razorpayOrderId}. In production, the payment popup would appear here.`,
        );
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: paymentsApi.verify,
    onSuccess: () => navigate({ to: "/booking/$id/success", params: { id } }),
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

  const breakdown = {
    nights: booking.nights,
    basePricePerNight: booking.basePricePerNight,
    subtotal: booking.subtotal,
    cleaningFee: booking.cleaningFee ?? 0,
    serviceFee: booking.serviceFee ?? 0,
    taxes: booking.taxes ?? 0,
    totalPrice: booking.totalPrice,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/trips" className="hover:text-gray-700">
          My Trips
        </Link>
        <span>/</span>
        <span className="text-gray-900">Checkout</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirm and pay</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Property summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Your stay</h2>
          {booking.property.primaryPhotoUrl && (
            <img
              src={booking.property.primaryPhotoUrl}
              alt=""
              className="w-full aspect-video object-cover rounded-xl mb-4"
            />
          )}
          <p className="font-medium text-gray-900">{booking.property.title}</p>
          <p className="text-sm text-gray-500 mb-4">
            {booking.property.city}, {booking.property.country}
          </p>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Check-in</span>
              <span className="font-medium">
                {formatDate(booking.checkInDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-out</span>
              <span className="font-medium">
                {formatDate(booking.checkOutDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guests</span>
              <span className="font-medium">{booking.guestsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Booking type</span>
              <span className="font-medium">
                {booking.bookingType === "INSTANT"
                  ? "⚡ Instant"
                  : "📋 Request"}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <Badge variant={bookingStatusVariant(booking.status)}>
              {booking.status}
            </Badge>
          </div>
          {booking.specialRequests && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Special requests
              </p>
              <p className="text-sm text-gray-600">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Price + payment */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Price details</h2>
            <PriceBreakdown breakdown={breakdown} />
          </div>

          {booking.payment?.status === "CAPTURED" ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-green-700 font-medium">✓ Payment completed</p>
              <Link
                to="/booking/$id/success"
                params={{ id: String(booking.id) }}
                className="block mt-2 text-green-600 text-sm underline"
              >
                View confirmation
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Payment</h2>
              <p className="text-sm text-gray-600">
                Total: <strong>{formatCurrency(booking.totalPrice)}</strong>
              </p>
              {(orderMutation.error || verifyMutation.error) && (
                <p className="text-xs text-red-600">
                  {
                    ((orderMutation.error || verifyMutation.error) as Error)
                      .message
                  }
                </p>
              )}
              <button
                onClick={() => orderMutation.mutate()}
                disabled={orderMutation.isPending || verifyMutation.isPending}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(orderMutation.isPending || verifyMutation.isPending) && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Pay with Razorpay
              </button>
              <p className="text-xs text-gray-400 text-center">
                Secured by Razorpay · 256-bit SSL
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
