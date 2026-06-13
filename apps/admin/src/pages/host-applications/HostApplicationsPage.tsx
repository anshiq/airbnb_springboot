import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import Badge, { applicationStatusVariant } from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { formatDate } from "@/utils/format";
import type { HostApplicationResponse } from "@/types";

export default function HostApplicationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState<HostApplicationResponse | null>(null);
  const [approving, setApproving] = useState(false);
  const [notes, setNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["pending-applications", page],
    queryFn: () => adminApi.getPendingApplications(page, 20),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      approved,
      notes: n,
    }: {
      id: number;
      approved: boolean;
      notes?: string;
    }) => adminApi.reviewApplication(id, { approved, notes: n }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["pending-applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setTarget(null);
      setNotes("");
      setSuccessMsg(
        `Application ${vars.approved ? "approved" : "rejected"} successfully`,
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const handleOpen = (app: HostApplicationResponse, approve: boolean) => {
    setTarget(app);
    setApproving(approve);
    setNotes("");
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
            No pending host applications
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.content.map((app) => (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {app.userName}
                      </h3>
                      <Badge variant={applicationStatusVariant(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {app.userEmail} · Applied {formatDate(app.createdAt)}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Motivation: </span>
                      {app.motivation}
                    </p>
                    {app.experience && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Experience: </span>
                        {app.experience}
                      </p>
                    )}
                    {app.propertyCount != null && (
                      <p className="text-sm text-gray-600">
                        Properties planned: {app.propertyCount}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpen(app, true)}
                      className="bg-green-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleOpen(app, false)}
                      className="bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
        title={
          approving ? "Approve Host Application" : "Reject Host Application"
        }
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-3">
          {approving ? "Approve" : "Reject"} application from{" "}
          <strong>{target?.userName}</strong>?
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            approving
              ? "Optional welcome notes…"
              : "Reason for rejection (required)"
          }
          rows={3}
          className="input-base resize-none mb-3"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setTarget(null)}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              target &&
              reviewMutation.mutate({
                id: target.id,
                approved: approving,
                notes: notes || undefined,
              })
            }
            disabled={reviewMutation.isPending || (!approving && !notes.trim())}
            className={`text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition-colors ${approving ? "btn-success" : "btn-danger"}`}
          >
            {reviewMutation.isPending
              ? "Processing…"
              : approving
                ? "Approve"
                : "Reject"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
