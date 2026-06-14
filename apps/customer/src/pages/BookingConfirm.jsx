import { useState, useEffect } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { propertiesApi } from "../api/properties";
import { bookingsApi } from "../api/bookings";
import { paymentsApi } from "../api/payments";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookingConfirm() {
  const { id: propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || 1);

  const [property, setProperty] = useState(null);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  function calcNights() {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.floor(diff / 86400000));
  }

  const nights = calcNights();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [prop, price] = await Promise.all([
          propertiesApi.getById(propertyId),
          checkIn && checkOut && guests
            ? bookingsApi.priceCheck(propertyId, checkIn, checkOut, guests)
            : Promise.resolve(null),
        ]);
        setProperty(prop);
        setPriceBreakdown(price);
      } catch (err) {
        setError(err.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [propertyId, checkIn, checkOut, guests]);

  async function handleConfirm() {
    if (!checkIn || !checkOut || nights === 0) {
      setError("Invalid dates. Please go back and select valid dates.");
      return;
    }
    setPaying(true);
    setError("");
    try {
      // Step 1: Create the booking
      const booking = await bookingsApi.create({
        propertyId: Number(propertyId),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestsCount: guests,
        specialRequests: specialRequests || undefined,
      });

      // Step 2: Create Razorpay order
      const order = await paymentsApi.createOrder(booking.id);

      // Step 3: Load Razorpay and open checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Payment gateway failed to load. Please try again.");
        setPaying(false);
        return;
      }

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const rzp = new window.Razorpay({
        key: rzpKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "StayFinder",
        description: `Booking at ${property?.title}`,
        order_id: order.razorpayOrderId || order.id,
        handler: async function (response) {
          try {
            await paymentsApi.verify(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );
            navigate(`/my-trips/${booking.id}`, {
              state: { paymentSuccess: true },
            });
          } catch (verifyErr) {
            setError(
              "Payment verification failed: " +
                (verifyErr.message || "Please contact support."),
            );
            setPaying(false);
          }
        },
        prefill: {},
        theme: { color: "#f43f5e" },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="bg-gray-200 h-6 w-1/2 rounded" />
        <div className="bg-gray-200 h-40 rounded-xl" />
        <div className="bg-gray-200 h-32 rounded-xl" />
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="text-center py-24">
        <p className="text-red-500">{error}</p>
        <Link
          to={`/properties/${propertyId}`}
          className="btn-primary inline-block mt-4 py-2 px-6 text-sm"
        >
          Go back
        </Link>
      </div>
    );
  }

  const imageUrl =
    property?.images?.[0] ||
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop";

  const basePrice =
    priceBreakdown?.basePrice ?? (property?.basePrice ?? 0) * nights;
  const cleaningFee = priceBreakdown?.cleaningFee ?? 0;
  const serviceFee = priceBreakdown?.serviceFee ?? 0;
  const taxes = priceBreakdown?.taxes ?? 0;
  const totalAmount =
    priceBreakdown?.totalAmount ?? basePrice + cleaningFee + serviceFee + taxes;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to={`/properties/${propertyId}`}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to property
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Confirm your booking
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Property summary */}
      <div className="card p-4 mb-6 flex gap-4">
        <img
          src={imageUrl}
          alt={property?.title}
          className="w-24 h-20 object-cover rounded-xl shrink-0"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop";
          }}
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 text-sm line-clamp-2">
            {property?.title}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {property?.city}
            {property?.country ? `, ${property.country}` : ""}
          </p>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {property?.propertyType?.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Trip details */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Your trip</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              Dates
            </p>
            <p className="text-gray-900 font-medium">
              {checkIn &&
                new Date(checkIn + "T00:00:00").toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              {" – "}
              {checkOut &&
                new Date(checkOut + "T00:00:00").toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
            </p>
            <p className="text-xs text-gray-400">
              {nights} night{nights !== 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              Guests
            </p>
            <p className="text-gray-900 font-medium">{guests}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              Type
            </p>
            <p className="text-gray-900 font-medium capitalize">
              {property?.propertyType?.toLowerCase() || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Price breakdown</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>
              ₹{Number(property?.basePrice || 0).toLocaleString("en-IN")} ×{" "}
              {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span>₹{Number(basePrice).toLocaleString("en-IN")}</span>
          </div>
          {cleaningFee > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Cleaning fee</span>
              <span>₹{Number(cleaningFee).toLocaleString("en-IN")}</span>
            </div>
          )}
          {serviceFee > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Service fee</span>
              <span>₹{Number(serviceFee).toLocaleString("en-IN")}</span>
            </div>
          )}
          {taxes > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Taxes</span>
              <span>₹{Number(taxes).toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₹{Number(totalAmount).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Special requests */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special requests{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={3}
          placeholder="Any special requests for the host…"
          className="input-field resize-none"
        />
      </div>

      <button
        onClick={handleConfirm}
        disabled={paying || nights === 0}
        className="btn-primary w-full py-4 text-base"
      >
        {paying ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Processing…
          </span>
        ) : (
          `Confirm & Pay ₹${Number(totalAmount).toLocaleString("en-IN")}`
        )}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        By confirming, you agree to our Terms of Service and cancellation
        policy.
      </p>
    </div>
  );
}
