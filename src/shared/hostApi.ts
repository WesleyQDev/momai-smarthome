// Shared access to the host command channel.
//
// The extension talks to the local MomAI API (node-core/server) over HTTP.
// These helpers were duplicated in page.tsx, panel.tsx, DeviceControlContent
// and the widgets; keep the single copy here.

import { translateSh } from '../i18n/index'

const DEFAULT_API_BASE = 'http://127.0.0.1:8050'
export const EXT_FETCH_TIMEOUT_MS = 10000

export function getApiBaseUrl(): string {
  try {
    const host = (window as any)?.momaiAPI || (window as any)?.api
    const base = host?.getApiBaseUrl?.()
    if (base) return String(base).replace(/\/+$/, '')
  } catch {}
  return DEFAULT_API_BASE
}

export function getSessionToken(): string {
  try {
    const host = (window as any)?.momaiAPI || (window as any)?.api
    return String(host?.getSessionToken?.() || '')
  } catch {
    return ''
  }
}

/**
 * fetch with timeout. On failure it resolves with `{ ok: false, error }`
 * instead of throwing, so callers can show a message instead of hanging.
 */
export function extFetch(path: string, body?: unknown, timeoutMs = EXT_FETCH_TIMEOUT_MS): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(`${getApiBaseUrl()}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: controller.signal
  })
    .then((response) => {
      try {
        return response.json()
      } catch {
        return {}
      }
    })
    .catch((err) => {
      const aborted = err && (err.name === 'AbortError' || err.code === 'ABORT_ERR' || err.code === 20)
      return {
        ok: false,
        error: aborted
          ? translateSh('panel.timeout')
          : (err?.message || translateSh('panel.networkError'))
      }
    })
    .finally(() => clearTimeout(timer))
}
