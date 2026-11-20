const https = require('https')
const http = require('http')
const BaseProvider = require('../provider.ts')

let WebSocket
try {
  WebSocket = require('ws')
} catch (e) {
  if (typeof globalThis.WebSocket !== 'undefined') {
    WebSocket = globalThis.WebSocket
  }
}

const HA_DOMAINS = {
  light: { name: 'Light', icon: 'lightbulb', services: ['turn_on', 'turn_off', 'toggle'] },
  switch: { name: 'Switch', icon: 'switch', services: ['turn_on', 'turn_off', 'toggle'] },
  fan: { name: 'Fan', icon: 'fan', services: ['turn_on', 'turn_off', 'toggle'] },
  cover: { name: 'Cover', icon: 'curtains', services: ['open_cover', 'close_cover', 'stop_cover'] },
  lock: { name: 'Lock', icon: 'lock', services: ['lock', 'unlock'] },
  climate: { name: 'Climate', icon: 'thermostat', services: ['set_temperature', 'set_hvac_mode'] },
  sensor: { name: 'Sensor', icon: 'sensor', services: [] },
  binary_sensor: { name: 'Binary Sensor', icon: 'motion', services: [] },
  media_player: { name: 'Media Player', icon: 'tv', services: ['turn_on', 'turn_off', 'volume_set'] },
  camera: { name: 'Camera', icon: 'camera', services: ['turn_on', 'turn_off'] },
  vacuum: { name: 'Vacuum', icon: 'vacuum', services: ['start', 'stop', 'return_to_base'] },
  scene: { name: 'Scene', icon: 'palette', services: ['turn_on'] },
  automation: { name: 'Automation', icon: 'autorenew', services: ['turn_on', 'turn_off', 'toggle'] },
  alarm_control_panel: { name: 'Alarm', icon: 'security', services: ['alarm_arm_away', 'alarm_arm_home', 'alarm_disarm'] },
  sun: { name: 'Sun', icon: 'sun', services: [] },
  weather: { name: 'Weather', icon: 'cloud-sun', services: [] },
  remote: { name: 'Remote', icon: 'remote', services: ['turn_on', 'turn_off'] }
}

const EXCLUDED_DOMAINS = new Set([
  'update', 'person', 'zone', 'todo', 'tts', 'stt', 'conversation',
  'event', 'hacs', 'device_tracker', 'input_button', 'input_select',
  'select', 'number', 'input_number', 'text', 'input_text', 'datetime',
  'input_datetime', 'persistent_notification', 'button', 'diagnostics',
  'system_health'
])

// Timeout for lightweight GET queries (/api/config, /api/states).
const REQUEST_TIMEOUT_MS = 4000
// Timeout for HA service calls (/api/services/*): cloud-backed integrations
// such as Tuya Sharing can take 4-8s on slow round-trips before HTTP 200.
const SERVICE_TIMEOUT_MS = 10000
// Window after a command during which stale HA polls/WS events (before cloud
// MQTT pushes back the new state) are not allowed to revert optimistic state.
const STATE_GUARD_MS = 5000
// Delay before a single automatic retry on transient TCP resets (ECONNRESET/EPIPE).
const TRANSIENT_RETRY_DELAY_MS = 150
// Falhas transitórias (rede lenta, timeout, queda breve) NÃO derrubam a conexão
// de imediato: só marcam desconectado após N falhas consecutivas (com probe de
// recuperação entre elas), para uma leve queda não virar a tela de desconectado.
const TRANSIENT_ERRORS_BEFORE_DISCONNECT = 10
// Atraso do probe de recuperação após a primeira falha transitória.
const DISCONNECT_PROBE_DELAY_MS = 5000

interface QueuedCommandWaiter {
  resolve: (res: any) => void
}

interface DesiredCommand {
  action: 'turnOn' | 'turnOff'
  params: Record<string, any>
  waiters: QueuedCommandWaiter[]
}

interface DeviceCommandEntry {
  inFlight: Promise<void> | null
  desired: DesiredCommand | null
  lastAppliedAction?: 'turnOn' | 'turnOff'
  expectedOn?: boolean
  guardUntil: number
}

const COLOR_NAME_TO_RGB = {
  vermelho: [255, 0, 0],
  red: [255, 0, 0],
  verde: [0, 255, 0],
  green: [0, 255, 0],
  azul: [0, 0, 255],
  blue: [0, 0, 255],
  amarelo: [255, 255, 0],
  yellow: [255, 255, 0],
  roxo: [128, 0, 128],
  purple: [128, 0, 128],
  violeta: [238, 130, 238],
  lilas: [200, 160, 255],
  rosa: [255, 192, 203],
  pink: [255, 192, 203],
  laranja: [255, 165, 0],
  orange: [255, 165, 0],
  ciano: [0, 255, 255],
  cyan: [0, 255, 255],
  turquesa: [64, 224, 208],
  magenta: [255, 0, 255],
  branco: [255, 255, 255],
  white: [255, 255, 255],
  quente: 'warm',
  frio: 'cool'
}

function parseColor(color) {
  if (!color || typeof color !== 'string') return null
  const c = color.trim().toLowerCase()
  if (COLOR_NAME_TO_RGB[c]) {
    if (typeof COLOR_NAME_TO_RGB[c] === 'string') {
      return { color_temp_kelvin: COLOR_NAME_TO_RGB[c] === 'warm' ? 2700 : 6500 }
    }
    return { rgb_color: COLOR_NAME_TO_RGB[c] }
  }
  const hexMatch = c.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (hexMatch) {
    return {
      rgb_color: [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16)
      ]
    }
  }
  return null
}

class HomeAssistantProvider extends BaseProvider {
  constructor(config: any = {}) {
    super(config)
    this.name = 'Home Assistant'
    this.url = config.url || process.env.HA_URL || 'http://homeassistant.local:8123'
    this.token = config.token || process.env.HA_TOKEN || ''
    this.cachedDevices = new Map()
    this.lastError = null
    this._lastConnectAttempt = 0

    this.ws = null
    this.wsConnected = false
    this.wsReconnectTimer = null
    this.wsMessageId = 0
    this._isDisconnecting = false
    this._transientErrCount = 0
    this._disconnectCheckTimer = null
    // entity_id -> area name, resolved from the HA registries over WebSocket.
    // The REST /api/states payload does not carry area information, so this
    // map is the only way to know each device's room.
    this._areaByEntity = new Map()
    this._areasAttempted = false
    // Pending WebSocket request/response calls (registry lookups).
    this._wsPending = new Map()
    // Entities that do not expose a media_player `source` attribute; input
    // verification is skipped for them instead of probing on every attempt.
    this._noSourceEntities = new Set()
    // Per-device command queue and latest-intent coalescing state.
    this._deviceCommandState = new Map<string, DeviceCommandEntry>()
  }

  async _wsRequest(type, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      if (!this.ws || !this.wsConnected || typeof this.ws.send !== 'function') {
        reject(new Error('WebSocket do Home Assistant não está conectado'))
        return
      }
      const id = ++this.wsMessageId
      const timer = setTimeout(() => {
        this._wsPending.delete(id)
        reject(new Error(`Tempo limite na consulta ${type} ao Home Assistant`))
      }, timeoutMs)
      if (timer.unref) timer.unref()
      this._wsPending.set(id, { resolve, reject, timer })
      try {
        this.ws.send(JSON.stringify({ id, type }))
      } catch (err) {
        clearTimeout(timer)
        this._wsPending.delete(id)
        reject(err)
      }
    })
  }

  _rejectPendingWsRequests(reason) {
    for (const [id, pending] of this._wsPending.entries()) {
      clearTimeout(pending.timer)
      this._wsPending.delete(id)
      try {
        pending.reject(new Error(reason))
      } catch {}
    }
  }

  // Resolves each entity's room from the HA area/entity/device registries.
  // Best effort: hosts without a WebSocket (or older HA) simply keep room ''.
  async _loadAreaRegistry() {
    if (!this.wsConnected) return
    try {
      const [areas, entities, devices] = await Promise.all([
        this._wsRequest('config/area_registry/list'),
        this._wsRequest('config/entity_registry/list'),
        this._wsRequest('config/device_registry/list')
      ])
      const areaNameById = new Map(
        (Array.isArray(areas) ? areas : [])
          .filter((a) => a && a.area_id)
          .map((a) => [a.area_id, a.name || ''])
      )
      const deviceAreaById = new Map(
        (Array.isArray(devices) ? devices : [])
          .filter((d) => d && d.id)
          .map((d) => [d.id, d.area_id || null])
      )
      const next = new Map()
      for (const entry of Array.isArray(entities) ? entities : []) {
        if (!entry || !entry.entity_id) continue
        const areaId = entry.area_id || (entry.device_id ? deviceAreaById.get(entry.device_id) : null)
        const name = areaId ? areaNameById.get(areaId) : null
        if (name) next.set(entry.entity_id, name)
      }
      this._areaByEntity = next
      this._areasAttempted = true
    } catch (err) {
      // Registry unavailable: keep whatever was resolved before, retry on the
      // next WebSocket reconnect.
      this._areasAttempted = false
      console.warn('[HAProvider] Não foi possível carregar os cômodos:', err?.message || err)
    }
  }

  // Confirms an input switch by reading the media_player's `source` attribute.
  // Returns true (confirmed), false (state changed to something else) or null
  // (cannot verify: no source attribute, no connection, or probe failure).
  async _confirmSource(entityId, candidates) {
    if (this._noSourceEntities.has(entityId)) return null
    const probe = await this.getDeviceState(entityId)
    if (!probe) return null
    if (probe.state?.source == null) {
      this._noSourceEntities.add(entityId)
      return null
    }
    await new Promise((resolve) => setTimeout(resolve, 700))
    const state = await this.getDeviceState(entityId)
    const current = String(state?.state?.source || '').toLowerCase().trim()
    if (!current) return null
    return candidates.some((candidate) => {
      const wanted = String(candidate || '').toLowerCase().trim()
      if (!wanted) return false
      return current === wanted || current.includes(wanted) || wanted.includes(current)
    })
  }

  _getWsUrl() {
    try {
      const parsed = new URL(this.url)
      const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${protocol}//${parsed.host}/api/websocket`
    } catch {
      return null
    }
  }

  _connectWebSocket() {
    if (!WebSocket) {
      console.warn('[HAProvider] WebSocket não disponível no ambiente.')
      return
    }

    const wsUrl = this._getWsUrl()
    if (!wsUrl || !this.token) return

    this._closeWebSocket(false)

    try {
      const ws = new WebSocket(wsUrl)
      this.ws = ws

      const on = (event, listener) => {
        if (typeof ws.on === 'function') {
          ws.on(event, listener)
        } else if (typeof ws.addEventListener === 'function') {
          ws.addEventListener(event, (e) => {
            const data = e.data !== undefined ? e.data : e
            listener(data)
          })
        }
      }

      on('error', (err) => {
        if (this.ws !== ws) {
          // Ignora erros de socket anterior que já foi substituído ou descartado
          return
        }
        const rawMsg = (err && (err.error?.message || err.message)) || (typeof err === 'string' ? err : '')
        const msg = String(rawMsg || err || '')
        const isAbort =
          msg.includes('closed before it was established') ||
          msg.includes('closed before the connection was established') ||
          msg.includes('was closed before')
        if (!isAbort) {
          console.warn('[HAProvider] Erro no WebSocket:', msg || '[object ErrorEvent]')
        }
      })

      on('open', () => {
        // Aguarda mensagem 'auth_required' enviada pelo servidor HA
      })

      on('message', (raw) => {
        try {
          const data = typeof raw === 'string' ? raw : (raw?.data || raw.toString())
          const msg = JSON.parse(data)
          this._handleWsMessage(msg)
        } catch (err) {
          console.warn('[HAProvider] Erro ao processar mensagem do WebSocket:', err.message)
        }
      })

      on('close', () => {
        if (this.ws !== ws) {
          // Ignora fechamento de socket anterior que já foi substituído
          return
        }
        this.wsConnected = false
        if (!this._isDisconnecting && this.token && this.url) {
          this._scheduleWsReconnect()
        }
      })
    } catch (err) {
      console.warn('[HAProvider] Erro ao instanciar WebSocket:', err.message)
      if (!this._isDisconnecting && this.token && this.url) {
        this._scheduleWsReconnect()
      }
    }
  }

  _setConnected(connected, error = null) {
    const changed = this.connected !== connected || (error && this.lastError !== error)
    this.connected = connected
    // Sucesso limpa erros anteriores (senão getStatus devolve lastError stale).
    if (connected) this.lastError = null
    if (error) this.lastError = error
    if (changed) {
      try {
        this.emit('connection_changed', { connected, error: this.lastError })
      } catch (e) {}
    }
  }

  getStatus() {
    return {
      connected: this.connected,
      wsConnected: this.wsConnected,
      name: this.name,
      url: this.url,
      lastError: this.lastError
    }
  }

  // Falha transitória (ha_network/ha_timeout): uma leve queda de rede não deve
  // derrubar a conexão nem mostrar a tela de "desconectado" na UI. Mantém o
  // provider conectado na primeira falha, agenda um probe de recuperação e só
  // marca desconectado quando as falhas consecutivas persistem.
  _handleTransientFailure(err) {
    this._transientErrCount++
    if (this.connected && this._transientErrCount < TRANSIENT_ERRORS_BEFORE_DISCONNECT) {
      // Ainda conectado: registra o erro para diagnóstico, mas não derruba.
      if (this.lastError !== err?.message) this.lastError = err?.message || 'Falha ao comunicar com o Home Assistant'
      this._scheduleDisconnectProbe()
      return
    }
    this._transientErrCount = 0
    this._setConnected(false, err?.message || 'Falha ao comunicar com o Home Assistant')
  }

  _scheduleDisconnectProbe() {
    if (this._disconnectCheckTimer) clearTimeout(this._disconnectCheckTimer)
    this._disconnectCheckTimer = setTimeout(async () => {
      this._disconnectCheckTimer = null
      if (!this.connected || this._isDisconnecting || !this.url || !this.token) return
      try {
        await this._get('/api/config')
        // Recuperou: zera as falhas transitórias e volta ao normal.
        this._transientErrCount = 0
        if (this.lastError) {
          this.lastError = null
          try {
            this.emit('connection_changed', { connected: true, error: null })
          } catch (e) {}
        }
      } catch (err) {
        if (err?.code === 'ha_auth' || (err?.message && err.message.includes('401'))) {
          this._transientErrCount = 0
          this._setConnected(false, 'Token do Home Assistant inválido ou expirado (HTTP 401 Unauthorized)')
          return
        }
        this._handleTransientFailure(err)
      }
    }, DISCONNECT_PROBE_DELAY_MS)
    if (this._disconnectCheckTimer && typeof this._disconnectCheckTimer.unref === 'function') {
      this._disconnectCheckTimer.unref()
    }
  }

  _handleWsMessage(msg) {
    if (!msg || typeof msg !== 'object') return

    if (msg.type === 'result' && msg.id && this._wsPending.has(msg.id)) {
      const pending = this._wsPending.get(msg.id)
      clearTimeout(pending.timer)
      this._wsPending.delete(msg.id)
      if (msg.success) {
        pending.resolve(msg.result)
      } else {
        pending.reject(new Error(msg.error?.message || 'Falha na consulta ao Home Assistant'))
      }
      return
    }

    if (msg.type === 'auth_required') {
      if (this.ws && (this.ws.readyState === 1 || (WebSocket && this.ws.readyState === WebSocket.OPEN))) {
        this.ws.send(JSON.stringify({ type: 'auth', access_token: this.token }))
      }
      return
    }

    if (msg.type === 'auth_ok') {
      this.wsConnected = true
      const subId = ++this.wsMessageId
      if (this.ws && (this.ws.readyState === 1 || (WebSocket && this.ws.readyState === WebSocket.OPEN))) {
        this.ws.send(JSON.stringify({
          id: subId,
          type: 'subscribe_events',
          event_type: 'state_changed'
        }))
      }
      // Room names come from the registries, not from /api/states.
      this._areasAttempted = false
      this._loadAreaRegistry().catch(() => {})
      return
    }

    if (msg.type === 'auth_invalid') {
      console.warn('[HAProvider] Autenticação WebSocket recusada pelo Home Assistant:', msg.message)
      this.wsConnected = false
      this._rejectPendingWsRequests('Autenticação do WebSocket recusada')
      this._setConnected(false, 'Token do Home Assistant inválido ou expirado (HTTP 401 Unauthorized)')
      return
    }

    if (msg.type === 'event' && msg.event && msg.event.event_type === 'state_changed') {
      const eventData = msg.event.data
      if (eventData && eventData.new_state && eventData.entity_id) {
        const domain = eventData.entity_id.split('.')[0]
        if (EXCLUDED_DOMAINS.has(domain) || eventData.entity_id.startsWith('sensor.backup_')) {
          return
        }
        const normalized = this._normalizeEntity(eventData.new_state)
        const guard = this._shouldGuardState(normalized.id, normalized.state?.on)
        if (guard.guarded) {
          return
        }
        this.cachedDevices.set(normalized.id, normalized)
        this.emit('state_changed', { device: normalized, entityId: normalized.id })
      }
    }
  }

  _scheduleWsReconnect() {
    if (this.wsReconnectTimer) clearTimeout(this.wsReconnectTimer)
    if (this._isDisconnecting || !this.url || !this.token) return

    this.wsReconnectTimer = setTimeout(() => {
      if (!this._isDisconnecting && this.url && this.token) {
        this._connectWebSocket()
      }
    }, 5000)
    if (this.wsReconnectTimer && typeof this.wsReconnectTimer.unref === 'function') {
      this.wsReconnectTimer.unref()
    }
  }

  _closeWebSocket(resetConnected = true) {
    this._rejectPendingWsRequests('WebSocket do Home Assistant foi encerrado')
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer)
      this.wsReconnectTimer = null
    }
    if (this.ws) {
      const socket = this.ws
      this.ws = null
      try {
        if (typeof socket.removeAllListeners === 'function') {
          socket.removeAllListeners('error')
        }
        if (typeof socket.on === 'function') {
          socket.on('error', () => {})
        } else if (typeof socket.addEventListener === 'function') {
          try { socket.addEventListener('error', () => {}) } catch {}
        }
        if (typeof socket.terminate === 'function') {
          socket.terminate()
        } else if (typeof socket.close === 'function') {
          socket.close()
        }
      } catch {}
    }
    if (resetConnected) {
      this.wsConnected = false
    }
  }

  _isTransientSocketError(err: any): boolean {
    if (!err) return false
    if (err.code === 'ha_timeout' || err.code === 'ha_auth' || err.code === 'ha_http') {
      return false
    }
    const code = String(err.code || '').toUpperCase()
    const msg = String(err.message || '').toLowerCase()
    return (
      code === 'ECONNRESET' ||
      code === 'EPIPE' ||
      code === 'ECONNABORTED' ||
      msg.includes('socket hang up') ||
      msg.includes('econnreset')
    )
  }

  _requestOnce(method: 'GET' | 'POST', urlPath: string, payload?: any, timeoutMs = REQUEST_TIMEOUT_MS): Promise<any> {
    return new Promise((resolve, reject) => {
      let settled = false
      const parsedUrl = new URL(urlPath, this.url.replace(/\/$/, ''))
      const transport = parsedUrl.protocol === 'https:' ? https : http
      const postData = method === 'POST' ? JSON.stringify(payload ?? {}) : null

      const headers: Record<string, string | number> = {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        Connection: 'close'
      }
      if (method === 'GET') {
        headers['Cache-Control'] = 'no-cache, no-store'
        headers.Pragma = 'no-cache'
      } else if (postData !== null) {
        headers['Content-Length'] = Buffer.byteLength(postData)
      }

      const req = transport.request(
        parsedUrl.toString(),
        { method, agent: false, headers },
        (res) => {
          let body = ''
          res.on('data', (chunk) => (body += chunk))
          res.on('end', () => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            const status = res.statusCode ?? 0
            if (status >= 200 && status < 300) {
              try { resolve(JSON.parse(body)) } catch { resolve(null) }
            } else if (status === 401 || status === 403) {
              const err: any = new Error(`Token do Home Assistant inválido ou expirado (HTTP ${status})`)
              err.code = 'ha_auth'
              reject(err)
            } else {
              const err: any = new Error(`HA API error ${status}: ${body.slice(0, 200)}`)
              err.code = 'ha_http'
              reject(err)
            }
          })
        }
      )

      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        const msg = method === 'GET'
          ? 'Tempo limite ao consultar o Home Assistant (servidor lento ou offline)'
          : 'Tempo limite ao chamar o Home Assistant (servidor lento ou offline)'
        const err: any = new Error(msg)
        err.code = 'ha_timeout'
        req.destroy(err)
        reject(err)
      }, timeoutMs)

      req.on('error', (err: any) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (!err.code) err.code = 'ha_network'
        reject(err)
      })

      if (postData !== null) req.write(postData)
      req.end()
    })
  }

  async _requestWithRetry(method: 'GET' | 'POST', urlPath: string, payload?: any, timeoutMs = REQUEST_TIMEOUT_MS): Promise<any> {
    try {
      return await this._requestOnce(method, urlPath, payload, timeoutMs)
    } catch (err) {
      if (!this._isDisconnecting && this._isTransientSocketError(err)) {
        await new Promise((r) => setTimeout(r, TRANSIENT_RETRY_DELAY_MS))
        return this._requestOnce(method, urlPath, payload, timeoutMs)
      }
      throw err
    }
  }

  _get(urlPath: string): Promise<any> {
    return this._requestWithRetry('GET', urlPath, undefined, REQUEST_TIMEOUT_MS)
  }

  _post(urlPath: string, payload: any = {}): Promise<any> {
    return this._requestWithRetry('POST', urlPath, payload, SERVICE_TIMEOUT_MS)
  }

  async connect() {
    this._isDisconnecting = false
    if (!this.token) {
      throw new Error('Home Assistant token is required')
    }

    // Cooldown: if we failed to connect recently, skip the network attempt
    const now = Date.now()
    if (!this.connected && this._lastConnectAttempt && (now - this._lastConnectAttempt < 15000)) {
      const friendly = this.lastError || `O servidor Home Assistant em ${this.url} está offline ou inacessível.`
      const err = new Error(friendly)
      err.code = 'ha_cooldown'
      throw err
    }
    this._lastConnectAttempt = now

    let config = null
    let lastErr = null
    try {
      config = await this._get('/api/config')
    } catch (err) {
      lastErr = err
    }
    if (!config) {
      const code = lastErr?.code
      let friendly = `Falha ao conectar ao Home Assistant em ${this.url}: ${lastErr?.message || 'sem resposta'}`
      if (code === 'ha_auth') {
        friendly = 'Token do Home Assistant inválido ou expirado (HTTP 401). Gere um novo Long-Lived Access Token em: Perfil do usuário → Segurança → Tokens de Acesso de Longa Duração.'
        // Auth inválido é o ÚNICO caso em que derruba a conexão: o token/credencial
        // realmente não funciona, então a UI deve mostrar o card de reconexão.
        this._setConnected(false, friendly)
      } else if (code === 'ha_timeout') {
        friendly = `O servidor Home Assistant em ${this.url} demorou demais para responder. Verifique se ele está ligado e acessível.`
      } else if (code === 'ha_network') {
        friendly = `Não foi possível acessar o servidor em ${this.url} (conexão recusada ou offline). Verifique se o Home Assistant está ligado, se a URL/IP está correto e se está na mesma rede.`
      }
      // Falhas de rede/timeout NÃO derrubam uma conexão já ativa: uma queda breve
      // ou um comando que dispara ensureConnected() não pode transformar o estado
      // em "desconectado" (que derrubaria a UI). Apenas registra o erro e lança;
      // a reconexão/recovery é responsabilidade do WS e do polling em background.
      if (code !== 'ha_auth') {
        this.lastError = friendly
      }
      const err = new Error(friendly)
      err.code = code || 'ha_error'
      throw err
    }
    this._transientErrCount = 0
    this._setConnected(true)
    this._connectWebSocket()
    return {
      success: true,
      message: `Conectado ao Home Assistant (${config.version || 'desconhecido'})`,
      providerName: this.name,
      version: config.version,
      locationName: config.location_name
    }
  }

  async disconnect() {
    this._isDisconnecting = true
    if (this._disconnectCheckTimer) {
      clearTimeout(this._disconnectCheckTimer)
      this._disconnectCheckTimer = null
    }
    this._transientErrCount = 0
    this._setConnected(false)
    this._closeWebSocket(true)
    for (const entry of this._deviceCommandState.values()) {
      if (entry.desired) {
        const waiters = entry.desired.waiters
        entry.desired = null
        for (const w of waiters) {
          try { w.resolve({ success: false, error: 'Home Assistant desconectado' }) } catch {}
        }
      }
    }
    this._deviceCommandState.clear()
    this.cachedDevices.clear()
    return { success: true, message: 'Desconectado do Home Assistant' }
  }

  _getOrCreateCommandEntry(deviceId: string): DeviceCommandEntry {
    let entry = this._deviceCommandState.get(deviceId)
    if (!entry) {
      entry = {
        inFlight: null,
        desired: null,
        lastAppliedAction: undefined,
        expectedOn: undefined,
        guardUntil: 0
      }
      this._deviceCommandState.set(deviceId, entry)
    }
    return entry
  }

  _shouldGuardState(
    deviceId: string,
    incomingOn: boolean | undefined
  ): { guarded: boolean; expectedOn?: boolean } {
    const entry = this._deviceCommandState.get(deviceId)
    if (!entry || entry.expectedOn === undefined) return { guarded: false }
    const isActive = Boolean(entry.inFlight) || Date.now() < entry.guardUntil
    if (!isActive) return { guarded: false }
    // Once HA reports the state we already intended, let the real update through.
    if (incomingOn === entry.expectedOn) {
      return { guarded: false }
    }
    return { guarded: true, expectedOn: entry.expectedOn }
  }

  _applyGuardToNormalized(device: any): any {
    if (!device || !device.id) return device
    const guard = this._shouldGuardState(device.id, device.state?.on)
    if (!guard.guarded || guard.expectedOn === undefined) return device
    const expectedOn = guard.expectedOn
    if (!device.state) device.state = {}
    device.state.on = expectedOn
    device.state.rawState = expectedOn ? 'on' : 'off'
    if (device.domain === 'cover') device.state.isOpen = expectedOn
    if (device.domain === 'lock') device.state.locked = !expectedOn
    return device
  }

  _applyOptimisticDeviceState(
    deviceId: string,
    on: boolean,
    params: Record<string, any> = {},
    clearGuard = false
  ): boolean | undefined {
    const entry = this._getOrCreateCommandEntry(deviceId)
    if (clearGuard) {
      entry.expectedOn = undefined
      entry.guardUntil = 0
    } else {
      entry.expectedOn = on
      entry.guardUntil = Date.now() + STATE_GUARD_MS
    }

    const domain = deviceId.split('.')[0]
    const existing = this.cachedDevices.get(deviceId)
    const previousOn = existing?.state?.on
    const brightnessVal =
      params.brightness !== undefined && params.brightness !== null
        ? params.brightness
        : params.brightness_pct

    if (existing) {
      if (!existing.state) existing.state = {}
      existing.state.on = on
      existing.state.rawState = on ? 'on' : 'off'
      if (domain === 'cover') existing.state.isOpen = on
      if (domain === 'lock') existing.state.locked = !on
      if (domain === 'light' && brightnessVal !== undefined && brightnessVal !== null) {
        const b = Number(brightnessVal)
        if (Number.isFinite(b)) {
          existing.state.brightness = Math.max(0, Math.min(100, Math.round(b)))
        }
      }
      this.cachedDevices.set(deviceId, existing)
      this.emit('state_changed', {
        device: existing,
        entityId: deviceId,
        optimistic: !clearGuard
      })
    } else {
      this.emit('state_changed', {
        device: { id: deviceId, domain, state: { on, rawState: on ? 'on' : 'off' } },
        entityId: deviceId,
        optimistic: !clearGuard
      })
    }
    return previousOn
  }

  async listDevices() {
    if (!this.connected && this.url && this.token) {
      try {
        await this.connect()
      } catch (err) {
        this._setConnected(false, err.message)
      }
    }

    if (!this.connected) {
      // Sem conexão ativa: não devolve cache obsoleto — a UI deve avisar o usuário.
      return []
    }

    // Rooms are resolved from the registries once per WebSocket session; if the
    // map is still empty (e.g. the socket reconnected mid-listing), try again
    // before normalizing the entities.
    if (!this._areasAttempted && this.wsConnected && this._areaByEntity.size === 0) {
      await this._loadAreaRegistry().catch(() => {})
    }

    try {
      const states = await this._get('/api/states')
      const devices = states
        .filter((s) => {
          const domain = s.entity_id?.split('.')[0]
          if (!domain || EXCLUDED_DOMAINS.has(domain)) return false
          if (s.entity_id.startsWith('sensor.backup_')) return false
          return Boolean(HA_DOMAINS[domain] || s.attributes?.friendly_name)
        })
        .map((s) => this._applyGuardToNormalized(this._normalizeEntity(s)))

      this.cachedDevices.clear()
      devices.forEach((d) => this.cachedDevices.set(d.id, d))
      this.lastError = null
      return devices
    } catch (err) {
      // Erros ao listar dispositivos NÃO derrubam a conexão.
      // Apenas auth inválido (401) marca desconectado — os demais são
      // falhas transitórias que o SSE/WebSocket vai recuperar.
      if (err.code === 'ha_auth' || (err.message && err.message.includes('401'))) {
        this._setConnected(false, 'Token do Home Assistant inválido ou expirado (HTTP 401 Unauthorized)')
      } else {
        this.lastError = err.message
      }
      console.warn('[HAProvider] Erro ao listar dispositivos:', err.message)
      return []
    }
  }

  async getDeviceState(deviceId) {
    if (!this.connected || !deviceId) return null

    try {
      const state = await this._get(`/api/states/${encodeURIComponent(deviceId)}?refresh=${Date.now()}`)
      if (!state) return null
      const device = this._applyGuardToNormalized(this._normalizeEntity(state))
      this.cachedDevices.set(device.id, device)
      return device
    } catch (err) {
      // Erros em getDeviceState NUNCA devem derrubar a conexão. A reconexão
      // é responsabilidade exclusiva de connect()/listDevices explícito.
      // Apenas loga o erro e retorna null — o chamador decide se quer retry.
      console.warn('[HAProvider] Erro ao consultar estado do dispositivo:', err.message)
      return null
    }
  }

  _buildPowerRequest(
    deviceId: string,
    action: 'turnOn' | 'turnOff',
    params: Record<string, any> = {}
  ): { servicePath: string; payload: Record<string, any> } {
    const domain = deviceId.split('.')[0]
    if (action === 'turnOff') {
      let servicePath = `/api/services/${domain}/turn_off`
      if (domain === 'lock') servicePath = `/api/services/lock/lock`
      else if (domain === 'cover') servicePath = `/api/services/cover/close_cover`
      return {
        servicePath,
        payload: { entity_id: deviceId, ...params }
      }
    }

    const haPayload: any = { entity_id: deviceId }
    let servicePath = `/api/services/${domain}/turn_on`
    if (domain === 'lock') {
      servicePath = `/api/services/lock/unlock`
    } else if (domain === 'cover') {
      servicePath = `/api/services/cover/open_cover`
    }

    if (domain === 'light') {
      if (params.brightness !== undefined && params.brightness !== null) {
        haPayload.brightness_pct = Math.max(0, Math.min(100, Number(params.brightness)))
      }
      if (params.color) {
        const parsed = parseColor(params.color)
        if (parsed) Object.assign(haPayload, parsed)
      }
      if (params.color_temp) {
        const kelvin = Number(params.color_temp)
        if (Number.isFinite(kelvin)) {
          haPayload.color_temp_kelvin = Math.max(2000, Math.min(6500, kelvin))
        }
      }
    }

    for (const key of Object.keys(params)) {
      if (!['brightness', 'color', 'color_temp'].includes(key)) {
        haPayload[key] = params[key]
      }
    }

    return { servicePath, payload: haPayload }
  }

  async _executePowerPost(
    deviceId: string,
    action: 'turnOn' | 'turnOff',
    params: Record<string, any> = {}
  ): Promise<any> {
    const { servicePath, payload } = this._buildPowerRequest(deviceId, action, params)
    await this._post(servicePath, payload)
    this._transientErrCount = 0
    if (!this.connected) {
      this._setConnected(true)
    }
    return action === 'turnOn'
      ? { success: true, deviceId, action: 'turnOn', payload }
      : { success: true, deviceId, action: 'turnOff' }
  }

  async _drainDeviceQueue(deviceId: string, initialPreviousOn?: boolean): Promise<void> {
    const entry = this._getOrCreateCommandEntry(deviceId)
    let fallbackOn = initialPreviousOn

    while (entry.desired) {
      const current = entry.desired
      entry.desired = null

      const targetOn = current.action === 'turnOn'
      const hasExtraParams = current.action === 'turnOn' && Object.keys(current.params).length > 0

      // If rapid clicks cancelled out back to the state that just completed, skip HA I/O.
      if (current.action === entry.lastAppliedAction && !hasExtraParams) {
        entry.expectedOn = targetOn
        entry.guardUntil = Date.now() + STATE_GUARD_MS
        const result = targetOn
          ? { success: true, deviceId, action: 'turnOn', payload: { entity_id: deviceId } }
          : { success: true, deviceId, action: 'turnOff' }
        for (const w of current.waiters) w.resolve(result)
        continue
      }

      const rollbackOn =
        entry.lastAppliedAction !== undefined
          ? entry.lastAppliedAction === 'turnOn'
          : (fallbackOn ?? !targetOn)

      try {
        const result = await this._executePowerPost(deviceId, current.action, current.params)
        entry.lastAppliedAction = current.action
        fallbackOn = targetOn
        if (!entry.desired) {
          entry.expectedOn = targetOn
          entry.guardUntil = Date.now() + STATE_GUARD_MS
          const cached = this.cachedDevices.get(deviceId)
          if (cached) {
            if (!cached.state) cached.state = {}
            cached.state.on = targetOn
            cached.state.rawState = targetOn ? 'on' : 'off'
            this.cachedDevices.set(deviceId, cached)
            this.emit('state_changed', { device: cached, entityId: deviceId })
          }
        }
        for (const w of current.waiters) w.resolve(result)
      } catch (err: any) {
        if (!entry.desired) {
          this._applyOptimisticDeviceState(deviceId, rollbackOn, {}, true)
        }
        const failRes = { success: false, error: err?.message || String(err) }
        for (const w of current.waiters) w.resolve(failRes)
      }
    }
  }

  _enqueuePowerCommand(
    deviceId: string,
    action: 'turnOn' | 'turnOff',
    params: Record<string, any> = {}
  ): Promise<any> {
    const entry = this._getOrCreateCommandEntry(deviceId)
    const targetOn = action === 'turnOn'
    const previousBeforeOptimistic = this.cachedDevices.get(deviceId)?.state?.on

    this._applyOptimisticDeviceState(deviceId, targetOn, params)

    return new Promise((resolve) => {
      const waiter: QueuedCommandWaiter = { resolve }
      if (entry.desired) {
        const nextParams =
          action === 'turnOn'
            ? (entry.desired.action === 'turnOn' ? { ...entry.desired.params, ...params } : { ...params })
            : {}
        entry.desired = {
          action,
          params: nextParams,
          waiters: [...entry.desired.waiters, waiter]
        }
      } else {
        entry.desired = {
          action,
          params: action === 'turnOn' ? { ...params } : {},
          waiters: [waiter]
        }
      }

      if (!entry.inFlight) {
        entry.inFlight = this._drainDeviceQueue(deviceId, previousBeforeOptimistic).finally(() => {
          entry.inFlight = null
        })
      }
    })
  }

  async turnOn(deviceId, params: any = {}) {
    return this._enqueuePowerCommand(deviceId, 'turnOn', params || {})
  }

  async turnOff(deviceId, params = {}) {
    return this._enqueuePowerCommand(deviceId, 'turnOff', params || {})
  }

  async toggle(deviceId) {
    const domain = deviceId.split('.')[0]
    const device = this.cachedDevices.get(deviceId)
    const entry = this._getOrCreateCommandEntry(deviceId)
    const toggleDomains = new Set(['light', 'switch', 'fan', 'automation', 'input_boolean'])

    // If a command is already in flight, coalesce this toggle onto desired state
    // using the latest intended state instead of firing another blind /toggle POST.
    if (entry.inFlight || !toggleDomains.has(domain)) {
      const currentIntendedOn = entry.desired
        ? entry.desired.action === 'turnOn'
        : (entry.expectedOn !== undefined && (entry.inFlight || Date.now() < entry.guardUntil)
            ? entry.expectedOn
            : Boolean(device?.state?.on))
      return currentIntendedOn ? this.turnOff(deviceId) : this.turnOn(deviceId)
    }

    const currentOn =
      entry.expectedOn !== undefined && Date.now() < entry.guardUntil
        ? entry.expectedOn
        : Boolean(device?.state?.on)
    const nextOn = !currentOn
    const previousBeforeOptimistic = this.cachedDevices.get(deviceId)?.state?.on

    this._applyOptimisticDeviceState(deviceId, nextOn)

    let toggleResult: any = null
    const run = (async () => {
      try {
        await this._post(`/api/services/${domain}/toggle`, { entity_id: deviceId })
        this._transientErrCount = 0
        if (!this.connected) this._setConnected(true)
        entry.lastAppliedAction = nextOn ? 'turnOn' : 'turnOff'
        if (!entry.desired) {
          entry.expectedOn = nextOn
          entry.guardUntil = Date.now() + STATE_GUARD_MS
          const cached = this.cachedDevices.get(deviceId)
          if (cached) {
            if (!cached.state) cached.state = {}
            cached.state.on = nextOn
            cached.state.rawState = nextOn ? 'on' : 'off'
            this.cachedDevices.set(deviceId, cached)
            this.emit('state_changed', { device: cached, entityId: deviceId })
          }
        }
        toggleResult = { success: true, deviceId, action: 'toggle' }
      } catch (err: any) {
        if (!entry.desired) {
          const rollbackOn =
            entry.lastAppliedAction !== undefined
              ? entry.lastAppliedAction === 'turnOn'
              : (previousBeforeOptimistic ?? currentOn)
          this._applyOptimisticDeviceState(deviceId, rollbackOn, {}, true)
        }
        toggleResult = { success: false, error: err?.message || String(err) }
      }

      if (entry.desired) {
        await this._drainDeviceQueue(deviceId, previousBeforeOptimistic)
      }
    })()

    entry.inFlight = run.finally(() => {
      entry.inFlight = null
    })
    await entry.inFlight
    return toggleResult
  }

  async sendRemoteCommand(deviceId, command, extra: any = {}) {
    const domain = deviceId.split('.')[0]
    const cmdUpper = String(Array.isArray(command) ? command[0] : command).toUpperCase().trim()

    // Encontrar entidades de TV relacionadas (ex: media_player.tv_thucos_2, remote.tv_thucos)
    let relatedEntities = []
    try {
      const baseName = deviceId.split('.')[1].replace(/_\d+$/, '')
      const states = await this._get('/api/states')
      relatedEntities = states.filter(s => {
        const id = s.entity_id
        return (id.startsWith('media_player.') || id.startsWith('remote.')) && id.includes(baseName)
      })
    } catch (e) {}

    const mediaPlayers = relatedEntities.filter(s => s.entity_id.startsWith('media_player.'))
    const remotes = relatedEntities.filter(s => s.entity_id.startsWith('remote.'))

    if (cmdUpper === 'YOUTUBE' || cmdUpper === 'NETFLIX') {
      const appId = cmdUpper === 'YOUTUBE' ? 'com.google.android.youtube.tv' : 'com.netflix.ninja'
      let executed = false
      let lastErr = null

      for (const mp of mediaPlayers) {
        try {
          await this._post('/api/services/media_player/play_media', { entity_id: mp.entity_id, media_content_type: 'app', media_content_id: appId })
          executed = true
        } catch (e) { lastErr = e }
      }
      for (const rm of remotes) {
        try {
          await this._post('/api/services/remote/turn_on', { entity_id: rm.entity_id, activity: appId })
          executed = true
        } catch (e) { lastErr = e }
      }

      // Só reporta sucesso se ao menos uma chamada REAL executou; senão erra
      // com a última mensagem em vez de cair no fallback genérico (M4).
      if (executed) return { success: true }
      const msg = lastErr?.message || 'nenhuma entidade de TV/remote correspondente'
      console.warn('[HAProvider] Falha ao abrir o app via media/remote:', msg)
      return { success: false, error: `Não foi possível abrir ${cmdUpper}: ${msg}` }
    }

    const inputActivityMap = {
      'HDMI 1': 'passthrough://media_1',
      'HDMI1': 'passthrough://media_1',
      'HDMI 2': 'passthrough://media_2',
      'HDMI2': 'passthrough://media_2',
      'HDMI 3': 'passthrough://media_3',
      'HDMI3': 'passthrough://media_3',
      'TV': 'passthrough://media_0',
      'AV': 'passthrough://media_av'
    }

    const isTvCmd = cmdUpper === 'TV' || cmdUpper === 'TV1' || cmdUpper === 'LIVE TV' || cmdUpper === 'TV AO VIVO'
    const isInputCmd = Boolean(inputActivityMap[cmdUpper]) || isTvCmd

    // Any command that matches the player's own source list is a source switch,
    // even when it is not one of the mapped labels (e.g. "Apple TV"). Reserved
    // media/navigation buttons are never treated as sources, so a TV with a
    // source called "Play" or "Music" does not hijack the play button.
    const RESERVED_MEDIA_COMMANDS = new Set([
      'PLAY', 'PAUSE', 'PLAY_PAUSE', 'STOP', 'PREV', 'PREVIOUS', 'NEXT',
      'UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER', 'OK', 'BACK', 'HOME', 'MENU',
      'VOLUME_UP', 'VOL_UP', 'VOLUME_DOWN', 'VOL_DOWN', 'MUTE', 'UNMUTE'
    ])
    if (!isInputCmd && !RESERVED_MEDIA_COMMANDS.has(cmdUpper) && typeof command === 'string') {
      const wantedSource = command.toLowerCase().trim()
      for (const mp of mediaPlayers) {
        const sourceMatch = (mp.attributes?.source_list || []).find(
          (s) => String(s).toLowerCase().trim() === wantedSource
        )
        if (!sourceMatch) continue
        try {
          await this._post('/api/services/media_player/select_source', { entity_id: mp.entity_id, source: sourceMatch })
          const confirmed = await this._confirmSource(mp.entity_id, [sourceMatch])
          if (confirmed !== false) return { success: true }
        } catch (e) {
          // fall through to the generic input chain below
        }
      }
    }

    if (isInputCmd) {
      const act = inputActivityMap[cmdUpper] || 'passthrough://media_0'
      let inputExecuted = false
      let inputLastErr = null

      const attempt = async (fn) => {
        try {
          await fn()
          inputExecuted = true
        } catch (e) {
          inputLastErr = e
        }
      }
      // Stops the fallback chain as soon as the TV reports the requested
      // source. When the player does not expose `source`, verification is
      // impossible and the full chain still runs (previous behavior).
      const confirmedSwitch = async (entityId, candidates) => {
        const verdict = await this._confirmSource(entityId, candidates)
        return verdict === true
      }

      // 1. select_source with the exact command label
      for (const mp of mediaPlayers) {
        await attempt(() => this._post('/api/services/media_player/select_source', { entity_id: mp.entity_id, source: command }))
        if (await confirmedSwitch(mp.entity_id, [command])) return { success: true }
      }

      // 2. Live-TV aliases from the official source_list
      if (isTvCmd) {
        for (const mp of mediaPlayers) {
          if (!Array.isArray(mp.attributes?.source_list)) continue
          const matchedSource = mp.attributes.source_list.find((s) => {
            const l = String(s).toLowerCase().trim()
            return l === 'tv' || l === 'live tv' || l === 'tv ao vivo' || l === 'dtv' || l === 'tv/dtv' || l === 'antenna' || l === 'tuner' || l === 'sintonizador'
          })
          if (!matchedSource) continue
          await attempt(() => this._post('/api/services/media_player/select_source', { entity_id: mp.entity_id, source: matchedSource }))
          if (await confirmedSwitch(mp.entity_id, [matchedSource, 'tv', 'live tv'])) return { success: true }
        }
      }

      // 3. play_media with the passthrough URI and the TV tuner app
      for (const mp of mediaPlayers) {
        await attempt(() => this._post('/api/services/media_player/play_media', { entity_id: mp.entity_id, media_content_type: 'app', media_content_id: act }))
        if (await confirmedSwitch(mp.entity_id, [command, act])) return { success: true }
        if (isTvCmd) {
          await attempt(() => this._post('/api/services/media_player/play_media', { entity_id: mp.entity_id, media_content_type: 'app', media_content_id: 'com.tcl.tv' }))
          if (await confirmedSwitch(mp.entity_id, [command])) return { success: true }
        }
      }

      // 4. Remote fallbacks (activity + universal input commands). Kept
      // unconditional so setups that cannot confirm the source keep working.
      for (const rm of remotes) {
        await attempt(() => this._post('/api/services/remote/turn_on', { entity_id: rm.entity_id, activity: act }))
        for (const inputCmd of ['TV_INPUT', 'INPUT', 'TV', 'LIVE_TV']) {
          await attempt(() => this._post('/api/services/remote/send_command', { entity_id: rm.entity_id, command: [inputCmd] }))
        }
      }

      // Só reporta sucesso se ao menos uma chamada REAL executou (M4).
      if (inputExecuted) return { success: true }
      const inputMsg = inputLastErr?.message || 'nenhuma entidade de TV/remote correspondente'
      console.warn('[HAProvider] Falha ao trocar entrada da TV:', inputMsg)
      return { success: false, error: `Não foi possível alternar para ${cmdUpper}: ${inputMsg}` }
    }

    if (domain === 'remote') {
      // B9: send_command só é válido para entidades do domínio remote. Se um
      // media_player chegar aqui, use o remote correspondente ou falhe claro.
      if (typeof deviceId !== 'string' || !deviceId.startsWith('remote.')) {
        return { success: false, error: 'Comando de controle remoto requer uma entidade do domínio remote (ex.: remote.tv_sala).' }
      }
      const remoteCmdMap = {
        UP: 'DPAD_UP',
        DOWN: 'DPAD_DOWN',
        LEFT: 'DPAD_LEFT',
        RIGHT: 'DPAD_RIGHT',
        ENTER: 'DPAD_CENTER',
        OK: 'DPAD_CENTER',
        PLAY: 'MEDIA_PLAY',
        PAUSE: 'MEDIA_PAUSE',
        PLAY_PAUSE: 'MEDIA_PLAY_PAUSE',
        PREV: 'MEDIA_PREVIOUS',
        PREVIOUS: 'MEDIA_PREVIOUS',
        NEXT: 'MEDIA_NEXT',
        VOLUME_UP: 'VOLUME_UP',
        VOL_UP: 'VOLUME_UP',
        VOLUME_DOWN: 'VOLUME_DOWN',
        VOL_DOWN: 'VOLUME_DOWN',
        MUTE: 'MUTE',
        BACK: 'BACK',
        HOME: 'HOME',
        TV: 'TV_INPUT',
        AV: 'TV_INPUT',
        INPUT: 'TV_INPUT',
        TV_INPUT: 'TV_INPUT'
      }

      const targetCmd = remoteCmdMap[cmdUpper] || cmdUpper
      // Remote button names are identifiers; reject anything else so an
      // arbitrary model-provided string never reaches the device blindly.
      if (typeof targetCmd !== 'string' || !/^[A-Za-z0-9_ -]+$/.test(targetCmd)) {
        return { success: false, error: `Comando remoto inválido: ${command}` }
      }
      const commandArray = [targetCmd]
      return this._post('/api/services/remote/send_command', { entity_id: deviceId, command: commandArray, ...extra })
    }

    // 2. Comandos de navegação / ação em media_player
    if (['UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER', 'OK', 'BACK', 'HOME', 'MENU'].includes(cmdUpper)) {
      try {
        return await this._post('/api/services/media_player/play_media', {
          entity_id: deviceId,
          media_content_type: 'action',
          media_content_id: cmdUpper === 'ENTER' ? 'DPAD_CENTER' : (cmdUpper === 'UP' ? 'DPAD_UP' : (cmdUpper === 'DOWN' ? 'DPAD_DOWN' : (cmdUpper === 'LEFT' ? 'DPAD_LEFT' : (cmdUpper === 'RIGHT' ? 'DPAD_RIGHT' : cmdUpper))))
        })
      } catch (e) {}
    }

    return this.controlMedia(deviceId, command, extra.value)
  }

  async controlMedia(deviceId, action, value) {
    const domain = deviceId.split('.')[0]
    const serviceMap = {
      play: 'media_play',
      pause: 'media_pause',
      stop: 'media_stop',
      next: 'media_next_track',
      previous: 'media_previous_track',
      volume_up: 'volume_up',
      volume_down: 'volume_down'
    }
    // Only known actions may become service names. Without this check an
    // arbitrary value would be interpolated into the request path, allowing
    // path traversal to any endpoint on the Home Assistant host.
    const allowedActions = new Set([...Object.keys(serviceMap), 'volume', 'mute', 'unmute', 'source'])
    if (typeof action !== 'string' || !allowedActions.has(action)) {
      return { success: false, error: `Ação de mídia inválida: ${action}` }
    }

    if (action === 'volume' && value !== undefined) {
      const level = Number(value) / 100
      if (!Number.isFinite(level)) {
        return { success: false, error: `Nível de volume inválido: ${value}` }
      }
      return this._post('/api/services/media_player/volume_set', {
        entity_id: deviceId,
        volume_level: Math.max(0, Math.min(1, level))
      })
    }
    if (action === 'mute') {
      return this._post('/api/services/media_player/volume_mute', { entity_id: deviceId, is_volume_muted: true })
    }
    if (action === 'unmute') {
      return this._post('/api/services/media_player/volume_mute', { entity_id: deviceId, is_volume_muted: false })
    }
    if (action === 'source' && value) {
      return this._post('/api/services/media_player/select_source', { entity_id: deviceId, source: value })
    }

    const service = serviceMap[action]
    if (!service) {
      return { success: false, error: `Ação de mídia inválida: ${action}` }
    }
    return this._post(`/api/services/${domain}/${service}`, { entity_id: deviceId })
  }

  async setClimate(deviceId, temperature, hvacMode) {
    if ((temperature === undefined || temperature === null || temperature === '') && !hvacMode) {
      return { success: false, error: 'Informe a temperatura ou o modo de operação do clima.' }
    }
    const results = []
    if (temperature !== undefined && temperature !== null) {
      const tempNum = Number(temperature)
      if (!Number.isFinite(tempNum)) {
        return { success: false, error: `Temperatura inválida: ${temperature}` }
      }
      const res = await this._post('/api/services/climate/set_temperature', {
        entity_id: deviceId,
        temperature: tempNum
      })
      results.push(res)
    }
    if (hvacMode) {
      const res = await this._post('/api/services/climate/set_hvac_mode', {
        entity_id: deviceId,
        hvac_mode: hvacMode
      })
      results.push(res)
    }
    return { success: true, results }
  }

  async callService(domain, service, data: any = {}) {
    // Allow direct service dispatch whenever host+token are configured so a
    // transient /api/config hiccup does not block user-initiated actions.
    if (!this.connected && (!this.url || !this.token)) {
      throw new Error('Home Assistant offline ou desconectado')
    }
    // Segurança: valida domain/service para impedir path traversal — valores
    // como "../config" ou "config" normalizariam para endpoints arbitrários.
    // Domínios/serviços do HA são [a-z0-9_] (ex.: light.turn_on).
    const SAFE_PATH_RE = /^[a-z_][a-z0-9_]*$/
    if (typeof domain !== 'string' || !SAFE_PATH_RE.test(domain)) {
      throw new Error('Domínio inválido. Use apenas letras minúsculas e underscore (ex.: light, media_player).')
    }
    if (typeof service !== 'string' || !SAFE_PATH_RE.test(service)) {
      throw new Error('Serviço inválido. Use apenas letras minúsculas e underscore (ex.: turn_on, select_source).')
    }
    if ((service === 'turn_on' || service === 'turn_off') && typeof data?.entity_id === 'string') {
      this._applyOptimisticDeviceState(data.entity_id, service === 'turn_on', data)
    }
    const res = await this._post(`/api/services/${domain}/${service}`, data)
    this._transientErrCount = 0
    if (!this.connected) {
      this._setConnected(true)
    }
    return res
  }

  _normalizeEntity(state) {
    const domain = state.entity_id?.split('.')[0]
    const domainInfo = HA_DOMAINS[domain] || { name: domain, icon: 'help' }
    const attrs = state.attributes || {}
    const rawState = String(state.state || '').toLowerCase().trim()

    let isOn = false
    if (domain === 'light' || domain === 'switch' || domain === 'fan' || domain === 'automation' || domain === 'remote' || domain === 'input_boolean') {
      isOn = rawState === 'on' || rawState === 'home' || rawState === 'active'
    } else if (domain === 'climate') {
      isOn = rawState !== 'off' && rawState !== 'unavailable' && rawState !== 'unknown'
    } else if (domain === 'media_player') {
      isOn = rawState !== 'off' && rawState !== 'standby' && rawState !== 'unavailable' && rawState !== 'unknown'
    } else if (domain === 'lock') {
      isOn = rawState === 'unlocked' || rawState === 'unlocking'
    } else if (domain === 'cover') {
      isOn = rawState === 'open' || rawState === 'opening'
    } else if (domain === 'vacuum') {
      isOn = rawState === 'cleaning' || rawState === 'returning' || rawState === 'on'
    } else if (domain === 'sensor' || domain === 'sun' || domain === 'weather') {
      isOn = false
    } else {
      isOn = rawState === 'on' || rawState === 'home' || rawState === 'open' || rawState === 'playing' || rawState === 'active' || (rawState !== 'off' && rawState !== 'unavailable' && rawState !== 'unknown' && rawState !== 'standby' && rawState !== 'closed' && rawState !== 'locked')
    }

    const normalized: any = {
      id: state.entity_id,
      name: attrs.friendly_name || state.entity_id,
      type: domainInfo.name,
      domain,
      icon: domainInfo.icon,
      provider: this.name,
      room: this._areaByEntity.get(state.entity_id) || attrs.area_id || attrs.area || '',
      online: rawState !== 'unavailable' && rawState !== 'unknown',
      state: {
        on: isOn,
        rawState: state.state
      },
      attributes: {
        deviceClass: attrs.device_class || null,
        unitOfMeasurement: attrs.unit_of_measurement || null,
        haIcon: attrs.icon || null
      }
    }

    if (domain === 'light') {
      const prevBrightness = this.cachedDevices?.get?.(state.entity_id)?.state?.brightness
      const supportedModes = attrs.supported_color_modes
      const supportsBrightness = Array.isArray(supportedModes)
        ? supportedModes.some((m: string) => m !== 'onoff')
        : ((attrs.supported_features !== undefined ? Boolean(Number(attrs.supported_features) & 1) : true))

      const hasBrightness = attrs.brightness !== undefined && attrs.brightness !== null
      normalized.state.brightness = hasBrightness
        ? Math.round((attrs.brightness / 255) * 100)
        : (prevBrightness ?? (supportsBrightness ? 100 : null))
      normalized.state.colorTemp = attrs.color_temp || null
      normalized.state.colorTempKelvin = attrs.color_temp_kelvin || (attrs.color_temp ? Math.round(1000000 / attrs.color_temp) : null)

      let rgb = null
      if (Array.isArray(attrs.rgb_color) && attrs.rgb_color.length === 3) {
        rgb = attrs.rgb_color
      }
      normalized.state.rgbColor = rgb
      normalized.state.hexColor = rgb
        ? `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`
        : null

      normalized.attributes.supported = domainInfo.services
    } else if (domain === 'climate') {
      normalized.state.temperature = attrs.current_temperature ?? null
      normalized.state.targetTemperature = attrs.temperature ?? null
      normalized.state.hvacMode = state.state
      normalized.state.hvacModes = attrs.hvac_modes || []
      normalized.attributes.supported = domainInfo.services
    } else if (domain === 'cover') {
      normalized.state.position = attrs.current_position ?? null
      normalized.state.isOpen = rawState === 'open' || rawState === 'opening'
    } else if (domain === 'sensor' || domain === 'binary_sensor') {
      normalized.state.value = state.state
      normalized.state.unit = attrs.unit_of_measurement || ''
    } else if (domain === 'lock') {
      normalized.state.locked = rawState === 'locked'
    } else if (domain === 'media_player') {
      normalized.state.volume = (attrs.volume_level !== undefined && attrs.volume_level !== null)
        ? attrs.volume_level
        : null
      normalized.state.isMuted = Boolean(attrs.is_volume_muted)
      normalized.state.source = attrs.source || null
      normalized.state.mediaTitle = attrs.media_title || attrs.media_content_id || null
      normalized.state.mediaArtist = attrs.media_artist || null
      normalized.state.isPlaying = rawState === 'playing'
      normalized.attributes.source_list = attrs.source_list || []
      normalized.attributes.supported = domainInfo.services
    } else if (domain === 'sun') {
      normalized.state.rawState = state.state
      normalized.state.elevation = attrs.elevation ?? null
      normalized.state.azimuth = attrs.azimuth ?? null
      normalized.state.rising = attrs.rising ?? false
      normalized.attributes.next_rising = attrs.next_rising || null
      normalized.attributes.next_setting = attrs.next_setting || null
      normalized.attributes.next_dawn = attrs.next_dawn || null
      normalized.attributes.next_dusk = attrs.next_dusk || null
    } else if (domain === 'weather') {
      normalized.state.rawState = state.state
      normalized.state.temperature = attrs.temperature ?? null
      normalized.state.temperatureUnit = attrs.temperature_unit || '°C'
      normalized.state.humidity = attrs.humidity ?? null
      normalized.state.pressure = attrs.pressure ?? null
      normalized.state.pressureUnit = attrs.pressure_unit || 'hPa'
      normalized.state.windSpeed = attrs.wind_speed ?? null
      normalized.state.windSpeedUnit = attrs.wind_speed_unit || 'km/h'
    }

    return normalized
  }
}

module.exports = HomeAssistantProvider

