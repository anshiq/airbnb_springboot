import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ListingsModeration from "./pages/ListingsModeration.jsx";
import HostApplications from "./pages/HostApplications.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import UserDetail from "./pages/UserDetail.jsx";
import BookingManagement from "./pages/BookingManagement.jsx";
import PlatformConfig from "./pages/PlatformConfig.jsx";
import HostDashboard from "./pages/HostDashboard.jsx";
import PropertyForm from "./pages/PropertyForm.jsx";
import PropertyDetail from "./pages/PropertyDetail.jsx";
import HostBookings from "./pages/HostBookings.jsx";
import Profile from "./pages/Profile.jsx";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/listings": "Listings Moderation",
  "/host-applications": "Host Applications",
  "/users": "User Management",
  "/bookings": "Booking Management",
  "/platform-config": "Platform Config",
  "/my-listings": "My Properties",
  "/my-listings/new": "New Property",
  "/host-bookings": "My Bookings",
  "/profile": "Profile",
};

function getTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/users/")) return "User Detail";
  if (pathname.endsWith("/edit")) return "Edit Property";
  if (pathname.startsWith("/my-listings/")) return "Property Detail";
  return "Admin Portal";
}

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <TopBar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Admin/Manager/Support routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings"
        element={
          <ProtectedRoute roles={["SUPER_ADMIN", "PROPERTY_MANAGER"]}>
            <Layout>
              <ListingsModeration />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/host-applications"
        element={
          <ProtectedRoute roles={["SUPER_ADMIN", "PROPERTY_MANAGER"]}>
            <Layout>
              <HostApplications />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute
            roles={["SUPER_ADMIN", "PROPERTY_MANAGER", "SUPPORT_AGENT"]}
          >
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute
            roles={["SUPER_ADMIN", "PROPERTY_MANAGER", "SUPPORT_AGENT"]}
          >
            <Layout>
              <UserDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute
            roles={["SUPER_ADMIN", "PROPERTY_MANAGER", "SUPPORT_AGENT"]}
          >
            <Layout>
              <BookingManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/platform-config"
        element={
          <ProtectedRoute roles={["SUPER_ADMIN"]}>
            <Layout>
              <PlatformConfig />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Host routes */}
      <Route
        path="/my-listings"
        element={
          <ProtectedRoute roles={["HOST"]}>
            <Layout>
              <HostDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-listings/new"
        element={
          <ProtectedRoute roles={["HOST"]}>
            <Layout>
              <PropertyForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-listings/:id/edit"
        element={
          <ProtectedRoute roles={["HOST"]}>
            <Layout>
              <PropertyForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-listings/:id"
        element={
          <ProtectedRoute roles={["HOST"]}>
            <Layout>
              <PropertyDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/host-bookings"
        element={
          <ProtectedRoute roles={["HOST"]}>
            <Layout>
              <HostBookings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Shared */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
