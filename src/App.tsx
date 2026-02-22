import { useEffect, useMemo, useState } from 'react'
import { FiCheck, FiChevronDown, FiX } from 'react-icons/fi'
import type { Artwork } from './types/artwork'
import { useArtworkSelection } from './hooks/useArtworkSelection'
import { fetchArtworksPage } from './services/artworksApi'
import './App.css'

const DEFAULT_ROWS = 12
const numberFormatter = new Intl.NumberFormat('en-US')

const renderCellText = (value: string | number | null): string =>
  value === null || value === '' ? '-' : String(value)

function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS)
  const [totalRecords, setTotalRecords] = useState(0)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectCountInput, setSelectCountInput] = useState('')
  const [isSelectPanelOpen, setIsSelectPanelOpen] = useState(false)

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
  } = useArtworkSelection()

  useEffect(() => {
    let cancelled = false

    const loadPage = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchArtworksPage(currentPage)

        if (cancelled) {
          return
        }

        setArtworks(result.data)
        setTotalRecords(result.pagination.total)
        setRowsPerPage(result.pagination.limit)
      } catch (loadError) {
        if (cancelled) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Failed to load artworks.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      cancelled = true
    }
  }, [currentPage])

  useEffect(() => {
    if (logicalTargetCount === null || artworks.length === 0) {
      return
    }

    syncLogicalTargetOnPage(logicalTargetCount, currentPage, rowsPerPage, artworks)
  }, [artworks, currentPage, logicalTargetCount, rowsPerPage, syncLogicalTargetOnPage])

  const pageSelection = useMemo(() => getPageSelection(artworks), [artworks, getPageSelection])
  const pageSelectionIds = useMemo(() => new Set(pageSelection.map((row) => row.id)), [pageSelection])
  const selectedCount = getSelectedCount(totalRecords)
  const isClearDisabled = !isSelectAllActive && selectedIds.size === 0
  const isCurrentPageFullySelected = artworks.length > 0 && pageSelection.length === artworks.length
  const totalPages = rowsPerPage === 0 ? 1 : Math.max(1, Math.ceil(totalRecords / rowsPerPage))

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return
    }

    setCurrentPage(nextPage)
  }

  const handleSelectionChange = (nextSelection: Artwork[]) => {
    updateSelectionForPage(artworks, nextSelection)
  }

  const handleSelectN = () => {
    const inputValue = selectCountInput === '' ? 0 : Number(selectCountInput)
    selectNRowsLogically(
      inputValue,
      totalRecords,
      currentPage,
      rowsPerPage,
      artworks,
    )
    setSelectCountInput('')
    setIsSelectPanelOpen(false)
  }

  const handleToggleSelectOnPage = () => {
    handleSelectionChange(isCurrentPageFullySelected ? [] : artworks)
  }

  const formatCount = (value: number): string => numberFormatter.format(value)
  const firstEntry = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const lastEntry = Math.min(currentPage * rowsPerPage, totalRecords)
  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, startPage + 4)
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  )

  return (
    <main className="min-h-screen bg-slate-100 p-2 sm:p-4 md:p-6">
      <section className="mx-auto max-w-full md:max-w-[1320px]">
        <header className="mb-2">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-800 truncate">
              Art Institute of Chicago Collection
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
              Server-side pagination with persistent logical row selection.
            </p>
          </div>
        </header>

        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="selected-pill">
            Selected: <span className="selected-pill-count">{formatCount(selectedCount)}</span> rows
          </div>

          <div>
            <button
              type="button"
              onClick={clearSelection}
              disabled={isClearDisabled}
              className="action-btn"
              title="Clear all selections"
            >
              <FiX size={15} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="artworks-table-wrap">
          <div className="artworks-table-toolbar">
            <button
              type="button"
              className="selection-header-trigger"
              aria-expanded={isSelectPanelOpen}
              aria-controls="select-n-panel"
              onClick={() => setIsSelectPanelOpen((previous) => !previous)}
            >
              <FiChevronDown size={16} />
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={handleToggleSelectOnPage}
              disabled={artworks.length === 0}
            >
              {isCurrentPageFullySelected ? 'Unselect page' : 'Select page'}
            </button>
          </div>

          {isSelectPanelOpen && (
            <div id="select-n-panel" className="select-n-panel">
              <label htmlFor="select-n-input" className="text-sm font-semibold text-slate-800">
                Select Multiple Rows
              </label>
              <p className="text-xs text-slate-500">Enter number of rows to select across all pages</p>
              <div className="select-n-controls">
                <input
                  id="select-n-input"
                  type="number"
                  min={0}
                  max={totalRecords}
                  value={selectCountInput}
                  onChange={(event) => setSelectCountInput(event.target.value)}
                  placeholder="e.g., 20"
                  className="select-n-input"
                />
                <button type="button" className="select-n-btn" onClick={handleSelectN}>
                  <FiCheck size={14} />
                  <span>Select</span>
                </button>
              </div>
            </div>
          )}

          <div className="artworks-table-scroll">
            <table className="artworks-table" aria-label="Artworks data table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input
                      type="checkbox"
                      aria-label="Select all rows on this page"
                      checked={isCurrentPageFullySelected}
                      onChange={handleToggleSelectOnPage}
                      disabled={artworks.length === 0}
                    />
                  </th>
                  <th>Title</th>
                  <th>Place Of Origin</th>
                  <th>Artist Display</th>
                  <th>Inscriptions</th>
                  <th>Date Start</th>
                  <th>Date End</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="status-cell">
                      Loading artworks...
                    </td>
                  </tr>
                )}
                {!loading && artworks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="status-cell">
                      No artworks found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  artworks.map((row) => {
                    const rowSelected = pageSelectionIds.has(row.id)

                    return (
                      <tr key={row.id} className={rowSelected ? 'row-selected' : ''}>
                        <td className="checkbox-column">
                          <input
                            type="checkbox"
                            aria-label={`Select row ${row.id}`}
                            checked={rowSelected}
                            onChange={() => {
                              const nextSelection = rowSelected
                                ? pageSelection.filter((selectedRow) => selectedRow.id !== row.id)
                                : [...pageSelection, row]
                              handleSelectionChange(nextSelection)
                            }}
                          />
                        </td>
                        <td>{renderCellText(row.title)}</td>
                        <td>{renderCellText(row.place_of_origin)}</td>
                        <td>{renderCellText(row.artist_display)}</td>
                        <td>{renderCellText(row.inscriptions)}</td>
                        <td>{renderCellText(row.date_start)}</td>
                        <td>{renderCellText(row.date_end)}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span className="text-sm text-slate-600">
              Showing <strong>{formatCount(firstEntry)}</strong> to <strong>{formatCount(lastEntry)}</strong>{' '}
              of <strong>{formatCount(totalRecords)}</strong> entries
            </span>

            <div className="pagination-controls">
              <button
                type="button"
                className="page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                Prev
              </button>
              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`page-btn ${pageNumber === currentPage ? 'is-active' : ''}`}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={loading}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                className="page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
