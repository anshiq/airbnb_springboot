import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import Badge from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { formatDate, getInitials } from "@/utils/format";
import type { UserPageResponse, UserRole, UserStatus } from "@/types";
import { useAuth } from "@/store/authStore";

const ROLES: UserRole[] = [
  "GUEST",
  "HOST",
  "PROPERTY_MANAGER",
  "SUPPORT_AGENT",
  "SUPER_ADMIN",
];
const STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED", "DELETED"];

const roleVariant = (role: UserRole) => {
  const m: Record<
    UserRole,
    "success" | "info" | "warning" | "error" | "neutral"
  > = {
    GUEST: "neutral",
    HOST: "success",
    PROPERTY_MANAGER: "info",
    SUPPORT_AGENT: "info",
    SUPER_ADMIN: "warning",
  };
  return m[role];
};

const statusVariant = (status: UserStatus) => {
  const m: Record<UserStatus, "success" | "error" | "neutral" | "warning"> = {
    ACTIVE: "success",
    INACTIVE: "neutral",
    SUSPENDED: "error",
    DELETED: "error",
  };
  return m[status];
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<UserPageResponse | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", query, page],
    queryFn: () => usersApi.getAll(query || undefined, page, 20),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: UserStatus }) =>
      usersApi.updateStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteTarget(null);
    },
  });

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(0);
  }, []);

  return (
    <div>
      {/* Search */}
      <div className="mb-5">
        <input
          type="search"
          value={query}
          onChange={handleSearch}
          placeholder="Search by name or email…"
          className="input-base max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "User",
                      "Email",
                      "Role",
                      "Status",
                      "Verified",
                      "Joined",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="table-th">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.content.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {getInitials(u.firstName, u.lastName)}
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </p>
                        </div>
                      </td>
                      <td className="table-td text-gray-500">{u.email}</td>
                      <td className="table-td">
                        {me?.role === "SUPER_ADMIN" ? (
                          <select
                            value={u.role}
                            onChange={(e) =>
                              roleMutation.mutate({
                                id: u.id,
                                role: e.target.value as UserRole,
                              })
                            }
                            className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Badge variant={roleVariant(u.role)}>{u.role}</Badge>
                        )}
                      </td>
                      <td className="table-td">
                        <select
                          value={u.status}
                          onChange={(e) =>
                            statusMutation.mutate({
                              id: u.id,
                              status: e.target.value as UserStatus,
                            })
                          }
                          className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="table-td">
                        <span
                          className={`text-xs font-medium ${u.emailVerified ? "text-green-600" : "text-yellow-600"}`}
                        >
                          {u.emailVerified ? "✓ Yes" : "✗ No"}
                        </span>
                      </td>
                      <td className="table-td text-gray-500">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="table-td">
                        {me?.role === "SUPER_ADMIN" && u.id !== me?.id && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
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
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Soft-delete{" "}
          <strong>
            {deleteTarget?.firstName} {deleteTarget?.lastName}
          </strong>
          ? This will deactivate their account.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              deleteTarget && deleteMutation.mutate(deleteTarget.id)
            }
            disabled={deleteMutation.isPending}
            className="btn-danger text-sm"
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
