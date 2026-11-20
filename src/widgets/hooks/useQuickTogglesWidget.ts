import { useCallback, useEffect, useRef, useState } from 'react'
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
  const latestIntendedRef = useRef<Map<string, boolean>>(new Map())
  const desiredMapRef = useRef<Map<string, boolean>>(new Map())
  const lastSentMapRef = useRef<Map<string, boolean>>(new Map())
  const inFlightMapRef = useRef<Map<string, Promise<void>>>(new Map())

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
      const currentOn = latestIntendedRef.current.has(device.id)
        ? latestIntendedRef.current.get(device.id)!
        : isOnState(device.state)
      const targetOn = !currentOn

      latestIntendedRef.current.set(device.id, targetOn)
      desiredMapRef.current.set(device.id, targetOn)

      // Optimistic update: flip state immediately on every click
      setRows((prev) =>
        prev.map((row) =>
          row.id === device.id ? { ...row, state: targetOn ? 'on' : 'off', pending: true } : row
        )
      )

      const existing = inFlightMapRef.current.get(device.id)
      if (existing) {
        return existing
      }

      const runner = (async () => {
        try {
          while (desiredMapRef.current.has(device.id)) {
            const desiredOn = desiredMapRef.current.get(device.id)!
            desiredMapRef.current.delete(device.id)

            if (lastSentMapRef.current.get(device.id) === desiredOn) {
              continue
            }

            try {
              // Explicitly set 'on' or 'off' so the action is never inverted by latency or stale state
              await setWidgetDeviceState(device.id, desiredOn)
              lastSentMapRef.current.set(device.id, desiredOn)
            } catch {
              if (!desiredMapRef.current.has(device.id)) {
                const rollbackOn = lastSentMapRef.current.has(device.id)
                  ? lastSentMapRef.current.get(device.id)!
                  : !desiredOn
                latestIntendedRef.current.set(device.id, rollbackOn)
                setRows((prev) =>
                  prev.map((row) =>
                    row.id === device.id
                      ? { ...row, state: rollbackOn ? 'on' : 'off', pending: false }
                      : row
                  )
                )
              }
            }
          }
        } finally {
          inFlightMapRef.current.delete(device.id)
          lastSentMapRef.current.delete(device.id)
          latestIntendedRef.current.delete(device.id)
          setRows((prev) =>
            prev.map((row) => (row.id === device.id ? { ...row, pending: false } : row))
          )
        }
      })()

      inFlightMapRef.current.set(device.id, runner)
      return runner
    },
    []
  )

  return { loading, error, rows, refresh, toggle }
}
