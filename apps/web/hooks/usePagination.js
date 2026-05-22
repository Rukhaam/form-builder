import { useState, useCallback } from 'react';

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);

  const nextPage = useCallback((totalPages) => {
    setPage((prev) => (prev < totalPages ? prev + 1 : prev));
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const resetPage = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    page,
    setPage,
    nextPage,
    prevPage,
    resetPage,
  };
}