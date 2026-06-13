import { cn } from "@/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const from = currentPage * pageSize + 1;
  const to = Math.min((currentPage + 1) * pageSize, totalElements);

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i;
    if (currentPage <= 2) return i;
    if (currentPage >= totalPages - 3) return totalPages - 5 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">
        Showing {from}–{to} of {totalElements}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={cn(
            "px-3 py-1.5 text-sm rounded-md transition-colors",
            currentPage === 0
              ? "text-gray-300"
              : "text-gray-700 hover:bg-gray-100",
          )}
        >
          ‹ Prev
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-8 h-8 text-sm rounded-md transition-colors",
              page === currentPage
                ? "bg-indigo-600 text-white"
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
            "px-3 py-1.5 text-sm rounded-md transition-colors",
            currentPage === totalPages - 1
              ? "text-gray-300"
              : "text-gray-700 hover:bg-gray-100",
          )}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
