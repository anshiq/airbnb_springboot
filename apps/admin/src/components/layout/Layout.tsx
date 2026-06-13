import { Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AdminLayout() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: adminApi.getDashboardStats,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        pendingListings={stats?.pendingListings}
        pendingApplications={stats?.pendingApplications}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
