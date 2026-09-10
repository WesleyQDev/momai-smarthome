const fs = require('fs')
const os = require('os')
const path = require('path')
// Isola o data dir (ações de automação, .encryption-key) num dir temporário
// para os testes não gravarem no repositório nem dependerem do ambiente.
const testDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'momai-smarthome-data-'))
process.env.MOMAI_DATA_DIR = testDataDir
const MomAIHomeConnector = require('./src/index.ts')

function cleanupTestData() {
  try {
    fs.rmSync(testDataDir, { recursive: true, force: true })
  } catch {}
}

async function runTests() {
  console.log('=== MomAI Smart Home - Test Runner ===\n')
  let passed = 0
  let failed = 0

  function assert(name, condition) {
    if (condition) {
      console.log(`  ✅ ${name}`)
      passed++
    } else {
      console.log(`  ❌ ${name}`)
      failed++
    }
  }

  // Test 1: init() returns status
  try {
    const status = await MomAIHomeConnector.init()
    assert('init() retorna status', status && typeof status.connected === 'boolean')
    assert('init() retorna connections array', Array.isArray(status.connections))
    assert('init() retorna providerStatus', status.providerStatus && typeof status.providerStatus === 'object')
  } catch (err) {
    console.log(`  ❌ init() lançou exceção: ${err.message}`)
    failed++
  }

  // Test 2: getStatus() returns expected shape
  const freshStatus = MomAIHomeConnector.getStatus()
  assert('getStatus().connected é booleano', typeof freshStatus.connected === 'boolean')
  assert('getStatus().connections é array', Array.isArray(freshStatus.connections))

  // Test 3: getDevices() returns array when disconnected
  const devices = await MomAIHomeConnector.getDevices()
  assert('getDevices() retorna array', Array.isArray(devices))

  // Test 4: disconnectAll() returns success
  const discResult = await MomAIHomeConnector.disconnectAll()
  assert('disconnectAll() retorna success', discResult && discResult.success === true)

  // Test 5: Connection storage round-trip (SDK backend, no native driver)
  const { createMemoryBridge, importLegacyDatabase, CONNECTIONS_KEY, LAST_CREDENTIALS_KEY } = require('./src/sdk-backend.ts')
  const TokenManager = require('./src/auth/tokenManager.ts')
  const tmBridge = createMemoryBridge()
  const tm = new TokenManager(tmBridge)

  await tm.saveConnection('test_ha', 'homeassistant', { url: 'http://ha.local:8123', token: 'test_token' }, 'Test HA', 'test@local')
  const conn = await tm.getConnection('test_ha')
  assert('saveConnection/getConnection round-trip', conn && conn.id === 'test_ha' && conn.providerType === 'homeassistant' && conn.config.url === 'http://ha.local:8123')

  const list = await tm.listConnections()
  assert('listConnections retorna array', Array.isArray(list) && list.length === 1 && list[0].auto_connect === 1)

  const tmSecondInstance = new TokenManager(tmBridge)
  const connPersist = await tmSecondInstance.getConnection('test_ha')
  assert('recupera e descriptografa conexão em nova instância', connPersist && connPersist.config && connPersist.config.token === 'test_token')

  await tm.removeConnection('test_ha')
  const afterDel = await tm.getConnection('test_ha')
  assert('removeConnection funciona', afterDel === null)

  // Legacy import: rows from the old sqlite file land in the SDK store once,
  // including plaintext configs, without touching the native driver here.
  const legacyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'momai-smarthome-legacy-'))
  const legacyDbPath = path.join(legacyDir, 'smarthome.sqlite')
  fs.writeFileSync(legacyDbPath, 'placeholder')
  const legacyBridge = createMemoryBridge()
  const legacyRows = [
    { id: 'legacy_plain', provider_type: 'homeassistant', name: 'Legacy HA', config_encrypted: JSON.stringify({ url: 'http://legacy.local:8123', token: 'legacy_token' }), user_email: 'local', auto_connect: 1, updated_at: '2026-01-01T00:00:00.000Z' }
  ]
  const fakeOpen = () => ({ all: () => legacyRows, close: () => {} })
  const legacyImport = await importLegacyDatabase({ dbPath: legacyDbPath, bridge: legacyBridge, openDb: fakeOpen })
  const legacyTm = new TokenManager(legacyBridge)
  const legacyConnection = await legacyTm.getConnection('legacy_plain')
  const legacyStored = ((await legacyBridge.storage.get(CONNECTIONS_KEY)) || {}).legacy_plain
  assert('importador legado migra conexão plaintext para o SDK', legacyImport.imported === true && legacyConnection && legacyConnection.config.token === 'legacy_token')
  assert('plaintext importado é re-criptografado no SDK', legacyStored && legacyStored.config && legacyStored.config.encryptedData && legacyStored.config.iv && legacyStored.config.authTag)
  const legacyReimport = await importLegacyDatabase({ dbPath: legacyDbPath, bridge: legacyBridge, openDb: fakeOpen })
  assert('importador legado roda uma única vez', legacyReimport.imported === false)
  fs.rmSync(legacyDir, { recursive: true, force: true })

  // Test 6: runtime.js tool export check
  const runtime = require('./runtime.ts')
  assert('runtime.tools é array', Array.isArray(runtime.tools))
  assert('runtime.tools contém set_light_color', runtime.tools.some(t => t.name === 'set_light_color'))
  assert('runtime.tools contém control_tv_remote', runtime.tools.some(t => t.name === 'control_tv_remote'))
  assert('runtime.tools contém control_climate', runtime.tools.some(t => t.name === 'control_climate'))
  assert('runtime.tools contém call_ha_service', runtime.tools.some(t => t.name === 'call_ha_service'))
  assert('runtime.tools contém open_device_control', runtime.tools.some(t => t.name === 'open_device_control'))

  // Test 7: executeTool returns structured result
  const unknownRes = await runtime.executeTool('unknown_tool', {}, {})
  assert('executeTool para ferramenta desconhecida retorna ok: false', unknownRes && unknownRes.ok === false)

  // Test 8: SDK storage & ensureConnected integration (single source of truth)
  const mockMomai = createMemoryBridge()

  await MomAIHomeConnector.disconnectAll(mockMomai)
  const emptyStorageConns = await mockMomai.storage.get(CONNECTIONS_KEY)
  assert('disconnectAll limpa conexões no SDK', emptyStorageConns && Object.keys(emptyStorageConns).length === 0)

  const mockTm = new TokenManager(mockMomai)
  await mockTm.saveConnection(
    'ha_test',
    'homeassistant',
    { url: 'http://ha.local:8123', token: 'mock_token' },
    'Home Assistant Test',
    'local'
  )
  const savedMock = await MomAIHomeConnector.getLastConnection(mockMomai)
  assert('conexão salva no SDK é lida pelo connector', savedMock && savedMock.url === 'http://ha.local:8123' && savedMock.token === 'mock_token')

  // Test 8a: explicit disconnect preserves the encrypted credential but disables auto-reconnect
  const Connector = MomAIHomeConnector.MomAIHomeConnector
  const isolatedBridge = createMemoryBridge()
  const isolatedConnector = new Connector({ bridge: isolatedBridge })
  let providerRegistrations = 0
  isolatedConnector.devices.disconnectAll = async () => isolatedConnector.devices.providers.clear()
  isolatedConnector.devices.registerProvider = async () => {
    providerRegistrations++
    return { success: true }
  }
  isolatedConnector.devices.listDevices = async () => []

  const firstResult = await isolatedConnector.connectToHomeAssistant('http://ha.local:8123', 'first-test-token', 'Test HA')
  const firstStored = ((await isolatedBridge.storage.get(CONNECTIONS_KEY)) || {})[firstResult.connectionId]
  assert('connectToHomeAssistant persiste conexão criptografada elegível', providerRegistrations === 1 && firstStored?.auto_connect === 1)

  await isolatedConnector.disconnectAll()
  const clearedLast = await isolatedBridge.storage.get(LAST_CREDENTIALS_KEY)
  const clearedConnections = await isolatedBridge.storage.get(CONNECTIONS_KEY)
  const preservedConnection = await isolatedConnector.tokenManager.getConnection(firstResult.connectionId)
  assert('disconnectAll desativa auto-reconexão e preserva credencial', clearedConnections && Object.values(clearedConnections).every((row) => row.auto_connect === 0) && preservedConnection?.config.token === 'first-test-token')
  assert('disconnectAll limpa storage e estado em memória', clearedLast === null && isolatedConnector.lastCredentials === null && isolatedConnector.auth.getToken() === '')

  const restartedBridge = isolatedBridge
  const restartedConnector = new Connector({ bridge: restartedBridge })
  let restartedRegistrations = 0
  restartedConnector.devices.disconnectAll = async () => restartedConnector.devices.providers.clear()
  restartedConnector.devices.registerProvider = async () => {
    restartedRegistrations++
    return { success: true }
  }
  restartedConnector.devices.listDevices = async () => []
  await restartedConnector.init()
  await restartedConnector.ensureConnected()
  const restartedLastConnection = await restartedConnector.getLastConnection()
  assert('reinício não registra provider após disconnect explícito', restartedRegistrations === 0 && (await restartedConnector.listConnections()).length === 0)
  assert('getLastConnection recupera credencial inativa após reinício', restartedLastConnection.url === 'http://ha.local:8123' && restartedLastConnection.token === 'first-test-token')

  const secondResult = await restartedConnector.connectToHomeAssistant('http://ha.local:8123', 'second-test-token', 'Test HA')
  const secondStored = ((await restartedBridge.storage.get(CONNECTIONS_KEY)) || {})[secondResult.connectionId]
  const secondPersistedConnection = await restartedConnector.tokenManager.getConnection(secondResult.connectionId)
  assert('conectar novamente reativa auto-reconexão e preserva token', restartedRegistrations === 1 && secondStored?.auto_connect === 1 && secondPersistedConnection.config.token === 'second-test-token')
  await isolatedConnector.disconnectAll()

  // Bridges isolados não enxergam os dados um do outro (separação por modo).
  const bridgeModeA = createMemoryBridge()
  const bridgeModeB = createMemoryBridge()
  await new TokenManager(bridgeModeA).saveConnection('switched_connection', 'homeassistant', { url: 'http://switched.local:8123', token: 'switched-token' }, 'Switched HA', 'local')
  const connectorModeA = new Connector({ bridge: bridgeModeA })
  const connectorModeB = new Connector({ bridge: bridgeModeB })
  const lastModeA = await connectorModeA.getLastConnection()
  const lastModeB = await connectorModeB.getLastConnection()
  assert('cada modo enxerga apenas as próprias conexões', lastModeA?.token === 'switched-token' && lastModeB?.token === '')

  let eventDispatched: boolean = false
  let lastOverlayPayload: any = null
  const mockMomaiWithEvent = {
    ...mockMomai,
    sendEvent(type: string, payload: any) {
      if (type === 'open_overlay') {
        eventDispatched = true
        lastOverlayPayload = payload
      }
    }
  }

  MomAIHomeConnector.devices.providers.set('homeassistant', {
    listDevices: async () => [
      {
        id: 'media_player.tv_quarto',
        name: 'TV do Quarto',
        domain: 'media_player',
        provider: 'homeassistant',
        state: { on: true }
      }
    ]
  })

  const openRes = await runtime.executeTool({
    toolName: 'open_device_control',
    args: { device_name: 'TV do Quarto' },
    momai: mockMomaiWithEvent
  })

  assert('open_device_control com objeto único desempacota e executa', openRes && openRes.ok === true)
  assert('open_device_control dispara momai.sendEvent(open_overlay)', Boolean(eventDispatched))
  assert('open_device_control usa strategy replace (um único overlay)', lastOverlayPayload && lastOverlayPayload.strategy === 'replace')
  assert('open_device_control envia overlayId do dispositivo', lastOverlayPayload && lastOverlayPayload.overlayId === 'media_player.tv_quarto')
  assert('open_device_control define overlaySize TV com altura >= 520', lastOverlayPayload && lastOverlayPayload.overlaySize.height >= 520)

  // Teste de overlay para luz
  let lightEventDispatched = false
  let lastLightOverlayPayload: any = null
  const mockMomaiWithLightEvent = {
    ...mockMomai,
    sendEvent: (type: string, payload: any) => {
      if (type === 'open_overlay') {
        lightEventDispatched = true
        lastLightOverlayPayload = payload
      }
    }
  }
  MomAIHomeConnector.devices.providers.set('homeassistant', {
    listDevices: async () => [
      {
        id: 'light.quarto',
        name: 'Luz do Quarto',
        domain: 'light',
        provider: 'homeassistant',
        state: { on: true }
      }
    ]
  })
  const openLightRes = await runtime.executeTool({
    toolName: 'open_device_control',
    args: { device_name: 'Luz do Quarto' },
    momai: mockMomaiWithLightEvent
  })
  assert('open_device_control luz abre com sucesso', openLightRes && openLightRes.ok === true && Boolean(lightEventDispatched))
  assert('open_device_control luz usa dimensões sem cortes (>= 540h, >= 320w)', lastLightOverlayPayload && lastLightOverlayPayload.overlaySize.height >= 540 && lastLightOverlayPayload.overlaySize.width >= 320)

  let toggled: boolean = false
  MomAIHomeConnector.devices.providers.set('homeassistant', {
    listDevices: async () => [
      {
        id: 'light.sala',
        name: 'Luz da Sala',
        domain: 'light',
        provider: 'homeassistant',
        state: { on: false }
      }
    ],
    toggle: async () => {
      toggled = true
      return { success: true }
    }
  })

  const toggleRes = await runtime.executeTool('control_device', {
    device_name: 'Luz da Sala',
    action: 'toggle'
  }, mockMomai)
  assert('control_device usa toggle real', toggleRes && toggleRes.ok === true && Boolean(toggled))

  const lastConnection = await MomAIHomeConnector.getLastConnection(mockMomai)
  assert('getLastConnection devolve url e token para persistência na UI', lastConnection && lastConnection.url && lastConnection.token)

  const HomeAssistantProvider = require('./src/integrations/providers/homeAssistant.ts')
  const provider = new HomeAssistantProvider({ url: 'http://ha.local:8123', token: 'test_token' })
  provider.connected = true
  const serviceCalls: any[] = []
  provider._post = async (path: string, payload: any) => {
    serviceCalls.push({ path, payload })
    return { ok: true }
  }
  provider.cachedDevices.set('light.sala', { id: 'light.sala', state: { on: false } })
  await provider.turnOn('light.sala', { brightness: 35, color: 'vermelho' })
  assert('provider envia brilho e cor para light.turn_on', serviceCalls[0]?.path === '/api/services/light/turn_on' && serviceCalls[0].payload.brightness_pct === 35 && serviceCalls[0].payload.rgb_color[0] === 255)
  await provider.toggle('light.sala')
  assert('provider envia light.toggle', serviceCalls[1]?.path === '/api/services/light/toggle')
  await provider.setClimate('climate.sala', 22, 'cool')
  assert('provider envia temperatura e modo de clima', serviceCalls[2]?.path === '/api/services/climate/set_temperature' && serviceCalls[3]?.path === '/api/services/climate/set_hvac_mode')

  // Test TV Remote Commands (YouTube, HDMI 1, HDMI 2, AV)
  serviceCalls.length = 0
  provider._get = async (path) => {
    if (path === '/api/states') {
      return [
        { entity_id: 'media_player.tv_quarto', state: 'on' },
        { entity_id: 'remote.tv_quarto', state: 'on' }
      ]
    }
    return null
  }

  await provider.sendRemoteCommand('media_player.tv_quarto', 'YOUTUBE')
  const youtubeCallMp = serviceCalls.find(c => c.path === '/api/services/media_player/play_media' && c.payload.media_content_id === 'com.google.android.youtube.tv')
  const youtubeCallRm = serviceCalls.find(c => c.path === '/api/services/remote/turn_on' && c.payload.activity === 'com.google.android.youtube.tv')
  assert('sendRemoteCommand YOUTUBE envia play_media app youtube e remote turn_on', Boolean(youtubeCallMp && youtubeCallRm))

  serviceCalls.length = 0
  await provider.sendRemoteCommand('media_player.tv_quarto', 'HDMI 1')
  const hdmi1CallMp = serviceCalls.find(c => c.path === '/api/services/media_player/play_media' && c.payload.media_content_id === 'passthrough://media_1')
  const hdmi1CallRm = serviceCalls.find(c => c.path === '/api/services/remote/turn_on' && c.payload.activity === 'passthrough://media_1')
  assert('sendRemoteCommand HDMI 1 envia play_media passthrough://media_1 e remote turn_on', Boolean(hdmi1CallMp && hdmi1CallRm))

  serviceCalls.length = 0
  await provider.sendRemoteCommand('media_player.tv_quarto', 'HDMI 2')
  const hdmi2CallMp = serviceCalls.find(c => c.path === '/api/services/media_player/play_media' && c.payload.media_content_id === 'passthrough://media_2')
  const hdmi2CallRm = serviceCalls.find(c => c.path === '/api/services/remote/turn_on' && c.payload.activity === 'passthrough://media_2')
  assert('sendRemoteCommand HDMI 2 envia play_media passthrough://media_2 e remote turn_on', Boolean(hdmi2CallMp && hdmi2CallRm))

  serviceCalls.length = 0
  await provider.sendRemoteCommand('media_player.tv_quarto', 'AV')
  const avCallMp = serviceCalls.find(c => c.path === '/api/services/media_player/play_media' && c.payload.media_content_id === 'passthrough://media_av')
  const avCallRm = serviceCalls.find(c => c.path === '/api/services/remote/turn_on' && c.payload.activity === 'passthrough://media_av')
  assert('sendRemoteCommand AV envia play_media passthrough://media_av e remote turn_on', Boolean(avCallMp && avCallRm))


  // Test 9: WebSocket state_changed propagation
  let wsStateChangedEmitted = false
  let receivedDevice = null
  provider.on('state_changed', (evt) => {
    wsStateChangedEmitted = true
    receivedDevice = evt.device
  })

  // Simula o recebimento de mensagem state_changed vinda do WebSocket do Home Assistant
  provider._handleWsMessage({
    type: 'event',
    event: {
      event_type: 'state_changed',
      data: {
        entity_id: 'switch.cafe',
        new_state: {
          entity_id: 'switch.cafe',
          state: 'on',
          attributes: { friendly_name: 'Cafeteira da Cozinha' }
        }
      }
    }
  })

  assert('HomeAssistantProvider processa evento WebSocket state_changed e emite evento local', wsStateChangedEmitted && receivedDevice && receivedDevice.id === 'switch.cafe' && receivedDevice.state.on === true)

  // Test 10: Closing connecting WebSocket does not crash with unhandled error
  let closedWithoutError = true
  try {
    const { EventEmitter } = require('events')
    const mockSocket = new EventEmitter()
    mockSocket.readyState = 0 // CONNECTING
    mockSocket.terminate = function() {
      process.nextTick(() => {
        const err = new Error('WebSocket was closed before the connection was established')
        mockSocket.emit('error', err)
      })
    }
    provider.ws = mockSocket
    provider._closeWebSocket(false)
    await new Promise((resolve) => setTimeout(resolve, 50))
  } catch (err) {
    closedWithoutError = false
  }
  assert('Encerrar WebSocket em estado CONNECTING não lança erro não tratado', closedWithoutError)
  await provider.disconnect()

  // Test 11: credenciais legadas do banco antigo migram para o SDK.
  // Plaintext legado é lido e re-criptografado no SDK.
  const plainBridge = createMemoryBridge()
  const plainDir = fs.mkdtempSync(path.join(os.tmpdir(), 'momai-smarthome-plain-'))
  const plainDbPath = path.join(plainDir, 'smarthome.sqlite')
  fs.writeFileSync(plainDbPath, 'placeholder')
  const plainRows = [
    { id: 'legacy_plain', provider_type: 'homeassistant', name: 'Legacy HA', config_encrypted: JSON.stringify({ url: 'http://legacy.local:8123', token: 'legacy_token' }), user_email: 'local', auto_connect: 1, updated_at: '2026-01-01T00:00:00.000Z' }
  ]
  await importLegacyDatabase({ dbPath: plainDbPath, bridge: plainBridge, openDb: () => ({ all: () => plainRows, close: () => {} }) })
  const tmPlain = new TokenManager(plainBridge)
  const plainConnection = await tmPlain.getConnection('legacy_plain')
  const migratedLegacy = ((await plainBridge.storage.get(CONNECTIONS_KEY)) || {}).legacy_plain
  assert('TokenManager lê e migra conexão legada plaintext', plainConnection && plainConnection.config.token === 'legacy_token' && migratedLegacy && migratedLegacy.config.encryptedData && migratedLegacy.config.iv && migratedLegacy.config.authTag)
  fs.rmSync(plainDir, { recursive: true, force: true })

  const legacyBridge2 = createMemoryBridge()
  const legacyDir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'momai-smarthome-legacy-'))
  const legacyDbPath2 = path.join(legacyDir2, 'smarthome.sqlite')
  fs.writeFileSync(legacyDbPath2, 'placeholder')
  const legacyTokenManager = new TokenManager(createMemoryBridge())
  legacyTokenManager.encryptionSecret = 'momai_home_connector_secret_32b'
  const encRows = [
    { id: 'legacy_encrypted', provider_type: 'homeassistant', name: 'Legacy Encrypted HA', config_encrypted: JSON.stringify(legacyTokenManager.encrypt({ url: 'http://legacy.local:8123', token: 'legacy_encrypted_token' })), user_email: 'local', auto_connect: 1, updated_at: '2026-01-01T00:00:00.000Z' }
  ]
  await importLegacyDatabase({ dbPath: legacyDbPath2, bridge: legacyBridge2, openDb: () => ({ all: () => encRows, close: () => {} }) })
  const tmLegacy = new TokenManager(legacyBridge2)
  // Sem chave legada disponível (nem env nem arquivo), a credencial legada não
  // deve ser legível — e não deve crashar.
  delete process.env.MOMAI_SMARTHOME_LEGACY_KEY
  const legacyKeyBlocked = await tmLegacy.getConnection('legacy_encrypted')
  assert('credencial legada ilegível sem chave de migração (env/file)', legacyKeyBlocked === null)

  // Com a chave legada via env (config local, nunca versionada), lê e
  // re-criptografa com a chave real (migração legada → nova chave, A1).
  process.env.MOMAI_SMARTHOME_LEGACY_KEY = 'momai_home_connector_secret_32b'
  const legacyEncryptedConnection = await tmLegacy.getConnection('legacy_encrypted')
  assert('TokenManager lê e migra conexão legada criptografada via chave de migração', legacyEncryptedConnection && legacyEncryptedConnection.config.token === 'legacy_encrypted_token')
  const legacyMigratedRow = ((await legacyBridge2.storage.get(CONNECTIONS_KEY)) || {}).legacy_encrypted
  const reReadLegacy = await tmLegacy.getConnection('legacy_encrypted')
  assert('legada re-criptografada com a chave real após leitura', reReadLegacy && reReadLegacy.config.token === 'legacy_encrypted_token' && legacyMigratedRow && legacyMigratedRow.config.iv && legacyMigratedRow.config.encryptedData)
  // A chave de migração NÃO faz parte do código versionado: a constante legada
  // não existe mais em tokenManager.ts.
  const tokenManagerSource = fs.readFileSync(path.join(__dirname, 'src', 'auth', 'tokenManager.ts'), 'utf8')
  assert('chave legada não fica hardcoded no fonte', !tokenManagerSource.includes('momai_home_connector_secret_32b'))
  delete process.env.MOMAI_SMARTHOME_LEGACY_KEY
  fs.rmSync(legacyDir2, { recursive: true, force: true })

  // Test 12: listDevices tenta reconectar quando provido de URL e Token mas desconnectado
  const offlineProvider = new HomeAssistantProvider({ url: 'http://ha.local:8123', token: 'test_token' })
  offlineProvider.connected = false
  let connectAttempted = false
  offlineProvider.connect = async () => {
    connectAttempted = true
    offlineProvider.connected = true
    return { success: true }
  }
  // Após reconectar, o fetch de /api/states devolve os dispositivos.
  offlineProvider._get = async () => [
    { entity_id: 'light.reconnect', state: 'on', attributes: { friendly_name: 'Luz Reconectada' } }
  ]
  const offlineDevs = await offlineProvider.listDevices()
  assert('listDevices reconecta automaticamente se desconectado', connectAttempted && offlineDevs.length > 0 && offlineDevs[0].id === 'light.reconnect')
  await offlineProvider.disconnect()

  // Test 13: list_devices em runtime.js indica erro quando sem conexão
  MomAIHomeConnector.isConnected = false
  MomAIHomeConnector.devices.providers.clear()
  const listErrRes = await runtime.executeTool('list_devices', {}, mockMomai)
  assert('list_devices retorna erro descritivo quando desconectado', listErrRes && listErrRes.ok === false && typeof listErrRes.error === 'string')

  // Test 14: get_actions/set_actions round-trip (A2)
  const getActionsEmpty = await runtime.executeTool('get_actions', {}, mockMomai)
  assert('get_actions retorna array (vazio inicialmente)', getActionsEmpty && Array.isArray(getActionsEmpty.actions))
  const setActionsRes = await runtime.executeTool('set_actions', {
    actions: [
      { id: 'act-1', target: 'momaismarthome', tool: 'control_device', args: { device_name: 'luz' }, when: { device: 'luz' } },
      { id: 'act-bad', tool: 'control_device' }
    ]
  }, mockMomai)
  assert('set_actions filtra ações sem target', setActionsRes && setActionsRes.ok === true && Array.isArray(setActionsRes.actions) && setActionsRes.actions.length === 1)
  const getActionsRoundTrip = await runtime.executeTool('get_actions', {}, mockMomai)
  assert('get/set_actions round-trip preserva a ação válida', getActionsRoundTrip.actions.length === 1 && getActionsRoundTrip.actions[0].id === 'act-1' && getActionsRoundTrip.actions[0].when.device === 'luz')
  const setActionsNonArray = await runtime.executeTool('set_actions', { actions: 'invalido' }, mockMomai)
  assert('set_actions com payload não-array não quebra (salva vazio)', setActionsNonArray.ok === true && Array.isArray(setActionsNonArray.actions))

  // Test 15: callService valida domain/service (M8 - path traversal)
  const haServiceProvider = new HomeAssistantProvider({ url: 'http://ha.local:8123', token: 'test_token' })
  haServiceProvider.connected = true
  let lastServicePath = null
  haServiceProvider._post = async (p) => { lastServicePath = p; return { ok: true } }
  let traversalRejected = false
  try { await haServiceProvider.callService('..', 'config', {}) } catch (e) { traversalRejected = true }
  assert('callService rejeita domain com ../', traversalRejected)
  traversalRejected = false
  try { await haServiceProvider.callService('light', '../config', {}) } catch (e) { traversalRejected = true }
  assert('callService rejeita service com ../', traversalRejected)
  traversalRejected = false
  try { await haServiceProvider.callService('light', 'turn.on', {}) } catch (e) { traversalRejected = true }
  assert('callService rejeita ponto no service', traversalRejected)
  await haServiceProvider.callService('light', 'turn_on', { entity_id: 'light.x' })
  assert('callService aceita domain/service válidos', lastServicePath === '/api/services/light/turn_on')
  await haServiceProvider.disconnect()

  // Test 16: list_devices mapeia estado real de sensor/clima (M5)
  MomAIHomeConnector.isConnected = true
  MomAIHomeConnector.devices.providers.set('homeassistant', {
    listDevices: async () => [
      { id: 'sensor.temperatura', name: 'Temp', domain: 'sensor', provider: 'homeassistant', state: { on: false, rawState: '22.5', value: '22.5' } },
      { id: 'climate.sala', name: 'AC', domain: 'climate', provider: 'homeassistant', state: { on: true, rawState: 'cool' } },
      { id: 'light.sala', name: 'Luz', domain: 'light', provider: 'homeassistant', state: { on: true, rawState: 'on' } }
    ]
  })
  const listDevicesRes = await runtime.executeTool('list_devices', {}, mockMomai)
  const listSensor = listDevicesRes.devices.find((d) => d.id === 'sensor.temperatura')
  const listClimate = listDevicesRes.devices.find((d) => d.id === 'climate.sala')
  const listLight = listDevicesRes.devices.find((d) => d.id === 'light.sala')
  assert('list_devices mostra sensor com estado real (não "off")', listSensor && listSensor.state === '22.5')
  assert('list_devices mostra clima pelo modo (cool → frio)', listClimate && listClimate.state === 'frio')
  assert('list_devices mostra light ligada como on', listLight && listLight.state === 'on')

  // Test 17: mutex serializa ensureConnected/init (M2)
  const ConnectorCls = MomAIHomeConnector.MomAIHomeConnector
  const mutexConnector = new ConnectorCls()
  let maxConcurrent = 0
  let activeInits = 0
  let initCallCount = 0
  mutexConnector.init = async (momai) => {
    activeInits++
    maxConcurrent = Math.max(maxConcurrent, activeInits)
    await new Promise((resolve) => setTimeout(resolve, 40))
    activeInits--
    initCallCount++
    return mutexConnector.getStatus()
  }
  mutexConnector.devices.getStatus = () => ({ providers: {}, connected: false })
  mutexConnector.getStatus = () => ({ connected: false, connections: [], providerStatus: { providers: {}, connected: false } })
  await Promise.all([
    mutexConnector.ensureConnected({}),
    mutexConnector.ensureConnected({}),
    mutexConnector.ensureConnected({})
  ])
  assert('ensureConnected serializa chamadas concorrentes (nunca 2 init em paralelo)', maxConcurrent === 1 && initCallCount === 3)

  // Test 18: sendRemoteCommand não reporta sucesso quando TODAS as chamadas
  // falharam (M4)
  const failProvider = new HomeAssistantProvider({ url: 'http://ha.local:8123', token: 'test_token' })
  failProvider.connected = true
  failProvider._get = async () => []
  failProvider._post = async () => { throw new Error('HA indisponível') }
  const failRes = await failProvider.sendRemoteCommand('media_player.tv_quarto', 'YOUTUBE')
  assert('sendRemoteCommand sem entidades não retorna success:true', failRes && failRes.success === false && typeof failRes.error === 'string')
  const failInputRes = await failProvider.sendRemoteCommand('media_player.tv_quarto', 'HDMI 1')
  assert('troca de entrada com falha total retorna success:false', failInputRes && failInputRes.success === false)
  await failProvider.disconnect()

  // Test 19: turnOn/turnOff usam o domínio do dispositivo (media_player/remote
  // NÃO devem ir para light.* — quebrava o botão de desligar do controle remoto).
  const tvProvider = new HomeAssistantProvider({ url: 'http://ha.local:8123', token: 'test_token' })
  tvProvider.connected = true
  tvProvider.cachedDevices.set('media_player.tv_quarto', { id: 'media_player.tv_quarto', state: { on: true } })
  const tvCalls: any[] = []
  tvProvider._post = async (p: string, payload: any) => { tvCalls.push({ p, payload }); return { ok: true } }
  await tvProvider.turnOff('media_player.tv_quarto')
  assert('turnOff de media_player usa media_player.turn_off (não light)', tvCalls[0]?.p === '/api/services/media_player/turn_off' && tvCalls[0]?.payload.entity_id === 'media_player.tv_quarto')
  await tvProvider.turnOn('media_player.tv_quarto')
  assert('turnOn de media_player usa media_player.turn_on (não light)', tvCalls[1]?.p === '/api/services/media_player/turn_on')
  const remoteOff = new HomeAssistantProvider({ url: 'http://ha.local:8123', token: 'test_token' })
  remoteOff.connected = true
  remoteOff.cachedDevices.set('remote.tv_quarto', { id: 'remote.tv_quarto', state: { on: true } })
  const remoteCalls: any[] = []
  remoteOff._post = async (p: string, payload: any) => { remoteCalls.push({ p, payload }); return { ok: true } }
  await remoteOff.turnOff('remote.tv_quarto')
  assert('turnOff de remote usa remote.turn_off (não light)', remoteCalls[0]?.p === '/api/services/remote/turn_off')
  await tvProvider.disconnect()
  await remoteOff.disconnect()

  // Test 20: nenhum erro de comando derruba a conexão. `connect()` não deve
  // marcar `connection_changed false` em falhas de rede/timeout — apenas em
  // auth inválido (401).
  const resilientProvider = new HomeAssistantProvider({ url: 'http://ha.local:8123', token: 'test_token' })
  resilientProvider.connected = true
  let connectionDown = false
  resilientProvider.on('connection_changed', (evt) => {
    if (evt?.connected === false) connectionDown = true
  })
  // Falha de rede ao conectar NÃO deve derrubar a conexão ativa.
  resilientProvider._get = async () => { const e: any = new Error('ENOTFOUND'); e.code = 'ha_network'; throw e }
  let connectRejected = false
  try { await resilientProvider.connect() } catch (e) { connectRejected = true }
  assert('connect() com falha de rede rejeita mas NÃO derruba conexão ativa', connectRejected && !connectionDown && resilientProvider.connected === true)
  resilientProvider.connected = false
  connectionDown = false
  await resilientProvider.connect().catch(() => {})
  assert('connect() com HA offline não emite connection_changed false quando já desconectado', !connectionDown)
  await resilientProvider.disconnect()

  cleanupTestData()
  console.log(`\n=== Resultado: ${passed} passaram, ${failed} falharam ===`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch((err) => {
  console.error('Test runner crash:', err)
  process.exit(1)
})
