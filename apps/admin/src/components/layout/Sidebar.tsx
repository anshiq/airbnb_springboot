import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/store/authStore";
import { getInitials } from "@/utils/format";

interface SidebarProps {
  pendingListings?: number;
  pendingApplications?: number;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: "📊", adminOnly: false },
  { path: "/listings", label: "Listings", icon: "🏠", adminOnly: false },
  {
    path: "/host-applications",
    label: "Host Applications",
    icon: "👤",
    adminOnly: false,
  },
  { path: "/bookings", label: "Bookings", icon: "📋", adminOnly: false },
  { path: "/users", label: "Users", icon: "👥", adminOnly: false },
  { path: "/config", label: "Platform Config", icon: "⚙️", adminOnly: true },
];

export default function Sidebar({
  pendingListings = 0,
  pendingApplications = 0,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouterState();
  const pathname = router.location.pathname;

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <div>
            <p className="font-bold text-white text-sm">StayEase</p>
            <p className="text-gray-400 text-xs">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon, adminOnly }) => {
          if (adminOnly && user?.role !== "SUPER_ADMIN") return null;
          const isActive =
            pathname === path || (path !== "/" && pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-base">{icon}</span>
              <span className="flex-1">{label}</span>
              {label === "Listings" && pendingListings > 0 && (
                <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingListings}
                </span>
              )}
              {label === "Host Applications" && pendingApplications > 0 && (
                <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingApplications}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user ? getInitials(user.firstName, user.lastName) : "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
