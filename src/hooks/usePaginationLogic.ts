import { useState, useMemo, useCallback } from "react";

interface UsePaginationLogicReturn {
  currentPage: number;
  totalPages: number;
  handlePageChange: (nextPage: number) => void;
}

export function usePaginationLogic(
  totalRecords: number,
  rowsPerPage: number,
): UsePaginationLogicReturn {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(function computeTotalPages() {
    if (rowsPerPage === 0 || totalRecords === 0) return 1;
    return Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  }, [totalRecords, rowsPerPage]);

  const handlePageChange = useCallback(
    function handlePageChangeCallback(nextPage: number) {
      if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
        return;
      }
      setCurrentPage(nextPage);
    },
    [currentPage, totalPages],
  );

  return { currentPage, totalPages, handlePageChange };
}
