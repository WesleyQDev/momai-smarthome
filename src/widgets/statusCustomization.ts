export interface StatusConfig {
  onlyOn?: boolean
  limit?: number | string
}

export const DEFAULT_STATUS_LIMIT = 5

export const STATUS_LIMIT_CHOICES = ['3', '5', '8']

export function resolveStatusLimit(config?: Record<string, unknown> | null): number {
  const raw = (config as StatusConfig | undefined)?.limit
  const parsed = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_STATUS_LIMIT
  return Math.floor(parsed)
}

export function isStatusConfigCustomized(config?: Record<string, unknown> | null): boolean {
  const current = config as StatusConfig | undefined
  if (current?.onlyOn === true) return true
  const raw = current?.limit
  if (raw === undefined || raw === null || raw === '') return false
  return Number(raw) !== DEFAULT_STATUS_LIMIT
}
