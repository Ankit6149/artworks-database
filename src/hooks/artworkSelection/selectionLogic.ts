import type { Artwork } from '../../types/artwork'
import type { SelectionState } from './types'
import { clampCount, createIdSet, getAbsolutePosition } from './utils'

interface PageSelectionContext {
  currentPage: number
  pageSize: number
}

export function getPageSelectionForState(
  rows: Artwork[],
  state: SelectionState,
  context: PageSelectionContext,
): Artwork[] {
  const { selectedIds, deselectedIds, isSelectAllActive, logicalTargetCount } = state
  const { currentPage, pageSize } = context

  return rows.filter(function filterSelectedRows(row, index) {
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
  })
}

interface LogicalSelectionUpdateInput {
  pageRows: Artwork[]
  selectedRows: Artwork[]
  currentPage: number
  pageSize: number
  logicalTargetCount: number
  selectedIds: Set<number>
  deselectedIds: Set<number>
}

interface LogicalSelectionUpdateOutput {
  nextSelected: Set<number>
  nextDeselected: Set<number>
}

export function updateLogicalSelectionForPage(
  input: LogicalSelectionUpdateInput,
): LogicalSelectionUpdateOutput {
  const {
    pageRows,
    selectedRows,
    currentPage,
    pageSize,
    logicalTargetCount,
    selectedIds,
    deselectedIds,
  } = input

  const selectedOnPageIds = createIdSet(selectedRows.map(function mapSelectedRows(row) {
    return row.id
  }))
  const nextSelected = new Set(selectedIds)
  const nextDeselected = new Set(deselectedIds)

  pageRows.forEach(function forEachPageRow(row, index) {
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

  return {
    nextSelected,
    nextDeselected,
  }
}

export function updateDeselectedForSelectAllMode(
  pageRows: Artwork[],
  selectedRows: Artwork[],
  previousDeselected: Set<number>,
): Set<number> {
  const pageIds = createIdSet(
    pageRows.map(function mapPageRows(row) {
      return row.id
    }),
  )
  const selectedOnPageIds = createIdSet(
    selectedRows.map(function mapSelectedRows(row) {
      return row.id
    }),
  )
  const next = new Set(previousDeselected)

  pageIds.forEach(function forEachPageId(id) {
    if (selectedOnPageIds.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
  })

  return next
}

export function updateSelectedForExplicitMode(
  pageRows: Artwork[],
  selectedRows: Artwork[],
  previousSelected: Set<number>,
): Set<number> {
  const pageIds = createIdSet(
    pageRows.map(function mapPageRows(row) {
      return row.id
    }),
  )
  const selectedOnPageIds = createIdSet(
    selectedRows.map(function mapSelectedRows(row) {
      return row.id
    }),
  )
  const next = new Set(previousSelected)

  pageIds.forEach(function forEachPageId(id) {
    if (selectedOnPageIds.has(id)) {
      next.add(id)
    } else {
      next.delete(id)
    }
  })

  return next
}

export function getSelectedCountForState(totalRecords: number, state: SelectionState): number {
  const { logicalTargetCount, selectedIds, deselectedIds, isSelectAllActive } = state

  if (logicalTargetCount !== null) {
    return clampCount(logicalTargetCount + selectedIds.size - deselectedIds.size, totalRecords)
  }

  if (isSelectAllActive) {
    return Math.max(0, totalRecords - deselectedIds.size)
  }

  return selectedIds.size
}
