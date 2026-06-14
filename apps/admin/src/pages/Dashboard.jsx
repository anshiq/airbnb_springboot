import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import StatsCard from "../components/StatsCard.jsx";
import Badge from "../components/Badge.jsx";
import { adminApi } from "../api/admin.js";
import { propertiesApi } from "../api/properties.js";
import { bookingsApi } from "../api/bookings.js";

function downloadCSV(rows, filename) {
  const header = Object.keys(rows[0]).join(",");
  const body = rows.map((r) => Object.values(r).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function fmt(n) {
  return n != null ? Number(n).toLocaleString() : "—";
}

function fmtCurrency(n) {
  return n != null
    ? `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";
}

// Simple bar chart using div widths
function RevenueBar({ value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-20 text-right tabular-nums">
        {fmtCurrency(value)}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { isHost } = useAuth();
  const [stats, setStats] = useState(null);
  const [hostListings, setHostListings] = useState(null);
  const [hostBookings, setHostBookings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isHost()) {
      loadHostData();
    } else {
      loadAdminData();
    }
  }, []);

  async function loadAdminData() {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadHostData() {
    try {
      const [listings, bookings] = await Promise.all([
        propertiesApi.getMyListings(0, 20),
        bookingsApi.getHostBookings({ page: 0, size: 20 }),
      ]);
      setHostListings(listings);
      setHostBookings(bookings);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  /* ── HOST view ── */
  if (isHost()) {
    // Calculate earnings from completed bookings
    const completedBookings = (hostBookings?.content ?? []).filter(
      (b) => b.status === "COMPLETED",
    );
    const totalEarnings = completedBookings.reduce(
      (sum, b) => sum + (Number(b.totalPrice ?? b.totalAmount) || 0),
      0,
    );
    const pendingCount = (hostBookings?.content ?? []).filter(
      (b) => b.status === "PENDING",
    ).length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Properties"
            value={fmt(hostListings?.totalElements)}
            icon="🏡"
            color="indigo"
          />
          <StatsCard
            title="Active Listings"
            value={fmt(
              (hostListings?.content ?? []).filter((p) => p.status === "ACTIVE")
                .length,
            )}
            icon="✅"
            color="green"
          />
          <StatsCard
            title="Pending Requests"
            value={fmt(pendingCount)}
            icon="⏳"
            color="orange"
          />
          <StatsCard
            title="Earnings (Completed)"
            value={fmtCurrency(totalEarnings)}
            icon="💰"
            color="green"
            subtitle={`From ${completedBookings.length} completed stays`}
          />
        </div>

        {/* Recent bookings */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Bookings</h3>
            <Link
              to="/host-bookings"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {["Property", "Guest", "Check-in", "Check-out", "Status"].map(
                    (h) => (
                      <th key={h} className="table-th">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(hostBookings?.content ?? []).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td font-medium text-gray-900">
                      {b.property?.title ?? b.propertyTitle ?? "—"}
                    </td>
                    <td className="table-td">
                      {b.guest?.firstName ?? b.guestName ?? "—"}
                    </td>
                    <td className="table-td">{b.checkInDate ?? "—"}</td>
                    <td className="table-td">{b.checkOutDate ?? "—"}</td>
                    <td className="table-td">
                      <Badge status={b.status} />
                    </td>
                  </tr>
                ))}
                {!hostBookings?.content?.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-400 text-sm"
                    >
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent listings */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">My Properties</h3>
            <Link
              to="/my-listings"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {["Title", "Type", "Price/night", "Status"].map((h) => (
                    <th key={h} className="table-th">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(hostListings?.content ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td font-medium text-gray-900">
                      {p.title}
                    </td>
                    <td className="table-td">{p.propertyType}</td>
                    <td className="table-td tabular-nums">${p.basePrice}</td>
                    <td className="table-td">
                      <Badge status={p.status} />
                    </td>
                  </tr>
                ))}
                {!hostListings?.content?.length && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-400 text-sm"
                    >
                      No properties yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ── ADMIN view ── */
  const maxRevenue = Math.max(
    ...(stats?.monthlyRevenue ?? []).map((r) => Number(r.revenue) || 0),
    1,
  );

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={fmt(stats?.totalUsers)}
          icon="👥"
          color="blue"
          subtitle={`${fmt(stats?.totalHosts)} hosts · ${fmt(stats?.totalGuests)} guests`}
        />
        <StatsCard
          title="Active Listings"
          value={fmt(stats?.activeListings)}
          icon="🏠"
          color="green"
          subtitle={`${fmt(stats?.pendingListings)} pending review`}
        />
        <StatsCard
          title="Bookings This Month"
          value={fmt(stats?.bookingsThisMonth)}
          icon="📅"
          color="indigo"
        />
        <StatsCard
          title="Revenue This Month"
          value={fmtCurrency(stats?.revenueThisMonth)}
          icon="💰"
          color="orange"
        />
      </div>

      {/* Monthly revenue */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">
              Monthly Revenue Overview
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Revenue and booking counts by month
            </p>
          </div>
          {stats?.monthlyRevenue?.length > 0 && (
            <button
              onClick={() =>
                downloadCSV(
                  stats.monthlyRevenue.map((r) => ({
                    Year: r.year,
                    Month: r.monthName,
                    Bookings: r.bookings,
                    Revenue: r.revenue,
                  })),
                  "monthly-revenue.csv",
                )
              }
              className="btn-secondary text-xs flex items-center gap-1"
            >
              ⬇ Export CSV
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Year", "Month", "Bookings", "Revenue"].map((h) => (
                  <th key={h} className="table-th">
                    {h}
                  </th>
                ))}
                <th className="table-th w-48">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(stats?.monthlyRevenue ?? []).map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td tabular-nums">{r.year}</td>
                  <td className="table-td">{r.monthName}</td>
                  <td className="table-td tabular-nums">{fmt(r.bookings)}</td>
                  <td className="table-td font-medium tabular-nums">
                    {fmtCurrency(r.revenue)}
                  </td>
                  <td className="table-td">
                    <RevenueBar value={Number(r.revenue)} max={maxRevenue} />
                  </td>
                </tr>
              ))}
              {!stats?.monthlyRevenue?.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-400 text-sm"
                  >
                    No revenue data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
