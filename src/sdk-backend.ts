// SDK-backed persistence for the MomAI Smart Home worker.
//
// All durable state (connections, cached entities, credentials) lives in the
// host-owned store, which is isolated per dev mode. The extension's own
// better-sqlite3 file stays only as a one-time legacy source: on first use
// its rows are imported and never read again.

const fs = require('fs')
const path = require('path')

const CONNECTIONS_KEY = 'smarthome_connections'
const LAST_CREDENTIALS_KEY = 'smarthome_last_credentials'
const LEGACY_IMPORT_KEY = 'smarthome_legacy_imported'
const ENTITIES_COLLECTION = 'cached_entities'

function defaultDataDir() {
  return (
    process.env.MOMAI_NODE_CORE_DATA_DIR ||
    process.env.MOMAI_DATA_DIR ||
    path.join(__dirname, '..', 'data')
  )
}

function defaultLegacyDbPath() {
  return process.env.DB_PATH || path.join(defaultDataDir(), 'smarthome.sqlite')
}

// In-memory bridge with the same shape the worker uses (storage get/set plus
// the collections subset TokenManager needs). Used by unit tests and as a
// last-resort fallback outside the host.
function createMemoryBridge() {
  const kv = new Map()
  const tables = new Map()
  let seq = 1

  function table(name) {
    if (!tables.has(name)) tables.set(name, [])
    return tables.get(name)
  }

  return {
    storage: {
      storageDir: ':memory:',
      async get(key) {
        return kv.has(key) ? kv.get(key) : null
      },
      async set(key, value) {
        kv.set(key, value)
      },
      async delete(key) {
        kv.delete(key)
      }
    },
    collections: {
      async insert(name, record) {
        const rows = table(name)
        const id = seq++
        rows.push({ _rowId: id, created_at: Date.now(), body: { ...record } })
        return { id }
      },
      async list(name, opts = {}) {
        let rows = table(name).slice()
        const where = opts.where || {}
        const keys = Object.keys(where)
        if (keys.length > 0) {
          rows = rows.filter((row) => keys.every((k) => row.body[k] === where[k]))
        }
        const limit = Math.min(Math.max(Number(opts.limit) || 50, 1), 500)
        const offset = Math.max(Number(opts.offset) || 0, 0)
        return rows.slice(offset, offset + limit).map((row) => ({ ...row.body, _rowId: row._rowId, created_at: row.created_at }))
      },
      async remove(name, id) {
        const rows = table(name)
        const idx = rows.findIndex((row) => row._rowId === id)
        if (idx >= 0) rows.splice(idx, 1)
        return { ok: true }
      },
      async clear(name, opts = {}) {
        const rows = table(name)
        const age = Number(opts.olderThanMs)
        const cutoff = Number.isFinite(age) ? Date.now() - age : Date.now()
        const kept = rows.filter((row) => !(row.created_at < cutoff))
        const removed = rows.length - kept.length
        tables.set(name, kept)
        return { removed }
      }
    }
  }
}

let workerBridge = null
let storageResponseListener = null

// Singleton IPC bridge for the forked worker. Shares one pending map so
// storage responses route to the right caller.
function getWorkerBridge() {
  if (workerBridge) return workerBridge
  const { createIpcSmarthomeStorage } = require('../ipc-storage.ts')
  workerBridge = createIpcSmarthomeStorage({
    send: (msg) => {
      try {
        if (typeof process.send === 'function') process.send(msg)
      } catch (err) {
        console.warn('[sdk-backend] IPC send error:', err && err.message ? err.message : err)
      }
    },
    onResponse: (fn) => {
      storageResponseListener = fn
    },
    storageDir: path.join(defaultDataDir(), 'extensions', 'momai-smarthome')
  })
  return workerBridge
}

function routeStorageResponse(msg) {
  try {
    if (typeof storageResponseListener === 'function') storageResponseListener(msg)
  } catch (err) {
    console.warn('[sdk-backend] Erro ao rotear storage-response:', err)
  }
}

let memoryFallback = null

// Explicit momai (pool-style callers and tests) wins when it carries a usable
// key-value area, otherwise the worker IPC singleton or an ephemeral memory
// bridge. Storage-dir-only fallbacks ({ storage: { storageDir } }) do not
// count as usable and fall through.
function resolveBridge(explicitMomai) {
  const usable =
    explicitMomai &&
    explicitMomai.storage &&
    typeof explicitMomai.storage.get === 'function' &&
    typeof explicitMomai.storage.set === 'function'
  if (usable && explicitMomai.collections) return explicitMomai
  if (usable) {
    const memoryCollections = createMemoryBridge().collections
    return { storage: explicitMomai.storage, collections: memoryCollections }
  }
  if (typeof process.send === 'function') return getWorkerBridge()
  if (!memoryFallback) memoryFallback = createMemoryBridge()
  return memoryFallback
}

function defaultOpenDb(dbPath) {
  const BetterSqlite3 = require('better-sqlite3')
  const db = new BetterSqlite3(dbPath, { readonly: true })
  return {
    all: (sql, params = []) => db.prepare(sql).all(...params),
    close: () => db.close()
  }
}

// One-time import of the legacy better-sqlite3 file into the SDK store.
// openDb is injected so tests never touch the native driver.
async function importLegacyDatabase({ dbPath = defaultLegacyDbPath(), bridge, openDb = defaultOpenDb } = {}) {
  const store = bridge.storage
  try {
    if (await store.get(LEGACY_IMPORT_KEY)) return { imported: false, reason: 'already' }
  } catch {
    return { imported: false, reason: 'unavailable' }
  }

  let connections = []
  try {
    if (fs.existsSync(dbPath)) {
      const handle = openDb(dbPath)
      try {
        connections = handle.all(
          'SELECT id, provider_type, name, config_encrypted, user_email, auto_connect, updated_at FROM connections'
        ) || []
      } catch {
        connections = []
      } finally {
        try {
          handle.close()
        } catch {}
      }
    }
  } catch {
    connections = []
  }

  try {
    const current = (await store.get(CONNECTIONS_KEY)) || {}
    let added = 0
    for (const row of connections) {
      if (!row || !row.id || current[row.id]) continue
      current[row.id] = {
        id: row.id,
        provider_type: row.provider_type || 'homeassistant',
        name: row.name || 'Home Assistant',
        user_email: row.user_email || 'local',
        config: row.config_encrypted,
        auto_connect: row.auto_connect === 0 ? 0 : 1,
        updated_at: row.updated_at || new Date().toISOString()
      }
      added++
    }
    if (added > 0) await store.set(CONNECTIONS_KEY, current)

    try {
      const creds = await store.get(LAST_CREDENTIALS_KEY)
      if (!creds) {
        const legacyCreds = path.join(path.dirname(dbPath), 'last_credentials.json')
        if (fs.existsSync(legacyCreds)) {
          await store.set(LAST_CREDENTIALS_KEY, JSON.parse(fs.readFileSync(legacyCreds, 'utf8')))
        }
      }
    } catch {}

    await store.set(LEGACY_IMPORT_KEY, true)
    return { imported: added > 0, connections: added }
  } catch {
    return { imported: false, reason: 'unavailable' }
  }
}

module.exports = {
  CONNECTIONS_KEY,
  LAST_CREDENTIALS_KEY,
  LEGACY_IMPORT_KEY,
  ENTITIES_COLLECTION,
  createMemoryBridge,
  getWorkerBridge,
  routeStorageResponse,
  resolveBridge,
  importLegacyDatabase,
  defaultLegacyDbPath
}
