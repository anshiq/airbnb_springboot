import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import AdminLayout from '@/components/layout/Layout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ListingsModerationPage from '@/pages/listings/ListingsModerationPage';
import HostApplicationsPage from '@/pages/host-applications/HostApplicationsPage';
import BookingsPage from '@/pages/bookings/BookingsPage';
import UsersPage from '@/pages/users/UsersPage';
import PlatformConfigPage from '@/pages/config/PlatformConfigPage';

// ─── Root ─────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: () => <Outlet /> });

// ─── Login (public) ───────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// ─── Admin layout (protected) ─────────────────────────────────────────────────
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  beforeLoad: () => {
    const token = localStorage.getItem('admin_access_token');
    if (!token) throw redirect({ to: '/login' });
  },
  component: AdminLayout,
});

// ─── Protected pages ──────────────────────────────────────────────────────────
const dashboardRoute    = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/',               component: DashboardPage });
const listingsRoute     = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/listings',       component: ListingsModerationPage });
const hostAppsRoute     = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/host-applications', component: HostApplicationsPage });
const bookingsRoute     = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/bookings',       component: BookingsPage });
const usersRoute        = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/users',          component: UsersPage });
const configRoute       = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/config',         component: PlatformConfigPage });

// ─── Route tree ───────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  loginRoute,
  adminLayoutRoute.addChildren([
    dashboardRoute,
    listingsRoute,
    hostAppsRoute,
    bookingsRoute,
    usersRoute,
    configRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

export default function App() {
  return <RouterProvider router={router} />;
}
