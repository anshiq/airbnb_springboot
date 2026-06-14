import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client.js';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetchCount();
    const iv = setInterval(fetchCount, 30_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  async function fetchCount() {
    try {
      const data = await api.get('/notifications/unread-count');
      setCount(typeof data === 'number' ? data : data?.count ?? 0);
    } catch (_) {}
  }

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && notifications.length === 0) {
      setLoadingNotifs(true);
      try {
        const data = await api.get('/notifications?page=0&size=15');
        setNotifications(data?.content ?? []);
      } catch (_) {
      } finally {
        setLoadingNotifs(false);
      }
    }
  }

  async function markAllRead() {
    try {
      await api.post('/notifications/mark-all-read');
      setCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (_) {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-xs flex items-center justify-center px-1 font-medium">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
            {count > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loadingNotifs ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !n.read ? 'bg-indigo-50/60' : ''
                  }`}
                >
                  {!n.read && (
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-2 align-middle" />
                  )}
                  <p className="text-sm text-gray-800 inline">{n.message ?? n.title ?? '—'}</p>
                  {n.createdAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
