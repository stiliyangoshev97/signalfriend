/**
 * @fileoverview Pagination component
 * @module features/signals/components/Pagination
 * @description
 * Reusable pagination component for navigating through paginated results.
 */

import type { Pagination as PaginationType } from '@/shared/types';

/** Props for Pagination component */
interface PaginationProps {
  /** Current pagination state */
  pagination: PaginationType;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Label for items (e.g., "signals", "predictors"). Defaults to "signals" */
  itemLabel?: string;
}

/**
 * Pagination component
 * 
 * Displays:
 * - Previous/Next buttons
 * - Current page indicator
 * - Total pages
 * - Page number buttons (with ellipsis for many pages)
 * 
 * @param props - Component props
 * @returns Pagination element
 * 
 * @example
 * <Pagination
 *   pagination={{ page: 1, limit: 10, total: 100, totalPages: 10 }}
 *   onPageChange={(page) => setFilters({ ...filters, page })}
 * />
 */
export function Pagination({
  pagination,
  onPageChange,
  itemLabel = 'signals',
}: PaginationProps): React.ReactElement | null {
  const { page, totalPages, total } = pagination;

  // Don't render if only one page
  if (totalPages <= 1) return null;

  // Handle page change - trigger page change, then scroll to top after React updates
  const handlePageClick = (newPage: number) => {
    onPageChange(newPage);
    // Use setTimeout to scroll after React has finished re-rendering
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
  };

  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Adjust if at the beginning
      if (page <= 3) {
        end = 4;
      }

      // Adjust if at the end
      if (page >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add ellipsis before range if needed
      if (start > 2) {
        pages.push('ellipsis');
      }

      // Add visible range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after range if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-between border-t border-dark-600 pt-6 mt-8">
      {/* Results summary */}
      <p className="text-sm text-fur-cream/60">
        Showing page <span className="font-medium text-fur-cream">{page}</span>{' '}
        of <span className="font-medium text-fur-cream">{totalPages}</span>
        {' '}({total} total {itemLabel})
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => handlePageClick(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 text-sm rounded-lg border border-dark-600 text-fur-cream/60 hover:border-dark-500 hover:text-fur-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="sr-only">Previous</span>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNum, idx) =>
          pageNum === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-3 py-2 text-sm text-fur-cream/40"
            >
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                pageNum === page
                  ? 'bg-fur-light border-fur-light text-dark-900 font-medium'
                  : 'border-dark-600 text-fur-cream/60 hover:border-dark-500 hover:text-fur-cream'
              }`}
            >
              {pageNum}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => handlePageClick(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-2 text-sm rounded-lg border border-dark-600 text-fur-cream/60 hover:border-dark-500 hover:text-fur-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="sr-only">Next</span>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
