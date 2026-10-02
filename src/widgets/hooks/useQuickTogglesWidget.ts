import { useCallback, useEffect, useState } from 'react'
import sdk from 'momai:sdk'
import { isOnState } from './useStatusWidget'
import {
  fetchWidgetDevices,
  setWidgetDeviceState,
  type WidgetDevice
} from '../services/deviceApi'

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

  // Real-time synchronization when devices change in Home Assistant
  useEffect(() => {
    if (isEditing) return
    try {
      if (typeof sdk !== 'undefined' && sdk?.events?.subscribe) {
        const unsub = sdk.events.subscribe('state_changed', (evt: any) => {
          const entityId = evt?.entityId || evt?.device?.id
          if (!entityId) return
          const newState = String(evt?.deviceState ?? evt?.device?.state?.rawState ?? evt?.device?.state ?? '')
          setRows((prev) =>
            prev.map((row) =>
              row.id === entityId
                ? { ...row, state: newState || (isOnState(newState) ? 'on' : 'off'), pending: false }
                : row
            )
          )
        })
        return unsub
      }
    } catch {}
  }, [isEditing])

  const toggle = useCallback(
    async (device: ToggleRow): Promise<void> => {
      const currentOn = isOnState(device.state)
      const targetOn = !currentOn

      // Optimistic update: flip state immediately
      setRows((prev) =>
        prev.map((row) =>
          row.id === device.id ? { ...row, state: targetOn ? 'on' : 'off', pending: true } : row
        )
      )

      try {
        // Explicitly set 'on' or 'off' so the action is never inverted by latency or stale state
        await setWidgetDeviceState(device.id, targetOn)
        setRows((prev) =>
          prev.map((row) => (row.id === device.id ? { ...row, pending: false } : row))
        )
        setTimeout(() => {
          void refresh()
        }, 600)
      } catch {
        // Revert to previous state on error
        setRows((prev) =>
          prev.map((row) =>
            row.id === device.id ? { ...row, state: currentOn ? 'on' : 'off', pending: false } : row
          )
        )
      }
    },
    [refresh]
  )

  return { loading, error, rows, refresh, toggle }
}
