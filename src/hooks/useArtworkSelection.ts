import { useCallback, useState } from 'react'
import type { Artwork } from '../types/artwork'

interface UseArtworkSelectionResult {
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

const clampCount = (count: number, totalRecords: number): number => {
  if (!Number.isFinite(count)) {
    return 0
  }

  const normalized = Math.floor(count)

  return Math.max(0, Math.min(normalized, totalRecords))
}

const getAbsolutePosition = (currentPage: number, pageSize: number, rowIndex: number): number =>
  (currentPage - 1) * pageSize + rowIndex + 1

export const useArtworkSelection = (): UseArtworkSelectionResult => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set())
  const [isSelectAllActive, setIsSelectAllActive] = useState(false)
  const [logicalTargetCount, setLogicalTargetCount] = useState<number | null>(null)

  const getPageSelection = useCallback(
    (rows: Artwork[], currentPage: number, pageSize: number): Artwork[] =>
      rows.filter((row, index) => {
        if (logicalTargetCount !== null) {
          const absolutePosition = getAbsolutePosition(currentPage, pageSize, index)
          const isInsideLogicalTarget = absolutePosition <= logicalTargetCount

          if (isInsideLogicalTarget) {
            return !deselectedIds.has(row.id)
          }

          return selectedIds.has(row.id)
        }

        if (isSelectAllActive) {
          return !deselectedIds.has(row.id)
        }

        return selectedIds.has(row.id)
      }),
    [deselectedIds, isSelectAllActive, logicalTargetCount, selectedIds],
  )

  const updateSelectionForPage = useCallback(
    (pageRows: Artwork[], selectedRows: Artwork[], currentPage: number, pageSize: number) => {
      const pageIds = new Set(pageRows.map((row) => row.id))
      const selectedOnPageIds = new Set(selectedRows.map((row) => row.id))

      if (logicalTargetCount !== null) {
        const nextSelected = new Set(selectedIds)
        const nextDeselected = new Set(deselectedIds)

        pageRows.forEach((row, index) => {
          const absolutePosition = getAbsolutePosition(currentPage, pageSize, index)
          const isInsideLogicalTarget = absolutePosition <= logicalTargetCount
          const isSelectedNow = selectedOnPageIds.has(row.id)

          if (isInsideLogicalTarget) {
            if (isSelectedNow) {
              nextDeselected.delete(row.id)
            } else {
              nextDeselected.add(row.id)
            }
            nextSelected.delete(row.id)
            return
          }

          if (isSelectedNow) {
            nextSelected.add(row.id)
          } else {
            nextSelected.delete(row.id)
          }
          nextDeselected.delete(row.id)
        })

        setSelectedIds(nextSelected)
        setDeselectedIds(nextDeselected)
        return
      }

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
    [deselectedIds, isSelectAllActive, logicalTargetCount, selectedIds],
  )

  const clearSelection = useCallback(() => {
    setIsSelectAllActive(false)
    setSelectedIds(new Set())
    setDeselectedIds(new Set())
    setLogicalTargetCount(null)
  }, [])

  const selectNRowsLogically = useCallback(
    (count: number, totalRecords: number): number => {
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

      return targetCount
    },
    [clearSelection],
  )

  const getSelectedCount = useCallback(
    (totalRecords: number): number => {
      if (logicalTargetCount !== null) {
        return clampCount(logicalTargetCount + selectedIds.size - deselectedIds.size, totalRecords)
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
    getPageSelection,
    updateSelectionForPage,
    clearSelection,
    selectNRowsLogically,
    getSelectedCount,
  }
}
