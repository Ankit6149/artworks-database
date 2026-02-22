export function clampCount(count: number, totalRecords: number): number {
  if (!Number.isFinite(count)) {
    return 0
  }

  const normalized = Math.floor(count)

  return Math.max(0, Math.min(normalized, totalRecords))
}

export function getAbsolutePosition(currentPage: number, pageSize: number, rowIndex: number): number {
  return (currentPage - 1) * pageSize + rowIndex + 1
}

export function createIdSet(ids: number[]): Set<number> {
  return new Set(ids)
}
