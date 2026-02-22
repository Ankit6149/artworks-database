import { useEffect, useState } from "react";
import type { Artwork } from "../types/artwork";
import { fetchArtworksPage } from "../services/artworksApi";

interface UseFetchArtworksReturn {
  artworks: Artwork[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  rowsPerPage: number;
}

export function useFetchArtworks(currentPage: number): UseFetchArtworksReturn {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  useEffect(function loadCurrentPageEffect() {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchArtworksPage(currentPage);

        if (cancelled) {
          return;
        }

        setArtworks(result.data);
        setTotalRecords(result.pagination.total);
        setRowsPerPage(result.pagination.limit);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load artworks.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return function cleanupLoadCurrentPageEffect() {
      cancelled = true;
    };
  }, [currentPage]);

  return { artworks, loading, error, totalRecords, rowsPerPage };
}
