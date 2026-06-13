import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertiesApi } from "@/api/properties";
import { bookingsApi } from "@/api/bookings";
import Badge, {
  propertyStatusVariant,
  bookingStatusVariant,
} from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import { formatCurrency, formatDate } from "@/utils/format";

export default function HostDashboardPage() {
  const queryClient = useQueryClient();

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ["host-listings"],
    queryFn: () => propertiesApi.getMyListings(0, 10),
  });

  const { data: bookings } = useQuery({
    queryKey: ["host-bookings-recent"],
    queryFn: () => bookingsApi.getHostBookings(undefined, 0, 5),
  });

  const submitMutation = useMutation({
    mutationFn: (id: number) => propertiesApi.submitForReview(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["host-listings"] }),
  });

  const activeCount =
    listings?.content.filter((l) => l.status === "ACTIVE").length ?? 0;
  const pendingCount =
    listings?.content.filter((l) => l.status === "PENDING_REVIEW").length ?? 0;
  const draftCount =
    listings?.content.filter((l) => l.status === "DRAFT").length ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
        <Link
          to="/host/listings/create"
          className="bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors"
        >
          + New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Active Listings",
            value: activeCount,
            color: "bg-green-50 text-green-700",
          },
          {
            label: "Pending Review",
            value: pendingCount,
            color: "bg-yellow-50 text-yellow-700",
          },
          {
            label: "Drafts",
            value: draftCount,
            color: "bg-gray-50 text-gray-700",
          },
          {
            label: "Total Listings",
            value: listings?.totalElements ?? 0,
            color: "bg-blue-50 text-blue-700",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-2xl p-5`}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm font-medium mt-0.5 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      {/* My Listings */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
        </div>
        {listingsLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" className="text-brand-500" />
          </div>
        ) : listings?.content.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏠</p>
            <p className="text-gray-500 mb-4">No listings yet</p>
            <Link to="/host/listings/create" className="btn-primary">
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Price/night
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings?.content.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {listing.firstPhotoUrl ? (
                          <img
                            src={listing.firstPhotoUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                            🏠
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {listing.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {listing.city}, {listing.country}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={propertyStatusVariant(listing.status)}>
                        {listing.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(listing.basePrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {listing.averageRating != null
                        ? `★ ${listing.averageRating.toFixed(1)} (${listing.reviewCount})`
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/properties/$id"
                          params={{ id: String(listing.id) }}
                          className="text-xs text-brand-500 font-medium hover:text-brand-600"
                        >
                          View
                        </Link>
                        {listing.status === "DRAFT" && (
                          <button
                            onClick={() => submitMutation.mutate(listing.id)}
                            disabled={submitMutation.isPending}
                            className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                          >
                            Submit for Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent bookings */}
      {bookings && bookings.content.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Bookings
            </h2>
            <Link
              to="/host/bookings"
              className="text-sm text-brand-500 font-medium hover:text-brand-600"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {bookings.content.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {b.guest.firstName} {b.guest.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {b.property.title} · {formatDate(b.checkInDate)} →{" "}
                    {formatDate(b.checkOutDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(b.totalPrice)}
                  </span>
                  <Badge variant={bookingStatusVariant(b.status)}>
                    {b.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
