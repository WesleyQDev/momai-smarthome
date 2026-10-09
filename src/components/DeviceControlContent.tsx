import React, { useState, useRef } from 'react'
import { useSmartHomeI18n } from '../i18n'
import { extFetch } from '../shared/hostApi'
import {
  CONTROLLABLE_DOMAINS,
  DOMAIN_KEYS,
  getDomainLabel,
  type Device,
  type EntityAttributes,
  type EntityState
} from '../shared/device'
import {
  SvgPower,
  SvgSun,
  SvgColorWheel,
  SvgTemp,
  SvgPlay,
  SvgPause,
  SvgPrev,
  SvgNext,
  SvgMute,
  SvgMuteStrikethrough,
  SvgVolDown,
  SvgVolUp,
  SvgHome,
  SvgBack,
  SvgTv,
  SvgYoutube,
  getDomainSvgIcon,
  getDynamicSvgIcon
} from './SvgIcons'

export type { Device, EntityAttributes, EntityState } from '../shared/device'
export { CONTROLLABLE_DOMAINS } from '../shared/device'

function volumeToPercent(volume: number | null | undefined): number {
  if (volume === null || volume === undefined || !Number.isFinite(volume)) return 0
  return Math.max(0, Math.min(100, Math.round(volume * 100)))
}

// Minimum interval between color commands sent to Home Assistant while the
// user drags the color wheel.
const COLOR_THROTTLE_MS = 200
// Minimum interval between brightness/temperature commands while dragging.
const SLIDER_THROTTLE_MS = 120

/**
 * Throttles a send function to one call per interval, always delivering the
 * last value (trailing edge). Used by the drag sliders and the color wheel so
 * dragging does not flood Home Assistant with requests.
 */
function useThrottledSend<T>(intervalMs: number, send: (value: T) => void) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = React.useRef<T | null>(null)
  const lastSentAtRef = React.useRef(0)
  const sendRef = React.useRef(send)

  React.useEffect(() => {
    sendRef.current = send
  })

  const flush = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (pendingRef.current !== null) {
      const value = pendingRef.current
      pendingRef.current = null
      lastSentAtRef.current = Date.now()
      sendRef.current(value)
    }
  }, [])

  const schedule = React.useCallback(
    (value: T) => {
      pendingRef.current = value
      const elapsed = Date.now() - lastSentAtRef.current
      if (elapsed >= intervalMs) {
        flush()
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(flush, intervalMs - elapsed)
      }
    },
    [intervalMs, flush]
  )

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  return { schedule, flush }
}

// Re-export Svg components for backward compatibility
export {
  SvgPower,
  SvgSun,
  SvgColorWheel,
  SvgTemp,
  SvgPlay,
  SvgPause,
  SvgPrev,
  SvgNext,
  SvgMute,
  SvgMuteStrikethrough,
  SvgVolDown,
  SvgVolUp,
  SvgHome,
  SvgBack,
  SvgTv,
  SvgYoutube
}

export const DOMAIN_ICONS: Record<string, string> = {
  light: 'light',
  switch: 'switch',
  fan: 'fan',
  cover: 'cover',
  lock: 'lock',
  climate: 'climate',
  sensor: 'sensor',
  binary_sensor: 'binary_sensor',
  media_player: 'media_player',
  camera: 'camera',
  vacuum: 'vacuum',
  scene: 'scene',
  automation: 'automation',
  alarm_control_panel: 'alarm_control_panel',
  sun: 'sun',
  weather: 'weather',
  remote: 'remote'
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    r = hue2rgb(h / 360 + 1 / 3)
    g = hue2rgb(h / 360)
    b = hue2rgb(h / 360 - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getDynamicIcon(device: Device): React.ReactElement {
  return getDynamicSvgIcon(device, 20)
}

export function ColorWheelPicker({ selectedHex, onChange, onCommit }: { selectedHex: string; onChange: (rgb: [number, number, number], hex: string) => void; onCommit?: () => void }) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const [handlePos, setHandlePos] = useState<{ x: number; y: number }>({ x: 170, y: 170 })

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wheelRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY

    const radius = rect.width / 2
    const dist = Math.min(radius - 12, Math.sqrt(x * x + y * y))

    const angle = Math.atan2(x, -y)
    const posX = centerX + dist * Math.sin(angle)
    const posY = centerY - dist * Math.cos(angle)
    setHandlePos({ x: posX, y: posY })

    let hue = (angle * (180 / Math.PI) + 360) % 360
    let sat = dist / (radius - 12)
    const rgb = hslToRgb(hue, sat, 0.5)
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2])
    onChange(rgb, hex)
  }

  return (
    <div
      ref={wheelRef}
      className="sh-color-wheel"
      style={{ WebkitAppRegion: 'no-drag' } as any}
      onPointerDown={handlePointer}
      onPointerMove={(e) => { if (e.buttons === 1) handlePointer(e) }}
      onPointerUp={onCommit}
    >
      <div className="sh-color-wheel-handle" style={{ left: `${handlePos.x}px`, top: `${handlePos.y}px` }} />
    </div>
  )
}

export function DeviceControlCardContent({
  device,
  allDevices = [],
  onClose,
  onToggle,
  callServiceApi,
  isOverlay = false
}: {
  device: Device
  allDevices?: Device[]
  onClose: () => void
  onToggle?: (d: Device) => void
  callServiceApi?: (domain: string, service: string, data?: any, providerType?: string) => Promise<any>
  isOverlay?: boolean
}) {
  const { t } = useSmartHomeI18n()
  const [currentDevice, setCurrentDevice] = useState<Device>(device)
  const isUserInteractingRef = React.useRef(false)
  // Refs espelhados dos estados de controle, atualizados a cada render, para o
  // handler do SSE comparar com os valores MAIS RECENTES (e não com a closure
  // stale da primeira render — que deixava isUserInteractingRef travado em
  // true para sempre e congelava o feedback visual do card).
  const brightnessRef = React.useRef<number>(currentDevice.state?.brightness ?? 94)
  const isOnRef = React.useRef<boolean>(Boolean(currentDevice.state?.on))
  const tempPctRef = React.useRef<number>(85)
  const selectedRgbHexRef = React.useRef<string>('#f97316')
  // Debounce para nunca deixar isUserInteractingRef travado: se o SSE não
  // confirmar (HA sem SSE, valor fora da tolerância, etc.), o flag é resetado
  // pouco depois da última interação, permitindo que o estado volte a ser
  // sincronizado em vez de congelar o card até o fechamento.
  const interactionResetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  // Pointer-drag state for the vertical brightness/temperature sliders.
  const brightnessDraggingRef = React.useRef(false)
  const tempDraggingRef = React.useRef(false)

  React.useEffect(() => {
    // When user is interacting (slider drag, toggle click), don't override
    // the local state with the prop — the SSE update will arrive later.
    if (!isUserInteractingRef.current) {
      setCurrentDevice(device)
    }
  }, [device])

  const effectiveAllDevices = React.useMemo(() => {
    const list = [...(allDevices || [])]
    const rels = (currentDevice.attributes?.relatedEntities as Device[]) || (device.attributes?.relatedEntities as Device[]) || []
    for (const r of rels) {
      if (r && r.id && !list.some((d) => d.id === r.id)) {
        list.push(r)
      }
    }
    return list
  }, [allDevices, currentDevice, device])

  const volumeDevice = currentDevice.domain === 'media_player'
    ? currentDevice
    : (effectiveAllDevices.find((candidate) => candidate.domain === 'media_player' && (candidate.name.toLowerCase().trim() === currentDevice.name.toLowerCase().trim() || candidate.id === currentDevice.id)) || currentDevice)
  // Media services only accept media_player entities. Remote-only devices (and
  // cards whose volume device is a different entity) resolve the matching
  // media player; otherwise keep the device itself so working setups do not
  // change behavior.
  const mediaTargetId = currentDevice.domain === 'media_player'
    ? currentDevice.id
    : (effectiveAllDevices.find((candidate) => candidate.domain === 'media_player' && (candidate.name.toLowerCase().trim() === currentDevice.name.toLowerCase().trim() || candidate.id === currentDevice.id))?.id
      || effectiveAllDevices.find((candidate) => candidate.domain === 'media_player')?.id
      || currentDevice.id)
  const [brightness, setBrightnessState] = useState<number>(currentDevice.state?.brightness ?? 94)
  const [tempPct, setTempPctState] = useState<number>(85)
  const [activeTab, setActiveTab] = useState<'brightness' | 'color' | 'temp'>('brightness')
  const [selectedRgbHex, setSelectedRgbHex] = useState<string>('#f97316')

  const [isOn, setIsOn] = useState<boolean>(Boolean(currentDevice.state?.on))
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [showInputSelector, setShowInputSelector] = useState<boolean>(false)
  const initialVolumePercent = volumeToPercent(volumeDevice.state?.volume)
  const [volumePercent, setVolumePercent] = useState<number>(initialVolumePercent)
  const volumePercentRef = useRef(initialVolumePercent)
  const [activeVolumeButton, setActiveVolumeButton] = useState<'down' | 'up' | null>(null)
  const volumeFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    // Only sync local state from device prop when user is NOT actively
    // interacting with controls. This prevents SSE-pushed updates from
    // overwriting the user's in-progress slider drag or toggle.
    if (isUserInteractingRef.current) return
    if (currentDevice.state?.on !== undefined) {
      setIsOn(Boolean(currentDevice.state.on))
      isOnRef.current = Boolean(currentDevice.state.on)
    }
    if (currentDevice.state?.brightness != null) {
      setBrightnessState(currentDevice.state.brightness)
      brightnessRef.current = currentDevice.state.brightness
    }
    if (currentDevice.state?.hexColor) {
      setSelectedRgbHex(currentDevice.state.hexColor)
      selectedRgbHexRef.current = currentDevice.state.hexColor
    } else if (Array.isArray(currentDevice.state?.rgbColor) && currentDevice.state.rgbColor.length === 3) {
      const rgb = currentDevice.state.rgbColor
      const hex = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`
      setSelectedRgbHex(hex)
      selectedRgbHexRef.current = hex
    }
    if (currentDevice.state?.colorTempKelvin) {
      const pct = Math.max(0, Math.min(100, Math.round(((6500 - currentDevice.state.colorTempKelvin) / (6500 - 2000)) * 100)))
      setTempPctState(pct)
      tempPctRef.current = pct
    }
    if (currentDevice.domain === 'media_player') {
      if (currentDevice.state?.isPlaying !== undefined) {
        setIsPlaying(currentDevice.state.isPlaying)
      } else if (currentDevice.state?.rawState) {
        setIsPlaying(currentDevice.state.rawState === 'playing')
      }
      if (currentDevice.state?.isMuted !== undefined) {
        setIsMuted(Boolean(currentDevice.state.isMuted))
      }
    }
  }, [currentDevice])

  React.useEffect(() => {
    if (volumeDevice.state?.volume === null || volumeDevice.state?.volume === undefined) return
    const nextVolumePercent = volumeToPercent(volumeDevice.state.volume)
    volumePercentRef.current = nextVolumePercent
    setVolumePercent(nextVolumePercent)
  }, [volumeDevice.state?.volume])

  React.useEffect(() => {
    let eventSource: EventSource | null = null

    try {
      const sseUrl = `${getApiBaseUrl()}/extensions/events`
      eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === 'extension_event' && payload.eventType === 'state_changed') {
            const updatedDevice: Device = payload.data?.device
            if (updatedDevice) {
              const isMatchCurrent = updatedDevice.id === currentDevice.id ||
                updatedDevice.name.toLowerCase().trim() === currentDevice.name.toLowerCase().trim()
              const isMatchVolume = updatedDevice.id === volumeDevice.id ||
                updatedDevice.name.toLowerCase().trim() === volumeDevice.name.toLowerCase().trim()

              if (isMatchCurrent) {
                // Don't overwrite device state from SSE while user is actively
                // interacting with controls — the local state is more current.
                if (!isUserInteractingRef.current) {
                  setCurrentDevice((prev) => ({
                    ...prev,
                    ...updatedDevice,
                    state: { ...prev.state, ...updatedDevice.state },
                    attributes: { ...prev.attributes, ...updatedDevice.attributes }
                  }))
                } else {
                  // User is interacting. Check if the SSE state matches the
                  // user's intended state — if so, the HA confirmed the change
                  // and we can stop blocking SSE updates. Compare against the
                  // refs (most recent values), not the stale closure.
                  const sseBrightness = updatedDevice.state?.brightness
                  const sseOn = updatedDevice.state?.on
                  let confirmed = false
                  if (sseBrightness != null && Math.abs(sseBrightness - brightnessRef.current) <= 1) {
                    confirmed = true
                  }
                  if (sseOn !== undefined && sseOn === isOnRef.current) {
                    confirmed = true
                  }
                  if (confirmed) {
                    isUserInteractingRef.current = false
                    if (interactionResetTimerRef.current) {
                      clearTimeout(interactionResetTimerRef.current)
                      interactionResetTimerRef.current = null
                    }
                  }
                }
              }
              if (isMatchVolume && updatedDevice.state?.volume !== undefined && updatedDevice.state.volume !== null) {
                const nextVol = volumeToPercent(updatedDevice.state.volume)
                setVolumePercent(nextVol)
                volumePercentRef.current = nextVol
              }
            }
          }
        } catch (err) {}
      }
    } catch (err) {}

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [currentDevice.id, currentDevice.name, volumeDevice.id, volumeDevice.name])

  React.useEffect(() => {
    return () => {
      if (volumeFeedbackTimerRef.current) {
        clearTimeout(volumeFeedbackTimerRef.current)
      }
      if (interactionResetTimerRef.current) {
        clearTimeout(interactionResetTimerRef.current)
        interactionResetTimerRef.current = null
      }
    }
  }, [])

  const COLOR_PRESETS = [
    { key: 'color.warmOrange', color: '#f97316', rgb: [249, 115, 22] },
    { key: 'color.softAmber', color: '#fed7aa', rgb: [254, 215, 170] },
    { key: 'color.warmWhite', color: '#fef3c7', rgb: [254, 243, 199] },
    { key: 'color.pureWhite', color: '#ffffff', rgb: [255, 255, 255] },
    { key: 'color.iceBlue', color: '#60a5fa', rgb: [96, 165, 250] },
    { key: 'color.softPurple', color: '#c084fc', rgb: [192, 132, 252] },
    { key: 'color.pastelPink', color: '#f472b6', rgb: [244, 114, 182] },
    { key: 'color.coralRed', color: '#f87171', rgb: [248, 113, 113] }
  ]

  async function defaultCallService(domain: string, service: string, data: any = {}, providerType = 'homeassistant') {
    return extFetch('/extensions/momai-smarthome/command', {
      toolName: 'callService',
      args: { domain, service, data, providerType }
    })
  }

  const executeService = async (domain: string, service: string, data: any) => {
    if (callServiceApi) {
      try {
        const res = await callServiceApi(domain, service, data, 'homeassistant')
        if (res !== undefined) return res
      } catch (err) {
        console.warn('[SmartHome] callServiceApi failed:', err)
      }
    }

    const winApi = (window as any).api
    if (typeof winApi?.callService === 'function') {
      try {
        return await winApi.callService(domain, service, data, 'homeassistant')
      } catch (err) {
        console.warn('[SmartHome] window.api.callService failed:', err)
      }
    }

    return defaultCallService(domain, service, data, 'homeassistant')
  }

  // Throttled senders for the drag controls: the sliders and the color wheel
  // fire on every pointer move, so the service call is coalesced and the last
  // value is always delivered on release.
  const brightnessThrottle = useThrottledSend<number>(SLIDER_THROTTLE_MS, (pct) => {
    executeService('light', 'turn_on', { entity_id: device.id, brightness_pct: pct }).catch(() => {
      isUserInteractingRef.current = false
    })
  })
  const tempThrottle = useThrottledSend<number>(SLIDER_THROTTLE_MS, (kelvin) => {
    executeService('light', 'turn_on', { entity_id: device.id, color_temp_kelvin: kelvin }).catch(() => {
      isUserInteractingRef.current = false
    })
  })
  const colorThrottle = useThrottledSend<[number, number, number]>(COLOR_THROTTLE_MS, (rgb) => {
    executeService('light', 'turn_on', { entity_id: device.id, rgb_color: rgb }).catch(() => {
      isUserInteractingRef.current = false
    })
  })

  React.useEffect(() => {
    if (device.domain !== 'remote' && device.domain !== 'media_player') return

    let disposed = false
    let syncing = false
    let consecutiveErrors = 0
    let backoffUntil = 0

    const syncVolumeFromHomeAssistant = async () => {
      // After repeated failures, back off for 30s instead of giving up for
      // good: a short network blip used to freeze the volume display until
      // the overlay was reopened.
      if (syncing || disposed || Date.now() < backoffUntil) return
      syncing = true
      try {
        const result = await extFetch(
          '/extensions/momai-smarthome/command',
          { toolName: 'getDeviceState', args: { deviceId: volumeDevice.id, providerType: 'homeassistant' } },
          4000
        )
        if (result?.ok === false) {
          consecutiveErrors++
          if (consecutiveErrors >= 2) backoffUntil = Date.now() + 30000
          return
        }
        consecutiveErrors = 0
        backoffUntil = 0
        const refreshedDevice = result?.device as Device | null
        if (disposed || refreshedDevice?.state?.volume == null) {
          return
        }

        const nextVolumePercent = volumeToPercent(refreshedDevice.state.volume)
        volumePercentRef.current = nextVolumePercent
        setVolumePercent(nextVolumePercent)
      } catch {
        consecutiveErrors++
        if (consecutiveErrors >= 2) backoffUntil = Date.now() + 30000
      } finally {
        syncing = false
      }
    }

    void syncVolumeFromHomeAssistant()
    const intervalId = window.setInterval(syncVolumeFromHomeAssistant, 5000)
    return () => {
      disposed = true
      window.clearInterval(intervalId)
    }
  }, [device.domain, volumeDevice.id, volumeDevice.name])

  // Marca o início de uma interação do usuário e agenda um reset de segurança:
  // se o SSE de confirmação não chegar (HA sem WebSocket/SSE, valor fora da
  // tolerância, etc.), o flag volta a false pouco depois, desbloqueando o
  // sync de estado — sem isso o card ficava congelado até ser fechado.
  const beginUserInteraction = () => {
    isUserInteractingRef.current = true
    if (interactionResetTimerRef.current) {
      clearTimeout(interactionResetTimerRef.current)
    }
    interactionResetTimerRef.current = setTimeout(() => {
      isUserInteractingRef.current = false
      interactionResetTimerRef.current = null
    }, 800)
  }

  const handleBrightnessChange = (pct: number) => {
    beginUserInteraction()
    setBrightnessState(pct)
    brightnessRef.current = pct
    if (pct > 0 && !isOn) setIsOn(true)
    if (pct === 0 && isOn) setIsOn(false)
    brightnessThrottle.schedule(pct)
  }

  const handleTempSliderChange = (pct: number) => {
    beginUserInteraction()
    setTempPctState(pct)
    tempPctRef.current = pct
    if (!isOn) setIsOn(true)
    tempThrottle.schedule(Math.round(6500 - (pct / 100) * (6500 - 2000)))
  }

  const handleColorChange = (rgb: [number, number, number], hex: string) => {
    beginUserInteraction()
    setSelectedRgbHex(hex)
    selectedRgbHexRef.current = hex
    if (!isOn) setIsOn(true)
    colorThrottle.schedule(rgb)
  }

  // Vertical slider drag: the value follows the pointer while the button is
  // held (previously only a click worked, so the user could never drag to the
  // ends). Pointer capture keeps the drag alive outside the element.
  const pctFromPointer = (event: React.PointerEvent<HTMLDivElement>): number => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect.height) return 0
    const offsetY = event.clientY - rect.top
    return Math.max(0, Math.min(100, Math.round(((rect.height - offsetY) / rect.height) * 100)))
  }

  const startSliderDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    draggingRef: React.MutableRefObject<boolean>
  ) => {
    event.preventDefault()
    draggingRef.current = true
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
  }

  const endSliderDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    draggingRef: React.MutableRefObject<boolean>,
    flush: () => void
  ) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {}
    flush()
  }

  // Domínio de controle do toggle. O botão power é compartilhado por todos os
  // tipos de dispositivo (luz, switch, TV/media_player, remote...). Usar o
  // domínio real do dispositivo é obrigatório: chamar `light.turn_off` com o
  // entity_id de uma TV (media_player/remote) falha no Home Assistant e o
  // botão nunca desliga.
  const toggleDomain = (() => {
    if (device.domain === 'remote') return 'remote'
    if (device.domain === 'media_player') return 'media_player'
    return device.domain === 'light' || device.domain === 'switch' || device.domain === 'fan' ? device.domain : 'light'
  })()

  const handleToggle = () => {
    const nextState = !isOn
    beginUserInteraction()
    setIsOn(nextState)
    isOnRef.current = nextState
    if (onToggle) {
      onToggle({ ...device, state: { ...device.state, on: nextState } })
    }
    const service = nextState ? 'turn_on' : 'turn_off'
    const related = (device.attributes?.relatedEntities as Device[]) || [device]
    const promises = related.map((target) => {
      const targetDomain = target.domain === 'remote' || target.domain === 'media_player' || target.domain === 'light' || target.domain === 'switch' || target.domain === 'fan'
        ? target.domain
        : toggleDomain
      return executeService(targetDomain, service, { entity_id: target.id })
    })
    Promise.all(promises).catch(() => {
      isUserInteractingRef.current = false
    })
  }

  const handleSendRemoteCommand = async (command: string) => {
    const targetId = device.id
    const domain = device.domain
    const cmdUpper = command.toUpperCase()

    // 1. Tratamento de mídia padrão para reprodução. These services only
    // accept media_player entities, so remote-only cards target the matching
    // media player instead of the remote entity.
    if (cmdUpper === 'PLAY' || cmdUpper === 'PAUSE' || cmdUpper === 'PLAY_PAUSE') {
      await executeService('media_player', 'media_play_pause', { entity_id: mediaTargetId })
      return
    }
    if (cmdUpper === 'PREV' || cmdUpper === 'PREVIOUS') {
      await executeService('media_player', 'media_previous_track', { entity_id: mediaTargetId })
      return
    }
    if (cmdUpper === 'NEXT') {
      await executeService('media_player', 'media_next_track', { entity_id: mediaTargetId })
      return
    }

    // 2. Se a ação for um app (ex: YouTube ou Netflix)
    if (cmdUpper === 'YOUTUBE' || cmdUpper === 'NETFLIX') {
      const sourceName = cmdUpper === 'YOUTUBE' ? 'YouTube' : 'Netflix'
      const appId = cmdUpper === 'YOUTUBE' ? 'com.google.android.youtube.tv' : 'com.netflix.ninja'

      // Find the best media_player target: prefer one that's actually online,
      // skip 'unavailable' entities (like tv_thucos which has stale integrations)
      const mediaPlayers = effectiveAllDevices.filter(d => d.domain === 'media_player')
      const mediaId = mediaPlayers.find(d => d.state?.rawState !== 'unavailable' && d.state?.volume != null)?.id
        || mediaPlayers.find(d => d.state?.rawState !== 'unavailable')?.id
        || volumeDevice?.id
        || targetId
      const candidateRemote = effectiveAllDevices.find(d => d.domain === 'remote') || (targetId !== mediaId ? { id: targetId } : null)

      console.log(`[SmartHome] YouTube/Netflix: mediaId=${mediaId} candidateRemote=${candidateRemote?.id} targetId=${targetId} allDomains=${effectiveAllDevices.map(d => d.id).join(',')}`)

      // 2a. Tentar media_player.play_media com o appId do Android TV
      try {
        console.log(`[SmartHome] YouTube/Netflix: trying media_player.play_media on ${mediaId}`)
        const res = await executeService('media_player', 'play_media', {
          entity_id: mediaId,
          media_content_type: 'app',
          media_content_id: appId
        })
        console.log('[SmartHome] YouTube/Netflix: media_player.play_media result:', JSON.stringify(res))
        if (res?.success !== false && res?.ok !== false) return
      } catch (e) {
        console.log('[SmartHome] YouTube/Netflix: media_player.play_media threw:', e)
      }

      // 2b. Tentar remote.turn_on com activity no remote (ex: remote.tv_thucos)
      if (candidateRemote) {
        try {
          console.log(`[SmartHome] YouTube/Netflix: trying remote.turn_on on ${candidateRemote.id}`)
          const res = await executeService('remote', 'turn_on', {
            entity_id: candidateRemote.id,
            activity: appId
          })
          console.log('[SmartHome] YouTube/Netflix: remote.turn_on result:', JSON.stringify(res))
          if (res?.success !== false && res?.ok !== false) return
        } catch (e) {
          console.log('[SmartHome] YouTube/Netflix: remote.turn_on threw:', e)
        }
      }

      // 2c. Tentar media_player.select_source
      try {
        console.log(`[SmartHome] YouTube/Netflix: trying media_player.select_source on ${mediaId}`)
        const res = await executeService('media_player', 'select_source', { entity_id: mediaId, source: sourceName })
        console.log('[SmartHome] YouTube/Netflix: media_player.select_source result:', JSON.stringify(res))
        if (res?.success !== false && res?.ok !== false) return
      } catch (e) {
        console.log('[SmartHome] YouTube/Netflix: media_player.select_source threw:', e)
      }
    }

    // 3. Input switching (TV, HDMI, AV and custom sources) is delegated to
    // the worker/provider, which owns the sequential attempts with source
    // confirmation. See handleSelectSource.

    // Mapeamento universal de comandos para Android TV
    const androidTvCommandMap: Record<string, string[]> = {
      UP: ['DPAD_UP', 'UP'],
      DOWN: ['DPAD_DOWN', 'DOWN'],
      LEFT: ['DPAD_LEFT', 'LEFT'],
      RIGHT: ['DPAD_RIGHT', 'RIGHT'],
      ENTER: ['DPAD_CENTER', 'ENTER', 'OK'],
      BACK: ['BACK'],
      HOME: ['HOME']
    }
    const candidates = androidTvCommandMap[cmdUpper] || [cmdUpper]

    // 4. Tentar remote.send_command na própria entidade ou em entidade remote correspondente (ex: remote.tv_thucos)
    const candidateRemote = effectiveAllDevices.find(d => d.domain === 'remote')

    const remoteTargetId = domain === 'remote'
      ? targetId
      : (candidateRemote?.id || (domain === 'media_player' ? targetId.replace('media_player.', 'remote.') : null))

    if (remoteTargetId) {
      for (const cmdCandidate of candidates) {
        try {
          const res = await executeService('remote', 'send_command', {
            entity_id: remoteTargetId,
            command: [cmdCandidate]
          })
          if (res?.success !== false && res?.ok !== false) return
        } catch (err) {}
      }
    }

    // 4. Se a TV for um media_player do Android TV / Chromecast (media_player.play_media com chave 'action' ou 'key')
    for (const cmdCandidate of candidates) {
      try {
        const res = await executeService('media_player', 'play_media', {
          entity_id: targetId,
          media_content_type: 'action',
          media_content_id: cmdCandidate
        })
        if (res?.success !== false && res?.ok !== false) return
      } catch (e) {}

      try {
        const res = await executeService('media_player', 'play_media', {
          entity_id: targetId,
          media_content_type: 'key',
          media_content_id: cmdCandidate
        })
        if (res?.success !== false && res?.ok !== false) return
      } catch (e) {}
    }

    // 5. Fallback final via remote.send_command no ID da própria entidade media_player (usado por algumas integrações do HA)
    for (const cmdCandidate of candidates) {
      try {
        await executeService('remote', 'send_command', {
          entity_id: targetId,
          command: [cmdCandidate]
        })
        return
      } catch (e) {}
    }
  }

  const handleSelectSource = async (source: string) => {
    setShowInputSelector(false)
    // Input switching is implemented once in the worker/provider (sequential
    // attempts + source confirmation). The UI only requests the source by
    // name, including custom entries from the TV's own source list.
    try {
      await extFetch('/extensions/momai-smarthome/command', {
        toolName: 'control_tv_remote',
        args: { device_name: device.id, command: source }
      })
    } catch (err) {
      console.warn('[SmartHome] Falha ao trocar a entrada da TV:', err)
    }
  }

  const handleVolumeChange = async (direction: 'down' | 'up') => {
    const nextVolumePercent = Math.max(0, Math.min(100, volumePercentRef.current + (direction === 'up' ? 1 : -1)))
    volumePercentRef.current = nextVolumePercent
    setVolumePercent(nextVolumePercent)
    setActiveVolumeButton(direction)

    if (volumeFeedbackTimerRef.current) {
      clearTimeout(volumeFeedbackTimerRef.current)
    }
    volumeFeedbackTimerRef.current = setTimeout(() => setActiveVolumeButton(null), 1200)

    const volumeLevel = nextVolumePercent / 100
    console.log(`[SmartHome] handleVolumeChange ${direction} -> ${nextVolumePercent}% device=${volumeDevice.id}`)
    
    // Try volume_set first for precise 1% control
    let result = await executeService('media_player', 'volume_set', { entity_id: volumeDevice.id, volume_level: volumeLevel })
    console.log('[SmartHome] handleVolumeChange volume_set result:', JSON.stringify(result))
    
    // If volume_set failed, fall back to volume_up/volume_down (coarser but works)
    if (result && result.ok === false) {
      const service = direction === 'up' ? 'volume_up' : 'volume_down'
      console.log('[SmartHome] handleVolumeChange: volume_set failed, trying', service)
      result = await executeService('media_player', service, { entity_id: volumeDevice.id })
      console.log('[SmartHome] handleVolumeChange fallback result:', JSON.stringify(result))
    }
    
    // If all commands failed, revert the optimistic UI update
    if (result && result.ok === false) {
      const revertedVolume = volumePercentRef.current - (direction === 'up' ? 1 : -1)
      volumePercentRef.current = Math.max(0, Math.min(100, revertedVolume))
      setVolumePercent(volumePercentRef.current)
    }
  }

  const currentDynamicIcon = getDynamicSvgIcon(device, 20, '#ffffff')

  if (device.domain === 'remote' || device.domain === 'media_player') {
    const rawSources = (device.attributes?.source_list as string[]) || (currentDevice.attributes?.source_list as string[])
    const defaultSources = ['TV', 'HDMI 1', 'HDMI 2', 'AV']
    const baseSources = (Array.isArray(rawSources) && rawSources.length > 0) ? rawSources : defaultSources
    // Filtrar YouTube e Netflix pois já existe o botão de atalho dedicado do YouTube na barra principal
    const inputSources = baseSources.filter(s => {
      const lower = s.toLowerCase().trim()
      return lower !== 'youtube' && lower !== 'netflix'
    })

    return (
      <div className="sh-modal-detail" style={isOverlay ? { WebkitAppRegion: 'drag' } as any : undefined}>
        <button
          className="sh-modal-close-btn"
          title={t('actions.close')}
          aria-label={t('actions.close')}
          onClick={(e) => {
            e.stopPropagation()
            if (onClose) onClose()
          }}
          style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto', cursor: 'pointer' } as any}
        >
          ✕
        </button>
        <div className="sh-modal-remote-content">
          <div className="sh-remote-header">
            <span className="sh-remote-pill-tag">{t('remote.smartRemote')}</span>
            <h3 className="sh-remote-title">{device.name}</h3>
            <p className="sh-remote-state">{isOn ? `● ${t('device.on')}` : `○ ${t('device.off')}`} • {device.room || t('remote.defaultRoom')}</p>
          </div>

          <div className="sh-dpad-ring" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <button className="sh-dpad-btn up" title={t('remote.navUp')} aria-label={t('remote.navUp')} onClick={() => handleSendRemoteCommand('UP')}>▲</button>
            <button className="sh-dpad-btn down" title={t('remote.navDown')} aria-label={t('remote.navDown')} onClick={() => handleSendRemoteCommand('DOWN')}>▼</button>
            <button className="sh-dpad-btn left" title={t('remote.navLeft')} aria-label={t('remote.navLeft')} onClick={() => handleSendRemoteCommand('LEFT')}>◀</button>
            <button className="sh-dpad-btn right" title={t('remote.navRight')} aria-label={t('remote.navRight')} onClick={() => handleSendRemoteCommand('RIGHT')}>▶</button>
            <button className="sh-dpad-center" title={t('remote.confirm')} aria-label={t('remote.confirm')} onClick={() => handleSendRemoteCommand('ENTER')}>OK</button>
          </div>

          <div className="sh-remote-actions-row" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <button className="sh-remote-action-btn" title={t('remote.back')} aria-label={t('remote.back')} onClick={() => handleSendRemoteCommand('BACK')}>
              <SvgBack size={18} />
            </button>
            <button className="sh-remote-action-btn" title={t('remote.home')} aria-label={t('remote.home')} onClick={() => handleSendRemoteCommand('HOME')}>
              <SvgHome size={18} />
            </button>
            <button className={`sh-remote-action-btn ${showInputSelector ? 'active' : ''}`} title={t('remote.inputs')} aria-label={t('remote.inputs')} onClick={() => setShowInputSelector(!showInputSelector)}>
              <SvgTv size={18} />
            </button>
            <button className="sh-remote-action-btn youtube-pill" title={t('remote.youtube')} aria-label={t('remote.youtube')} onClick={() => handleSendRemoteCommand('YOUTUBE')}>
              <SvgYoutube />
            </button>
            <button className={`sh-remote-action-btn power ${isOn ? 'active' : ''}`} title={isOn ? t('remote.powerOff') : t('remote.powerOn')} aria-label={isOn ? t('remote.powerOff') : t('remote.powerOn')} onClick={handleToggle}>
              <SvgPower size={18} color="#ffffff" />
            </button>
          </div>

          {showInputSelector && (
            <div className="sh-input-selector-popover" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
              <div className="sh-input-grid">
                {inputSources.map((src) => (
                  <button key={src} className="sh-input-chip" title={t('remote.switchToInput', { src })} aria-label={t('remote.switchToInput', { src })} onClick={() => handleSelectSource(src)}>
                    <SvgTv size={14} /> {src}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sh-remote-media-row" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <button className="sh-remote-icon-btn" title={t('remote.prev')} aria-label={t('remote.prev')} onClick={() => handleSendRemoteCommand('PREV')}>
              <SvgPrev size={18} />
            </button>
            <button
              className="sh-remote-icon-btn main"
              title={isPlaying ? t('remote.pause') : t('remote.play')}
              aria-label={isPlaying ? t('remote.pause') : t('remote.play')}
              onClick={() => {
                setIsPlaying(!isPlaying)
                handleSendRemoteCommand(isPlaying ? 'PAUSE' : 'PLAY')
              }}
            >
              {isPlaying ? <SvgPause size={18} color="#ffffff" /> : <SvgPlay size={18} color="#ffffff" />}
            </button>
            <button className="sh-remote-icon-btn" title={t('remote.next')} aria-label={t('remote.next')} onClick={() => handleSendRemoteCommand('NEXT')}>
              <SvgNext size={18} />
            </button>
          </div>

          <div className="sh-remote-vol-row" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <button
              className="sh-remote-icon-btn"
              title={isMuted ? t('remote.unmute') : t('remote.mute')}
              aria-label={isMuted ? t('remote.unmute') : t('remote.mute')}
              onClick={() => {
                setIsMuted(!isMuted)
                executeService('media_player', 'volume_mute', { entity_id: volumeDevice.id, is_volume_muted: !isMuted })
              }}
            >
              {isMuted ? <SvgMuteStrikethrough size={18} /> : <SvgMute size={18} />}
            </button>
            <div className="sh-volume-control">
              <span
                className={`sh-volume-feedback ${activeVolumeButton === 'down' ? 'active' : ''}`}
                aria-live="polite"
              >
                {volumePercent}%
              </span>
              <button
                className="sh-remote-icon-btn"
                title={t('remote.volDown')}
                aria-label={t('remote.volDown')}
                onClick={() => handleVolumeChange('down')}
              >
                <SvgVolDown size={18} />
              </button>
            </div>
            <div className="sh-volume-control">
              <span
                className={`sh-volume-feedback ${activeVolumeButton === 'up' ? 'active' : ''}`}
                aria-live="polite"
              >
                {volumePercent}%
              </span>
              <button
                className="sh-remote-icon-btn"
                title={t('remote.volUp')}
                aria-label={t('remote.volUp')}
                onClick={() => handleVolumeChange('up')}
              >
                <SvgVolUp size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (device.domain === 'light') {
    return (
      <div className="sh-modal-detail" style={isOverlay ? { WebkitAppRegion: 'drag' } as any : undefined}>
        <button
          className="sh-modal-close-btn"
          onClick={(e) => {
            e.stopPropagation()
            if (onClose) onClose()
          }}
          style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto', cursor: 'pointer' } as any}
        >
          ✕
        </button>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.5px' }}>
            {device.room || t('device.noRoom')}
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>{device.name}</h2>
        </div>

        <div className="sh-light-readout">{isOn ? `${brightness}%` : t('state.off')}</div>
        <div className="sh-light-subreadout">{isOn ? t('light.on') : t('light.off')}</div>

        {activeTab === 'brightness' && (
          <div
            className="sh-pill-slider-container"
            style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}
            onPointerDown={(e) => {
              startSliderDrag(e, brightnessDraggingRef)
              handleBrightnessChange(pctFromPointer(e))
            }}
            onPointerMove={(e) => {
              if (!brightnessDraggingRef.current) return
              handleBrightnessChange(pctFromPointer(e))
            }}
            onPointerUp={(e) => {
              handleBrightnessChange(pctFromPointer(e))
              endSliderDrag(e, brightnessDraggingRef, brightnessThrottle.flush)
            }}
            onPointerCancel={(e) => endSliderDrag(e, brightnessDraggingRef, brightnessThrottle.flush)}
          >
            <div
              className="sh-pill-slider-fill"
              style={{
                height: `${brightness}%`,
                background: isOn ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : '#334155'
              }}
            >
              <div className="sh-pill-handle" />
            </div>
          </div>
        )}

        {activeTab === 'color' && (
          <div style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <ColorWheelPicker selectedHex={selectedRgbHex} onChange={handleColorChange} onCommit={colorThrottle.flush} />
            <div className="sh-color-grid">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  className="sh-color-circle"
                  style={{ background: preset.color }}
                  onClick={() => handleColorChange(preset.rgb as [number, number, number], preset.color)}
                  title={t(preset.key)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'temp' && (
          <div
            className="sh-pill-slider-container"
            style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}
            onPointerDown={(e) => {
              startSliderDrag(e, tempDraggingRef)
              handleTempSliderChange(pctFromPointer(e))
            }}
            onPointerMove={(e) => {
              if (!tempDraggingRef.current) return
              handleTempSliderChange(pctFromPointer(e))
            }}
            onPointerUp={(e) => {
              handleTempSliderChange(pctFromPointer(e))
              endSliderDrag(e, tempDraggingRef, tempThrottle.flush)
            }}
            onPointerCancel={(e) => endSliderDrag(e, tempDraggingRef, tempThrottle.flush)}
          >
            <div
              className="sh-pill-slider-fill"
              style={{
                height: `${tempPct}%`,
                background: 'linear-gradient(to top, #ffffff 0%, #ffdfb8 40%, #ff8c00 100%)'
              }}
            >
              <div className="sh-pill-handle" />
            </div>
          </div>
        )}

        <div className="sh-light-ctrl-bar" style={isOverlay ? { WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as any : undefined}>
          <button
            className={`sh-light-ctrl-btn ${activeTab === 'brightness' ? 'active' : ''}`}
            onClick={() => setActiveTab('brightness')}
            style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as any}
          >
            <SvgSun size={20} />
          </button>
          <button
            className={`sh-light-ctrl-btn ${activeTab === 'color' ? 'active' : ''}`}
            onClick={() => setActiveTab('color')}
            style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as any}
          >
            <SvgColorWheel size={22} />
          </button>
          <button
            className={`sh-light-ctrl-btn ${activeTab === 'temp' ? 'active' : ''}`}
            onClick={() => setActiveTab('temp')}
            style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as any}
          >
            <SvgTemp size={22} />
          </button>
          <button
            className={`sh-light-ctrl-btn ${isOn ? 'active' : ''}`}
            onClick={handleToggle}
            style={{
              WebkitAppRegion: 'no-drag',
              pointerEvents: 'auto',
              ...(isOn ? { background: '#ef4444', color: '#fff' } : {})
            } as any}
          >
            <SvgPower size={20} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sh-modal-detail" style={isOverlay ? { WebkitAppRegion: 'drag' } as any : undefined}>
      <button
        className="sh-modal-close-btn"
        onClick={(e) => {
          e.stopPropagation()
          if (onClose) onClose()
        }}
        style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto', cursor: 'pointer' } as any}
      >
        ✕
      </button>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="sh-icon" style={{ width: '60px', height: '60px', borderRadius: '18px', margin: '0 auto 12px', fontSize: '28px' }}>
          {currentDynamicIcon}
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{device.name}</h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          {device.room ? `${device.room} • ` : ''}{getDomainLabel(device.domain, t)}
        </p>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>{t('device.status')}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: isOn ? '#34d399' : '#f87171' }}>
            {isOn ? t('device.statusOn') : t('device.statusOff')}
          </span>
        </div>
        {device.state?.temperature != null && (
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{t('control.temperature')}</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>{device.state.temperature}°C</span>
          </div>
        )}
        {device.state?.humidity != null && (
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{t('device.humidity')}</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>{device.state.humidity}%</span>
          </div>
        )}
        {device.state?.value && (
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{t('device.value')}</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{device.state.value} {device.state.unit || ''}</span>
          </div>
        )}
      </div>

      {CONTROLLABLE_DOMAINS.includes(device.domain) && (
        <button
          className="sh-btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '15px' }}
          onClick={handleToggle}
        >
          <SvgPower size={18} color="#ffffff" />
          {isOn ? t('device.turnOff') : t('device.turnOn')}
        </button>
      )}
    </div>
  )
}
