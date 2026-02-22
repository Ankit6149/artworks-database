import { useCallback, useState } from 'react'
import type { Artwork } from '../types/artwork'
import type { UseArtworkSelectionResult } from './artworkSelection/types'
import { clampCount } from './artworkSelection/utils'
import {
  getPageSelectionForState,
  getSelectedCountForState,
  updateDeselectedForSelectAllMode,
  updateLogicalSelectionForPage,
  updateSelectedForExplicitMode,
} from './artworkSelection/selectionLogic'

export function useArtworkSelection(): UseArtworkSelectionResult {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set())
  const [isSelectAllActive, setIsSelectAllActive] = useState(false)
  const [logicalTargetCount, setLogicalTargetCount] = useState<number | null>(null)

  const getPageSelection = useCallback(
    function getPageSelectionCallback(rows: Artwork[], currentPage: number, pageSize: number): Artwork[] {
      return getPageSelectionForState(
        rows,
        { selectedIds, deselectedIds, isSelectAllActive, logicalTargetCount },
        { currentPage, pageSize },
      )
    },
    [deselectedIds, isSelectAllActive, logicalTargetCount, selectedIds],
  )

  const updateSelectionForPage = useCallback(
    function updateSelectionForPageCallback(
      pageRows: Artwork[],
      selectedRows: Artwork[],
      currentPage: number,
      pageSize: number,
    ) {
      if (logicalTargetCount !== null) {
        const { nextSelected, nextDeselected } = updateLogicalSelectionForPage({
          pageRows,
          selectedRows,
          currentPage,
          pageSize,
          logicalTargetCount,
          selectedIds,
          deselectedIds,
        })

        setSelectedIds(nextSelected)
        setDeselectedIds(nextDeselected)
        return
      }

      setLogicalTargetCount(null)

      if (isSelectAllActive) {
        setDeselectedIds((previous) => {
          return updateDeselectedForSelectAllMode(pageRows, selectedRows, previous)
        })

        return
      }

      setSelectedIds((previous) => {
        return updateSelectedForExplicitMode(pageRows, selectedRows, previous)
      })
    },
    [deselectedIds, isSelectAllActive, logicalTargetCount, selectedIds],
  )

  const clearSelection = useCallback(function clearSelectionCallback() {
    setIsSelectAllActive(false)
    setSelectedIds(new Set())
    setDeselectedIds(new Set())
    setLogicalTargetCount(null)
  }, [])

  const selectNRowsLogically = useCallback(
    function selectNRowsLogicallyCallback(count: number, totalRecords: number): number {
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
    function getSelectedCountCallback(totalRecords: number): number {
      return getSelectedCountForState(totalRecords, {
        selectedIds,
        deselectedIds,
        isSelectAllActive,
        logicalTargetCount,
      })
    },
    [deselectedIds, isSelectAllActive, logicalTargetCount, selectedIds],
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
