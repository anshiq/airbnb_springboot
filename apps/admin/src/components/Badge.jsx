const COLOR_MAP = {
  // Listing / property statuses
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-700',
  SUSPENDED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  REJECTED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  // Booking statuses
  CONFIRMED: 'bg-blue-100 text-blue-800',
  CHECKED_IN: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  // Roles
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  PROPERTY_MANAGER: 'bg-blue-100 text-blue-800',
  HOST: 'bg-indigo-100 text-indigo-800',
  GUEST: 'bg-gray-100 text-gray-700',
  SUPPORT_AGENT: 'bg-teal-100 text-teal-800',
  // Boolean-ish
  true: 'bg-green-100 text-green-800',
  false: 'bg-gray-100 text-gray-600',
  YES: 'bg-green-100 text-green-800',
  NO: 'bg-gray-100 text-gray-600',
};

export default function Badge({ status, label }) {
  const display = label ?? status;
  const cls = COLOR_MAP[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {display}
    </span>
  );
}
