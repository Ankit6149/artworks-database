import { formatCount } from "../utils/formatters";

interface TableFooterProps {
  currentPage: number;
  rowsPerPage: number;
  totalRecords: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (pageNumber: number) => void;
}

export function TableFooter({
  currentPage,
  rowsPerPage,
  totalRecords,
  totalPages,
  loading,
  onPageChange,
}: TableFooterProps) {
  const firstEntry =
    totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const lastEntry = Math.min(currentPage * rowsPerPage, totalRecords);

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );

  return (
    <div className="table-footer">
      <span className="text-sm text-slate-600">
        Showing <strong>{formatCount(firstEntry)}</strong> to{" "}
        <strong>{formatCount(lastEntry)}</strong> of{" "}
        <strong>{formatCount(totalRecords)}</strong> entries
      </span>

      <div className="pagination-controls">
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
        >
          Prev
        </button>
        {visiblePages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`page-btn ${pageNumber === currentPage ? "is-active" : ""}`}
            onClick={() => onPageChange(pageNumber)}
            disabled={loading}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
