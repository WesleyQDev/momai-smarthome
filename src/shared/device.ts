// Shared device model and domain metadata.
//
// Single source of truth for the UI (page/panel/components), the widgets and
// the worker. Previously each file carried its own copy of these types and
// constants, which drifted over time.

export interface EntityState {
  on?: boolean
  brightness?: number | null
  temperature?: number | null
  targetTemperature?: number | null
  hvacMode?: string
  hvacModes?: string[]
  position?: number | null
  isOpen?: boolean
  value?: string
  unit?: string
  locked?: boolean
  volume?: number | null
  mediaTitle?: string | null
  colorTemp?: number | null
  rawState?: string
  elevation?: number | null
  azimuth?: number | null
  rising?: boolean
  humidity?: number | null
  pressure?: number | null
  pressureUnit?: string
  windSpeed?: number | null
  windSpeedUnit?: string
  temperatureUnit?: string
  deviceClass?: string
  hexColor?: string | null
  rgbColor?: number[] | null
  isPlaying?: boolean
  isMuted?: boolean
  source?: string | null
  colorTempKelvin?: number | null
}

export interface EntityAttributes {
  supported?: string[]
  next_rising?: string
  next_setting?: string
  next_dawn?: string
  next_dusk?: string
  deviceClass?: string
  unitOfMeasurement?: string
  haIcon?: string
  source_list?: string[]
  relatedEntities?: Device[]
  [key: string]: unknown
}

export interface Device {
  id: string
  name: string
  type: string
  domain: string
  icon: string
  room: string
  provider: string
  online: boolean
  state: EntityState
  attributes: EntityAttributes
}

export const DOMAIN_KEYS: Record<string, string> = {
  light: 'domains.light',
  switch: 'domains.switch',
  fan: 'domains.fan',
  cover: 'domains.cover',
  lock: 'domains.lock',
  climate: 'domains.climate',
  sensor: 'domains.sensor',
  binary_sensor: 'domains.binarySensor',
  media_player: 'domains.mediaPlayer',
  camera: 'domains.camera',
  vacuum: 'domains.vacuum',
  scene: 'domains.scene',
  automation: 'domains.automation',
  alarm_control_panel: 'domains.alarm',
  remote: 'domains.remote',
  sun: 'domains.sun',
  weather: 'domains.weather'
}

export function getDomainLabel(domain: string, t: (key: string) => string): string {
  const key = DOMAIN_KEYS[domain]
  return key ? t(key) : domain
}

export const CONTROLLABLE_DOMAINS = [
  'light',
  'switch',
  'fan',
  'cover',
  'lock',
  'climate',
  'media_player',
  'vacuum',
  'alarm_control_panel',
  'camera',
  'automation',
  'scene',
  'remote'
]

// Overlay window size per domain — shared by the chat tool and the page click
// so both open the floating control with the same dimensions.
export function getOverlaySizeForDomain(domain: string): { width: number; height: number } {
  if (domain === 'media_player' || domain === 'remote') return { width: 320, height: 520 }
  if (domain === 'light') return { width: 320, height: 540 }
  if (domain === 'climate') return { width: 320, height: 460 }
  return { width: 300, height: 440 }
}
