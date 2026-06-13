import { useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import Spinner from './Spinner';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function Table<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data available.',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey];
        const bVal = (b as Record<string, unknown>)[sortKey];
        const cmp = String(aVal ?? '').localeCompare(
          String(bVal ?? ''),
          undefined,
          { numeric: true },
        );
        return sortAsc ? cmp : -cmp;
      })
    : data;

  const handleHeaderClick = (key: string) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="relative overflow-x-auto">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      )}
      <table className="w-full text-sm text-left">
        <thead className="border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleHeaderClick(col.key)}
                className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-700 transition-colors"
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {sortKey === col.key && (
                    <span className="text-indigo-500">{sortAsc ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 && !isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr
                key={idx}
                className={cn(
                  'border-b border-gray-100 hover:bg-indigo-50/30 transition-colors',
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700 align-middle">
                    {col.render
                      ? col.render(row, idx)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
