import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import Badge, { propertyStatusVariant } from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { formatCurrency, formatDate } from "@/utils/format";
import type {
  PropertySummaryResponse,
  ListingModerationPayload,
} from "@/types";

type Action = "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "SUSPEND";

function ActionModal({
  listing,
  action,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: {
  listing: PropertySummaryResponse | null;
  action: Action;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  const needsReason = action !== "APPROVE";
  const titles: Record<Action, string> = {
    APPROVE: "Approve Listing",
    REJECT: "Reject Listing",
    REQUEST_CHANGES: "Request Changes",
    SUSPEND: "Suspend Listing",
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[action]} size="sm">
      <p className="text-sm text-gray-600 mb-3">
        {action === "APPROVE"
          ? "Approve"
          : action === "REJECT"
            ? "Reject"
            : action === "SUSPEND"
              ? "Suspend"
              : "Request changes for"}{" "}
        <strong>{listing?.title}</strong>?
      </p>
      {needsReason && (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            action === "REQUEST_CHANGES"
              ? "What changes are needed?"
              : "Reason (required)"
          }
          rows={3}
          className="input-base resize-none mb-3"
        />
      )}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary text-sm">
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm(reason);
            setReason("");
          }}
          disabled={isPending || (needsReason && !reason.trim())}
          className={`text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition-colors ${
            action === "APPROVE"
              ? "btn-success"
              : action === "REJECT" || action === "SUSPEND"
                ? "btn-danger"
                : "btn-primary"
          }`}
        >
          {isPending ? "Processing…" : titles[action]}
        </button>
      </div>
    </Modal>
  );
}

export default function ListingsModerationPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState<PropertySummaryResponse | null>(null);
  const [action, setAction] = useState<Action>("APPROVE");
  const [successMsg, setSuccessMsg] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["pending-listings", page],
    queryFn: () => adminApi.getPendingListings(page, 20),
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ListingModerationPayload;
    }) => adminApi.moderateListing(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["pending-listings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setTarget(null);
      setSuccessMsg(
        `Listing ${vars.payload.action.toLowerCase()}d successfully`,
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const handleAction = (listing: PropertySummaryResponse, act: Action) => {
    setTarget(listing);
    setAction(act);
  };

  const handleConfirm = (reason: string) => {
    if (!target) return;
    moderateMutation.mutate({
      id: target.id,
      payload: { action, reason: reason || undefined },
    });
  };

  return (
    <div>
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : data?.content.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">✅</p>
          <p className="text-gray-500 font-medium">
            No listings pending review
          </p>
          <p className="text-gray-400 text-sm mt-1">
            All listings have been moderated
          </p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "#",
                      "Listing",
                      "Host",
                      "Location",
                      "Price/night",
                      "Submitted",
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
                  {data?.content.map((listing, i) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="table-td text-gray-400">
                        {page * 20 + i + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {listing.firstPhotoUrl ? (
                            <img
                              src={listing.firstPhotoUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                              🏠
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                              {listing.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {listing.propertyType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">{listing.hostName}</td>
                      <td className="table-td">
                        {listing.city}, {listing.country}
                      </td>
                      <td className="table-td font-medium">
                        {formatCurrency(listing.basePrice)}
                      </td>
                      <td className="table-td text-gray-500">
                        {formatDate(listing.createdAt)}
                      </td>
                      <td className="table-td">
                        <Badge variant={propertyStatusVariant(listing.status)}>
                          {listing.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleAction(listing, "APPROVE")}
                            className="text-xs bg-green-50 text-green-700 font-medium px-2 py-1 rounded-md hover:bg-green-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(listing, "REJECT")}
                            className="text-xs bg-red-50 text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-100"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              handleAction(listing, "REQUEST_CHANGES")
                            }
                            className="text-xs bg-yellow-50 text-yellow-700 font-medium px-2 py-1 rounded-md hover:bg-yellow-100"
                          >
                            Changes
                          </button>
                          <button
                            onClick={() => handleAction(listing, "SUSPEND")}
                            className="text-xs bg-gray-50 text-gray-700 font-medium px-2 py-1 rounded-md hover:bg-gray-200"
                          >
                            Suspend
                          </button>
                        </div>
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

      <ActionModal
        listing={target}
        action={action}
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={handleConfirm}
        isPending={moderateMutation.isPending}
      />
    </div>
  );
}
