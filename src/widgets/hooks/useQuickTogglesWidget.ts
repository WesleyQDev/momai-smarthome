import { useCallback, useEffect, useState } from 'react'
import { fetchWidgetDevices, toggleWidgetDevice, type WidgetDevice } from '../services/deviceApi'

export interface QuickTogglesConfig {
  entityIds?: string[]
}

interface ToggleRow extends WidgetDevice {
  pending: boolean
}

interface TogglesState {
  loading: boolean
  error: string
  rows: ToggleRow[]
  refresh: () => Promise<void>
  toggle: (device: ToggleRow) => Promise<void>
}

export function useQuickTogglesWidget(isEditing: boolean, entityIds: string[]): TogglesState {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<ToggleRow[]>([])
  const key = entityIds.join('|')

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError('')
    try {
      const devices = await fetchWidgetDevices()
      const selected = devices
        .filter((device) => key === '' || entityIds.includes(device.id))
        .slice(0, 6)
        .map((device) => ({ ...device, pending: false }))
      setRows(selected)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (isEditing) {
      setLoading(false)
      return
    }
    void refresh()
  }, [isEditing, refresh])

  const toggle = useCallback(
    async (device: ToggleRow): Promise<void> => {
      setRows((prev) => prev.map((row) => (row.id === device.id ? { ...row, pending: true } : row)))
      try {
        await toggleWidgetDevice(device.id)
        await refresh()
      } catch {
        setRows((prev) => prev.map((row) => (row.id === device.id ? { ...row, pending: false } : row)))
      }
    },
    [refresh]
  )

  return { loading, error, rows, refresh, toggle }
}
