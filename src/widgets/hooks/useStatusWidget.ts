import { useEffect, useState } from 'react'
import { fetchWidgetDevices, type WidgetDevice } from '../services/deviceApi'

interface StatusState {
  loading: boolean
  error: string
  devices: WidgetDevice[]
}

export function isOnState(state: string): boolean {
  return ['on', 'open', 'playing', 'unlocked'].includes(state.toLowerCase())
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

  return state
}
