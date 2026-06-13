import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { useAuth } from '@/store/authStore';

// Layouts
import Layout from '@/components/layout/Layout';

// Pages
import HomePage from '@/pages/home/HomePage';
import SearchPage from '@/pages/search/SearchPage';
import PropertyDetailPage from '@/pages/property/PropertyDetailPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import TripsPage from '@/pages/trips/TripsPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import BookingPage from '@/pages/booking/BookingPage';
import BookingSuccessPage from '@/pages/booking/BookingSuccessPage';
import HostDashboardPage from '@/pages/host/HostDashboardPage';
import CreateListingPage from '@/pages/host/CreateListingPage';
import HostBookingsPage from '@/pages/host/HostBookingsPage';

// ─── Root ─────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ─── Layout wrapper ───────────────────────────────────────────────────────────
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

// ─── Auth-required wrapper ────────────────────────────────────────────────────
const authRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: 'auth-guard',
  beforeLoad: () => {
    const token = localStorage.getItem('rental_access_token');
    if (!token) throw redirect({ to: '/auth/login' });
  },
  component: () => <Outlet />,
});

// ─── Host-required wrapper ────────────────────────────────────────────────────
const hostRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: 'host-guard',
  beforeLoad: () => {
    const user = localStorage.getItem('rental_user');
    if (!user) throw redirect({ to: '/auth/login' });
    const parsed = JSON.parse(user);
    if (parsed.role !== 'HOST' && parsed.role !== 'SUPER_ADMIN') {
      throw redirect({ to: '/' });
    }
  },
  component: () => <Outlet />,
});

// ─── Public routes ────────────────────────────────────────────────────────────
const indexRoute = createRoute({ getParentRoute: () => layoutRoute, path: '/',           component: HomePage });
const searchRoute = createRoute({ getParentRoute: () => layoutRoute, path: '/search',     component: SearchPage });
const propertyRoute = createRoute({ getParentRoute: () => layoutRoute, path: '/properties/$id', component: PropertyDetailPage });
const loginRoute  = createRoute({ getParentRoute: () => rootRoute,   path: '/auth/login',    component: LoginPage });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/auth/register', component: RegisterPage });
const forgotRoute = createRoute({ getParentRoute: () => rootRoute,   path: '/auth/forgot-password', component: ForgotPasswordPage });
const resetRoute  = createRoute({ getParentRoute: () => rootRoute,   path: '/auth/reset-password',  component: ResetPasswordPage });

// ─── Protected routes ─────────────────────────────────────────────────────────
const tripsRoute   = createRoute({ getParentRoute: () => authRoute, path: '/trips',           component: TripsPage });
const profileRoute = createRoute({ getParentRoute: () => authRoute, path: '/profile',         component: ProfilePage });
const bookingRoute = createRoute({ getParentRoute: () => authRoute, path: '/booking/$id',     component: BookingPage });
const bookingSuccessRoute = createRoute({ getParentRoute: () => authRoute, path: '/booking/$id/success', component: BookingSuccessPage });

// ─── Host routes ──────────────────────────────────────────────────────────────
const hostDashRoute   = createRoute({ getParentRoute: () => hostRoute, path: '/host',                  component: HostDashboardPage });
const createListRoute = createRoute({ getParentRoute: () => hostRoute, path: '/host/listings/create',  component: CreateListingPage });
const hostBookingsRoute = createRoute({ getParentRoute: () => hostRoute, path: '/host/bookings',        component: HostBookingsPage });

// ─── Route tree ───────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    searchRoute,
    propertyRoute,
    authRoute.addChildren([tripsRoute, profileRoute, bookingRoute, bookingSuccessRoute]),
    hostRoute.addChildren([hostDashRoute, createListRoute, hostBookingsRoute]),
  ]),
  loginRoute,
  registerRoute,
  forgotRoute,
  resetRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

export default function App() {
  return <RouterProvider router={router} />;
}
