import { cn } from "@/utils/cn";

interface PaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i;
    if (currentPage <= 3) return i;
    if (currentPage >= totalPages - 4) return totalPages - 7 + i;
    return currentPage - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={cn(
          "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          currentPage === 0
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100",
        )}
      >
        ← Prev
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
            page === currentPage
              ? "bg-brand-500 text-white"
              : "text-gray-700 hover:bg-gray-100",
          )}
        >
          {page + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={cn(
          "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          currentPage === totalPages - 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100",
        )}
      >
        Next →
      </button>
    </div>
  );
}
