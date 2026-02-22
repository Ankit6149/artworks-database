import type { Artwork } from '../../types/artwork'

export interface SelectionState {
  selectedIds: Set<number>
  deselectedIds: Set<number>
  isSelectAllActive: boolean
  logicalTargetCount: number | null
}

export interface UseArtworkSelectionResult {
  selectedIds: Set<number>
  deselectedIds: Set<number>
  isSelectAllActive: boolean
  logicalTargetCount: number | null
  getPageSelection: (rows: Artwork[], currentPage: number, pageSize: number) => Artwork[]
  updateSelectionForPage: (
    pageRows: Artwork[],
    selectedRows: Artwork[],
    currentPage: number,
    pageSize: number,
  ) => void
  clearSelection: () => void
  selectNRowsLogically: (count: number, totalRecords: number) => number
  getSelectedCount: (totalRecords: number) => number
}
