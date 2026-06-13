import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/api/bookings";
import Badge, { bookingStatusVariant } from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { formatDate, formatCurrency } from "@/utils/format";
import type { BookingResponse, BookingStatus } from "@/types";

const STATUS_OPTIONS: (BookingStatus | "")[] = [
  "",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState<BookingResponse | null>(null);
  const [reason, setReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", status, page],
    queryFn: () => bookingsApi.getAll(status || undefined, page, 20),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, r }: { id: number; r: string }) =>
      bookingsApi.cancel(id, r),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setTarget(null);
      setReason("");
    },
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm text-gray-600 font-medium">Status:</label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as BookingStatus | "");
            setPage(0);
          }}
          className="input-base w-auto"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s || "All"}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : data?.content.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "ID",
                      "Guest",
                      "Property",
                      "Check-in",
                      "Check-out",
                      "Nights",
                      "Total",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="table-th">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.content.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="table-td text-gray-400 font-mono text-xs">
                        #{b.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {b.guest.firstName} {b.guest.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{b.guest.email}</p>
                      </td>
                      <td className="table-td max-w-[150px] truncate">
                        {b.property.title}
                      </td>
                      <td className="table-td whitespace-nowrap">
                        {formatDate(b.checkInDate)}
                      </td>
                      <td className="table-td whitespace-nowrap">
                        {formatDate(b.checkOutDate)}
                      </td>
                      <td className="table-td text-center">{b.nights}</td>
                      <td className="table-td font-medium">
                        {formatCurrency(b.totalPrice)}
                      </td>
                      <td className="table-td">
                        <Badge variant={bookingStatusVariant(b.status)}>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="table-td">
                        {(b.status === "PENDING" ||
                          b.status === "CONFIRMED") && (
                          <button
                            onClick={() => {
                              setTarget(b);
                              setReason("");
                            }}
                            className="text-xs bg-red-50 text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {data && (
            <Pagination
              currentPage={data.number}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              pageSize={20}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Modal
        isOpen={!!target}
        onClose={() => setTarget(null)}
        title="Cancel Booking"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-3">
          Cancel booking <strong>#{target?.id}</strong> for{" "}
          {target?.guest.firstName} {target?.guest.lastName}?
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation"
          rows={3}
          className="input-base resize-none mb-3"
        />
        {cancelMutation.error && (
          <p className="text-xs text-red-600 mb-2">
            {(cancelMutation.error as Error).message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setTarget(null)}
            className="btn-secondary text-sm"
          >
            Keep
          </button>
          <button
            onClick={() =>
              target && cancelMutation.mutate({ id: target.id, r: reason })
            }
            disabled={cancelMutation.isPending}
            className="btn-danger text-sm"
          >
            {cancelMutation.isPending ? "Cancelling…" : "Cancel Booking"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
