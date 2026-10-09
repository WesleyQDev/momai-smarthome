import sdk from 'momai:sdk'
import { extFetch } from '../../shared/hostApi'

export interface WidgetDevice {
  id: string
  name: string
  state: string
  room?: string
}

async function callCommand(toolName: string, args: Record<string, unknown> = {}): Promise<any> {
  let data: any = null
  try {
    if (sdk?.api?.post) {
      const res = await sdk.api.post('/extensions/momai-smarthome/command', { toolName, args })
      data = (res as any)?.data ?? res
    }
  } catch (err) {
    console.warn('[smarthome-widget] SDK command failed, falling back to fetch:', err)
  }

  if (data === null || data === undefined) {
    data = await extFetch('/extensions/momai-smarthome/command', { toolName, args })
  }

  // Tool failures must reach the caller so the widget can revert its
  // optimistic state and show the error instead of pretending success.
  if (data && data.ok === false) {
    throw new Error(typeof data.error === 'string' && data.error ? data.error : 'Command failed')
  }
  return data
}

/**
 * Lists devices through the existing command channel.
 * Reuses list_devices; filters to toggleable domains on the caller side.
 */
export async function fetchWidgetDevices(): Promise<WidgetDevice[]> {
  const data = await callCommand('list_devices', {})
  const list: any[] = data?.devices ?? data?.data?.devices ?? []
  return list
    .map((item) => ({
      id: String(item.entity_id ?? item.id ?? ''),
      name: String(item.name ?? item.entity_id ?? 'Device'),
      state: String(item.state ?? 'unknown'),
      room: item.room ? String(item.room) : undefined
    }))
    .filter((device) => device.id !== '')
}

export async function setWidgetDeviceState(deviceId: string, turnOn: boolean): Promise<void> {
  await callCommand('control_device', { device_name: deviceId, action: turnOn ? 'on' : 'off' })
}

export async function toggleWidgetDevice(deviceId: string): Promise<void> {
  await callCommand('control_device', { device_name: deviceId, action: 'toggle' })
}
