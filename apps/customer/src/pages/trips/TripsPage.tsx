import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/api/bookings";
import Spinner from "@/components/common/Spinner";
import Badge, { bookingStatusVariant } from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { formatDate, formatCurrency } from "@/utils/format";
import type { BookingResponse, BookingStatus } from "@/types";

const TABS: { label: string; status: BookingStatus | undefined }[] = [
  { label: "All", status: undefined },
  { label: "Upcoming", status: "CONFIRMED" },
  { label: "Pending", status: "PENDING" },
  { label: "Completed", status: "COMPLETED" },
  { label: "Cancelled", status: "CANCELLED" },
];

function TripCard({
  booking,
  onCancel,
}: {
  booking: BookingResponse;
  onCancel: (b: BookingResponse) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row">
      <div className="w-full sm:w-36 h-32 sm:h-auto flex-shrink-0 bg-gray-100">
        {booking.property.primaryPhotoUrl ? (
          <img
            src={booking.property.primaryPhotoUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-3xl">
            🏠
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-gray-900 truncate">
              {booking.property.title}
            </p>
            <Badge variant={bookingStatusVariant(booking.status)}>
              {booking.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {booking.property.city}, {booking.property.country}
          </p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              {formatDate(booking.checkInDate)} →{" "}
              {formatDate(booking.checkOutDate)}
            </span>
            <span>
              · {booking.nights} night{booking.nights !== 1 ? "s" : ""}
            </span>
            <span>
              · {booking.guestsCount} guest
              {booking.guestsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-gray-900">
            {formatCurrency(booking.totalPrice)}
          </span>
          <div className="flex gap-2">
            {(booking.status === "PENDING" ||
              booking.status === "CONFIRMED") && (
              <button
                onClick={() => onCancel(booking)}
                className="text-sm border border-gray-300 px-3 py-1.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            {booking.status === "COMPLETED" && (
              <Link
                to="/booking/$id"
                params={{ id: String(booking.id) }}
                className="text-sm text-brand-500 font-medium hover:text-brand-600"
              >
                Leave Review
              </Link>
            )}
            <Link
              to="/booking/$id"
              params={{ id: String(booking.id) }}
              className="text-sm text-brand-500 font-medium hover:text-brand-600"
            >
              Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<BookingStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<BookingResponse | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["my-trips", page],
    queryFn: () => bookingsApi.getMyTrips(page, 10),
  });

  const cancelMutation = useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: number;
      reason: string;
    }) => bookingsApi.cancel(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });
      setCancelTarget(null);
      setCancelReason("");
    },
  });

  const filtered = tab
    ? data?.content.filter((b) => b.status === tab)
    : data?.content;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Trips</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(({ label, status }) => (
          <button
            key={label}
            onClick={() => {
              setTab(status);
              setPage(0);
            }}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === status
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-brand-500" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✈️</p>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No trips yet
          </h3>
          <p className="text-gray-500 mb-5">
            Time to start exploring amazing stays!
          </p>
          <Link to="/search" className="btn-primary">
            Explore stays
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered?.map((b) => (
            <TripCard key={b.id} booking={b} onCancel={setCancelTarget} />
          ))}
          {data && (
            <Pagination
              currentPage={data.number}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* Cancel modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to cancel your stay at{" "}
          <strong>{cancelTarget?.property.title}</strong>?
        </p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
          rows={3}
          className="input-base resize-none mb-4"
        />
        {cancelMutation.error && (
          <p className="text-xs text-red-600 mb-3">
            {(cancelMutation.error as Error).message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={() => setCancelTarget(null)} className="btn-outline">
            Keep booking
          </button>
          <button
            onClick={() =>
              cancelTarget &&
              cancelMutation.mutate({
                bookingId: cancelTarget.id,
                reason: cancelReason,
              })
            }
            disabled={cancelMutation.isPending}
            className="bg-red-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {cancelMutation.isPending ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
