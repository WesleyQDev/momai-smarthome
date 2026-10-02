import { useEffect, useState } from 'react'
import sdk from 'momai:sdk'
import { fetchWidgetDevices, type WidgetDevice } from '../services/deviceApi'

interface StatusState {
  loading: boolean
  error: string
  devices: WidgetDevice[]
}

export function isOnState(state: string): boolean {
  const s = (state || '').toLowerCase().trim()
  return ['on', 'open', 'playing', 'unlocked', 'ativo', 'ligado', 'home', 'above_horizon', 'cool', 'heat', 'auto'].includes(s)
}

export function useStatusWidget(isEditing: boolean): StatusState {
  const [state, setState] = useState<StatusState>({ loading: true, error: '', devices: [] })

  useEffect(() => {
    if (isEditing) {
      setState((prev) => ({ ...prev, loading: false }))
      return
    }
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const devices = await fetchWidgetDevices()
        if (!cancelled) setState({ loading: false, error: '', devices })
      } catch (err) {
        if (!cancelled) {
          setState({ loading: false, error: err instanceof Error ? err.message : 'Load failed.', devices: [] })
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [isEditing])

  // Real-time synchronization when devices change in Home Assistant
  useEffect(() => {
    if (isEditing) return
    try {
      if (typeof sdk !== 'undefined' && sdk?.events?.subscribe) {
        const unsub = sdk.events.subscribe('state_changed', (evt: any) => {
          const entityId = evt?.entityId || evt?.device?.id
          if (!entityId) return
          const newState = String(evt?.deviceState ?? evt?.device?.state?.rawState ?? evt?.device?.state ?? '')
          setState((prev) => ({
            ...prev,
            devices: prev.devices.map((d) =>
              d.id === entityId ? { ...d, state: newState || d.state } : d
            )
          }))
        })
        return unsub
      }
    } catch {}
  }, [isEditing])

  return state
}
