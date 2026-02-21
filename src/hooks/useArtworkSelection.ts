import { useCallback, useState } from 'react'
import type { Artwork } from '../types/artwork'

interface UseArtworkSelectionResult {
  selectedIds: Set<number>
  deselectedIds: Set<number>
  isSelectAllActive: boolean
  logicalTargetCount: number | null
  isSelected: (id: number) => boolean
  getPageSelection: (rows: Artwork[]) => Artwork[]
  updateSelectionForPage: (pageRows: Artwork[], selectedRows: Artwork[]) => void
  clearSelection: () => void
  selectNRowsLogically: (
    count: number,
    totalRecords: number,
    currentPage: number,
    pageSize: number,
    pageRows: Artwork[],
  ) => number
  syncLogicalTargetOnPage: (
    targetCount: number,
    currentPage: number,
    pageSize: number,
    pageRows: Artwork[],
  ) => void
  getSelectedCount: (totalRecords: number) => number
}

const clampCount = (count: number, totalRecords: number): number => {
  if (!Number.isFinite(count)) {
    return 0
  }

  const normalized = Math.floor(count)

  return Math.max(0, Math.min(normalized, totalRecords))
}

export const useArtworkSelection = (): UseArtworkSelectionResult => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set())
  const [isSelectAllActive, setIsSelectAllActive] = useState(false)
  const [logicalTargetCount, setLogicalTargetCount] = useState<number | null>(null)

  const isSelected = useCallback(
    (id: number): boolean => (isSelectAllActive ? !deselectedIds.has(id) : selectedIds.has(id)),
    [deselectedIds, isSelectAllActive, selectedIds],
  )

  const getPageSelection = useCallback(
    (rows: Artwork[]): Artwork[] => rows.filter((row) => isSelected(row.id)),
    [isSelected],
  )

  const updateSelectionForPage = useCallback(
    (pageRows: Artwork[], selectedRows: Artwork[]) => {
      const pageIds = new Set(pageRows.map((row) => row.id))
      const selectedOnPageIds = new Set(selectedRows.map((row) => row.id))

      setLogicalTargetCount(null)

      if (isSelectAllActive) {
        setDeselectedIds((previous) => {
          const next = new Set(previous)

          pageIds.forEach((id) => {
            if (selectedOnPageIds.has(id)) {
              next.delete(id)
            } else {
              next.add(id)
            }
          })

          return next
        })

        return
      }

      setSelectedIds((previous) => {
        const next = new Set(previous)

        pageIds.forEach((id) => {
          if (selectedOnPageIds.has(id)) {
            next.add(id)
          } else {
            next.delete(id)
          }
        })

        return next
      })
    },
    [isSelectAllActive],
  )

  const clearSelection = useCallback(() => {
    setIsSelectAllActive(false)
    setSelectedIds(new Set())
    setDeselectedIds(new Set())
    setLogicalTargetCount(null)
  }, [])

  const syncLogicalTargetOnPage = useCallback(
    (targetCount: number, currentPage: number, pageSize: number, pageRows: Artwork[]) => {
      setDeselectedIds((previous) => {
        const next = new Set(previous)
        const startIndex = (currentPage - 1) * pageSize + 1

        pageRows.forEach((row, index) => {
          const absolutePosition = startIndex + index

          if (absolutePosition <= targetCount) {
            next.delete(row.id)
          } else {
            next.add(row.id)
          }
        })

        return next
      })
    },
    [],
  )

  const selectNRowsLogically = useCallback(
    (
      count: number,
      totalRecords: number,
      currentPage: number,
      pageSize: number,
      pageRows: Artwork[],
    ): number => {
      const targetCount = clampCount(count, totalRecords)

      if (targetCount === 0) {
        clearSelection()
        return 0
      }

      if (targetCount === totalRecords) {
        setIsSelectAllActive(true)
        setSelectedIds(new Set())
        setDeselectedIds(new Set())
        setLogicalTargetCount(null)
        return targetCount
      }

      setIsSelectAllActive(true)
      setSelectedIds(new Set())
      setDeselectedIds(new Set())
      setLogicalTargetCount(targetCount)
      syncLogicalTargetOnPage(targetCount, currentPage, pageSize, pageRows)

      return targetCount
    },
    [clearSelection, syncLogicalTargetOnPage],
  )

  const getSelectedCount = useCallback(
    (totalRecords: number): number => {
      if (logicalTargetCount !== null) {
        return logicalTargetCount
      }

      if (isSelectAllActive) {
        return Math.max(0, totalRecords - deselectedIds.size)
      }

      return selectedIds.size
    },
    [deselectedIds.size, isSelectAllActive, logicalTargetCount, selectedIds.size],
  )

  return {
    selectedIds,
    deselectedIds,
    isSelectAllActive,
    logicalTargetCount,
    isSelected,
    getPageSelection,
    updateSelectionForPage,
    clearSelection,
    selectNRowsLogically,
    syncLogicalTargetOnPage,
    getSelectedCount,
  }
}
