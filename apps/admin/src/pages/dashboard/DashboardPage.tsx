import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import RevenueChart from "@/components/charts/RevenueChart";
import Spinner from "@/components/common/Spinner";
import { formatCurrency, formatNumber } from "@/utils/format";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  linkTo?: string;
}

function KpiCard({ label, value, icon, color, linkTo }: KpiCardProps) {
  const content = (
    <div
      className={`card flex items-start gap-4 hover:shadow-md transition-shadow ${linkTo ? "cursor-pointer" : ""}`}
    >
      <div
        className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
  return linkTo ? <Link to={linkTo}>{content}</Link> : <div>{content}</div>;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: adminApi.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Users"
          value={formatNumber(stats?.totalUsers ?? 0)}
          icon="👥"
          color="bg-blue-100"
        />
        <KpiCard
          label="Active Listings"
          value={formatNumber(stats?.activeListings ?? 0)}
          icon="🏠"
          color="bg-green-100"
        />
        <KpiCard
          label="Bookings This Month"
          value={formatNumber(stats?.bookingsThisMonth ?? 0)}
          icon="📋"
          color="bg-purple-100"
        />
        <KpiCard
          label="Revenue This Month"
          value={formatCurrency(stats?.revenueThisMonth ?? 0)}
          icon="💰"
          color="bg-indigo-100"
        />
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label="Listings Pending Review"
          value={stats?.pendingListings ?? 0}
          icon="⏳"
          color="bg-yellow-100"
          linkTo="/listings"
        />
        <KpiCard
          label="Host Applications Pending"
          value={stats?.pendingApplications ?? 0}
          icon="👤"
          color="bg-orange-100"
          linkTo="/host-applications"
        />
      </div>

      {/* Revenue chart */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Monthly Revenue Trend
        </h2>
        <RevenueChart data={stats?.monthlyRevenue ?? []} />
      </div>
    </div>
  );
}
