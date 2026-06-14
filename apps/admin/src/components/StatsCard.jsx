const COLOR_MAP = {
  indigo: 'bg-indigo-50 text-indigo-600',
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  teal: 'bg-teal-50 text-teal-600',
  yellow: 'bg-yellow-50 text-yellow-600',
};

export default function StatsCard({ title, value, subtitle, icon, color = 'indigo', trend }) {
  const iconCls = COLOR_MAP[color] ?? COLOR_MAP.indigo;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend != null && (
            <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ml-4 ${iconCls}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
