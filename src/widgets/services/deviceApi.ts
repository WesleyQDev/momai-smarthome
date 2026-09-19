function getBaseUrl(): string {
  try {
    const fromHost =
      (window as any)?.momaiAPI?.getApiBaseUrl?.() || (window as any)?.api?.getApiBaseUrl?.()
    if (fromHost) return String(fromHost).replace(/\/+$/, '')
  } catch {}
  return 'http://127.0.0.1:8050'
}

function getToken(): string {
  try {
    return String((window as any)?.momaiAPI?.getSessionToken?.() || (window as any)?.api?.getSessionToken?.() || '')
  } catch {
    return ''
  }
}

export interface WidgetDevice {
  id: string
  name: string
  state: string
  room?: string
}

async function callCommand(toolName: string, args: Record<string, unknown> = {}): Promise<any> {
  const res = await fetch(`${getBaseUrl()}/extensions/momai-smarthome/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
    },
    body: JSON.stringify({ toolName, args })
  })
  return res.json()
}

/**
 * Lists devices through the existing command channel.
 * Reuses list_devices; filters to toggleable domains on the caller side.
 */
export async function fetchWidgetDevices(): Promise<WidgetDevice[]> {
  const data = await callCommand('list_devices', {})
  const list: any[] = data?.devices ?? data?.data?.devices ?? []
  return list.map((item) => ({
    id: String(item.entity_id ?? item.id ?? ''),
    name: String(item.name ?? item.entity_id ?? 'Device'),
    state: String(item.state ?? 'unknown'),
    room: item.room ? String(item.room) : undefined
  })).filter((device) => device.id !== '')
}

export async function toggleWidgetDevice(deviceId: string): Promise<void> {
  await callCommand('control_device', { device_name: deviceId, action: 'toggle' })
}
