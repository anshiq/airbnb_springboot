import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/store/authStore";
import { getInitials } from "@/utils/format";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/listings": "Listing Moderation",
  "/host-applications": "Host Applications",
  "/bookings": "Bookings",
  "/users": "User Management",
  "/config": "Platform Configuration",
};

export default function TopBar() {
  const { user } = useAuth();
  const router = useRouterState();
  const pathname = router.location.pathname;
  const title = PAGE_TITLES[pathname] ?? "Admin";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {/* Bell icon */}
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors relative">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            {user ? getInitials(user.firstName, user.lastName) : "?"}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>
    </header>
  );
}
