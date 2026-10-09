// Localized display for the canonical state codes returned by the worker.
// The worker never sends localized labels (they leaked into every locale);
// the widgets translate the known codes and show anything else as-is.

const STATE_LABEL_KEYS: Record<string, string> = {
  on: 'state.on',
  off: 'state.off',
  open: 'device.open',
  closed: 'device.closed',
  locked: 'device.locked',
  unlocked: 'device.unlocked',
  playing: 'device.playing',
  paused: 'device.paused',
  idle: 'state.idle',
  cool: 'state.cool',
  heat: 'state.heat',
  fan_only: 'state.fanOnly',
  auto: 'state.auto',
  dry: 'state.dry',
  heat_cool: 'state.heatCool',
  unavailable: 'device.unavailable',
  unknown: 'state.unknown',
  active: 'device.active',
  inactive: 'device.inactive'
}

export function stateLabel(state: string, t: (key: string) => string): string {
  const key = STATE_LABEL_KEYS[String(state || '').toLowerCase().trim()]
  return key ? t(key) : state
}
