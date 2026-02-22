import { useEffect, useMemo, useState } from "react";
import type { Artwork } from "./types/artwork";
import { useArtworkSelection } from "./hooks/useArtworkSelection";
import { fetchArtworksPage } from "./services/artworksApi";
import {
  HeaderSection,
  SelectionBar,
  TableToolbar,
  SelectNPanel,
  ArtworksTable,
  TableFooter,
  ErrorBanner,
} from "./components";
import "./App.css";

const DEFAULT_ROWS = 12;

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS);
  const [totalRecords, setTotalRecords] = useState(0);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectCountInput, setSelectCountInput] = useState("");
  const [isSelectPanelOpen, setIsSelectPanelOpen] = useState(false);

  const {
    selectedIds,
    isSelectAllActive,
    logicalTargetCount,
    getPageSelection,
    updateSelectionForPage,
    clearSelection,
    selectNRowsLogically,
    syncLogicalTargetOnPage,
    getSelectedCount,
  } = useArtworkSelection();

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
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
    };

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  useEffect(() => {
    if (logicalTargetCount === null || artworks.length === 0) {
      return;
    }

    syncLogicalTargetOnPage(
      logicalTargetCount,
      currentPage,
      rowsPerPage,
      artworks,
    );
  }, [
    artworks,
    currentPage,
    logicalTargetCount,
    rowsPerPage,
    syncLogicalTargetOnPage,
  ]);

  const pageSelection = useMemo(
    () => getPageSelection(artworks),
    [artworks, getPageSelection],
  );
  const selectedCount = getSelectedCount(totalRecords);
  const isClearDisabled = !isSelectAllActive && selectedIds.size === 0;
  const isCurrentPageFullySelected =
    artworks.length > 0 && pageSelection.length === artworks.length;
  const totalPages =
    rowsPerPage === 0 ? 1 : Math.max(1, Math.ceil(totalRecords / rowsPerPage));

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return;
    }

    setCurrentPage(nextPage);
  };

  const handleSelectionChange = (nextSelection: Artwork[]) => {
    updateSelectionForPage(artworks, nextSelection);
  };

  const handleSelectN = () => {
    const inputValue = selectCountInput === "" ? 0 : Number(selectCountInput);
    selectNRowsLogically(
      inputValue,
      totalRecords,
      currentPage,
      rowsPerPage,
      artworks,
    );
    setSelectCountInput("");
    setIsSelectPanelOpen(false);
  };

  const handleToggleSelectOnPage = () => {
    handleSelectionChange(isCurrentPageFullySelected ? [] : artworks);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-2 sm:p-4 md:p-6">
      <section className="mx-auto max-w-full md:max-w-330">
        <HeaderSection
          title="Art Institute of Chicago Collection"
          subtitle="Server-side pagination with persistent logical row selection."
        />

        <SelectionBar
          selectedCount={selectedCount}
          onClearClick={clearSelection}
          isClearDisabled={isClearDisabled}
        />

        <ErrorBanner error={error} />

        <div className="artworks-table-wrap">
          <TableToolbar
            isSelectPanelOpen={isSelectPanelOpen}
            onToggleSelectPanel={() =>
              setIsSelectPanelOpen((previous) => !previous)
            }
            isCurrentPageFullySelected={isCurrentPageFullySelected}
            onToggleSelectPage={handleToggleSelectOnPage}
            isSelectPageDisabled={artworks.length === 0}
          />

          <SelectNPanel
            isOpen={isSelectPanelOpen}
            inputValue={selectCountInput}
            totalRecords={totalRecords}
            onInputChange={setSelectCountInput}
            onSelectClick={handleSelectN}
          />

          <ArtworksTable
            artworks={artworks}
            loading={loading}
            isCurrentPageFullySelected={isCurrentPageFullySelected}
            pageSelection={pageSelection}
            onToggleSelectPage={handleToggleSelectOnPage}
            onSelectionChange={handleSelectionChange}
          />

          <TableFooter
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalRecords={totalRecords}
            totalPages={totalPages}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </div>
      </section>
    </main>
  );
}

export default App;
