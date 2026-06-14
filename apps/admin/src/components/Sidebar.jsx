import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    roles: ['SUPER_ADMIN', 'PROPERTY_MANAGER', 'SUPPORT_AGENT', 'HOST'],
  },
  {
    to: '/listings',
    label: 'Listings Moderation',
    icon: '🏠',
    roles: ['SUPER_ADMIN', 'PROPERTY_MANAGER'],
  },
  {
    to: '/host-applications',
    label: 'Host Applications',
    icon: '📋',
    roles: ['SUPER_ADMIN', 'PROPERTY_MANAGER'],
  },
  {
    to: '/users',
    label: 'User Management',
    icon: '👥',
    roles: ['SUPER_ADMIN', 'PROPERTY_MANAGER', 'SUPPORT_AGENT'],
  },
  {
    to: '/bookings',
    label: 'Bookings',
    icon: '📅',
    roles: ['SUPER_ADMIN', 'PROPERTY_MANAGER', 'SUPPORT_AGENT'],
  },
  {
    to: '/platform-config',
    label: 'Platform Config',
    icon: '⚙️',
    roles: ['SUPER_ADMIN'],
  },
  {
    to: '/my-listings',
    label: 'My Properties',
    icon: '🏡',
    roles: ['HOST'],
  },
  {
    to: '/host-bookings',
    label: 'My Bookings',
    icon: '📆',
    roles: ['HOST'],
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: '👤',
    roles: ['SUPER_ADMIN', 'PROPERTY_MANAGER', 'SUPPORT_AGENT', 'HOST'],
  },
];

function SidebarContent({ onLinkClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visible = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-700/60">
        <h1 className="text-xl font-bold text-white tracking-tight">StayFinder</h1>
        <p className="text-xs text-slate-400 mt-0.5">Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
              }`
            }
          >
            <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-700/60 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700/70 hover:text-white transition-colors"
        >
          <span className="w-5 text-center text-base">🚪</span>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 shadow-2xl">
            <SidebarContent onLinkClick={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
