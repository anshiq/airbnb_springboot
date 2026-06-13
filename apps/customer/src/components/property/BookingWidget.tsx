import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PropertyResponse } from '@/types';
import { bookingsApi } from '@/api/bookings';
import { formatCurrency } from '@/utils/format';
import PriceBreakdown from '@/components/booking/PriceBreakdown';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';

interface BookingWidgetProps {
  property: PropertyResponse;
  onBook: (params: { checkInDate: string; checkOutDate: string; guestsCount: number }) => void;
}

export default function BookingWidget({ property, onBook }: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const canCheck = !!(checkIn && checkOut && checkIn < checkOut);

  const { data: priceData, isLoading: priceLoading } = useQuery({
    queryKey: ['priceCheck', property.id, checkIn, checkOut, guests],
    queryFn: () => bookingsApi.priceCheck(property.id, checkIn, checkOut, guests),
    enabled: canCheck,
    retry: false,
  });

  const today = new Date().toISOString().split('T')[0];

  const policyDescriptions: Record<string, string> = {
    FLEXIBLE: 'Free cancellation for 24 hours. Cancel before check-in for a full refund.',
    MODERATE: 'Free cancellation for 5 days. Cancel 5 days before check-in for a full refund.',
    STRICT: 'Non-refundable. Cancellations receive a 50% refund up to 7 days prior to check-in.',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-5 sticky top-24">
      {/* Price header */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{formatCurrency(property.basePrice)}</span>
        <span className="text-gray-500 text-sm">/ night</span>
        {property.averageRating && (
          <div className="ml-auto flex items-center gap-1 text-sm">
            <span className="text-brand-500">★</span>
            <span className="font-medium">{property.averageRating.toFixed(1)}</span>
            {property.reviewCount != null && (
              <span className="text-gray-400">({property.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Booking type badge */}
      <div>
        {property.bookingType === 'INSTANT' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Instant Book
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Request to Book
          </span>
        )}
      </div>

      {/* Date pickers */}
      <div className="border border-gray-300 rounded-xl overflow-hidden divide-y divide-gray-200">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-3">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1">
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) setCheckOut('');
              }}
              className="text-sm text-gray-900 bg-transparent outline-none w-full"
            />
          </div>
          <div className="p-3">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1">
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="text-sm text-gray-900 bg-transparent outline-none w-full"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="p-3">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">
            Guests
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition-colors text-lg leading-none"
              aria-label="Decrease guests"
            >
              –
            </button>
            <span className="text-sm font-medium text-gray-900 w-8 text-center">
              {guests}
            </span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(property.maxGuests, g + 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition-colors text-lg leading-none"
              aria-label="Increase guests"
            >
              +
            </button>
            <span className="text-xs text-gray-400 ml-1">max {property.maxGuests}</span>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      {priceLoading && canCheck && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" className="text-brand-500" />
        </div>
      )}
      {priceData && canCheck && (
        <PriceBreakdown breakdown={priceData} nights={priceData.nights} />
      )}

      {/* Reserve button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!canCheck}
        onClick={() => {
          if (canCheck) {
            onBook({ checkInDate: checkIn, checkOutDate: checkOut, guestsCount: guests });
          }
        }}
      >
        {property.bookingType === 'INSTANT' ? 'Reserve' : 'Request to Book'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        You won't be charged yet
      </p>

      {/* Stay limits */}
      <div className="text-xs text-gray-500 space-y-1 border-t border-gray-100 pt-4">
        <p>Minimum stay: {property.minNights} night{property.minNights !== 1 ? 's' : ''}</p>
        {property.maxNights > 0 && (
          <p>Maximum stay: {property.maxNights} night{property.maxNights !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Cancellation policy */}
      <div className="text-xs text-gray-500 border-t border-gray-100 pt-4">
        <p className="font-medium text-gray-700 mb-1">
          {property.cancellationPolicy.charAt(0) + property.cancellationPolicy.slice(1).toLowerCase()} cancellation
        </p>
        <p>{policyDescriptions[property.cancellationPolicy]}</p>
      </div>
    </div>
  );
}
