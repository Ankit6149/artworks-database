import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { OverlayPanel } from 'primereact/overlaypanel'
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
  const overlayRef = useRef<OverlayPanel>(null)

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
  const selectedCount = getSelectedCount(totalRecords)
  const isClearDisabled = !isSelectAllActive && selectedIds.size === 0

  const handlePageChange = (event: any) => {
    if (typeof event.page !== 'number') {
      return
    }

    const nextPage = event.page + 1

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage)
    }
  }

  const handleSelectionChange = (event: any) => {
    const nextSelection = Array.isArray(event.value) ? (event.value as Artwork[]) : []
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
    overlayRef.current?.hide()
  }

  const handleSelectionHeaderMenuToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    overlayRef.current?.toggle(event)
  }

  const formatCount = (value: number): string => numberFormatter.format(value)
  const firstEntry = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const lastEntry = Math.min(currentPage * rowsPerPage, totalRecords)

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

        <DataTable
          value={artworks}
          dataKey="id"
          selectionMode="multiple"
          selection={pageSelection}
          onSelectionChange={handleSelectionChange}
          paginator
          lazy
          first={(currentPage - 1) * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPage={handlePageChange}
          loading={loading}
          selectionPageOnly
          className="artworks-table"
          tableStyle={{ minWidth: '100%' }}
          responsiveLayout="scroll"
          paginatorTemplate="PrevPageLink PageLinks NextPageLink"
          paginatorLeft={
            <span className="text-sm text-slate-600">
              Showing <strong>{formatCount(firstEntry)}</strong> to{' '}
              <strong>{formatCount(lastEntry)}</strong> of{' '}
              <strong>{formatCount(totalRecords)}</strong> entries
            </span>
          }
          stripedRows
          emptyMessage="No artworks found."
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '3.5rem' }}
            bodyStyle={{ padding: '0.64rem 0.4rem', textAlign: 'center' }}
            headerClassName="selection-column-header"
            header={
              <button
                type="button"
                className="selection-header-trigger"
                aria-label="Select multiple rows"
                onMouseDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onClick={handleSelectionHeaderMenuToggle}
              >
                <FiChevronDown size={16} />
              </button>
            }
          />
          <Column field="title" header="Title" body={(row: Artwork) => renderCellText(row.title)} style={{ width: '18%' }} />
          <Column
            field="place_of_origin"
            header="Place Of Origin"
            body={(row: Artwork) => renderCellText(row.place_of_origin)}
            style={{ width: '15%' }}
          />
          <Column
            field="artist_display"
            header="Artist Display"
            body={(row: Artwork) => renderCellText(row.artist_display)}
            style={{ width: '20%' }}
          />
          <Column
            field="inscriptions"
            header="Inscriptions"
            body={(row: Artwork) => renderCellText(row.inscriptions)}
            style={{ width: '22%' }}
          />
          <Column
            field="date_start"
            header="Date Start"
            body={(row: Artwork) => renderCellText(row.date_start)}
            style={{ width: '12%' }}
          />
          <Column 
            field="date_end" 
            header="Date End" 
            body={(row: Artwork) => renderCellText(row.date_end)} 
            style={{ width: '13%' }}
          />
        </DataTable>

        <OverlayPanel ref={overlayRef} className="select-n-overlay">
          <div className="flex w-72 sm:w-80 flex-col gap-2 sm:gap-3">
            <label htmlFor="select-n-input" className="text-sm font-semibold text-slate-800">
              Select Multiple Rows
            </label>
            <p className="text-xs text-slate-500">Enter number of rows to select across all pages</p>
            <div className="flex flex-col xs:flex-row xs:items-center gap-2">
              <input
                id="select-n-input"
                type="number"
                min={0}
                max={totalRecords}
                value={selectCountInput}
                onChange={(event) => setSelectCountInput(event.target.value)}
                placeholder="e.g., 20"
                className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm font-mono tabular-nums outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button type="button" className="select-n-btn" onClick={handleSelectN}>
                <FiCheck size={14} />
                <span>Select</span>
              </button>
            </div>
          </div>
        </OverlayPanel>
      </section>
    </main>
  )
}

export default App
