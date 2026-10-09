// SDK-backed persistence for the MomAI Smart Home worker.
//
// All durable state (connections, cached entities, credentials) lives in the
// host-owned store, which is isolated per dev mode. Extensions must persist
// only through momai.storage/collections (see docs/extensions/storage.md):
// this module never opens a database or writes state files of its own. The
// only filesystem read left is the one-time import of the legacy
// last_credentials.json written by versions before the host-owned store.

const fs = require('fs')
const path = require('path')

const CONNECTIONS_KEY = 'smarthome_connections'
const LAST_CREDENTIALS_KEY = 'smarthome_last_credentials'
const LEGACY_IMPORT_KEY = 'smarthome_legacy_imported'
const ENTITIES_COLLECTION = 'cached_entities'

function defaultDataDir() {
  return (
    process.env.MOMAI_EXTENSION_STORAGE_DIR ||
    process.env.MOMAI_NODE_CORE_DATA_DIR ||
    process.env.MOMAI_DATA_DIR ||
    path.join(__dirname, '..', 'data')
  )
}

function legacyCredentialsPath() {
  return path.join(defaultDataDir(), 'last_credentials.json')
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

// One-time import of the legacy JSON credentials file into the SDK store.
// The old better-sqlite3 database is deliberately not read: extensions must
// persist only through the host-owned store.
async function importLegacyState({ bridge } = {}) {
  const store = bridge.storage
  try {
    if (await store.get(LEGACY_IMPORT_KEY)) return { imported: false, reason: 'already' }
  } catch {
    return { imported: false, reason: 'unavailable' }
  }

  let importedCredentials = false
  try {
    const existing = await store.get(LAST_CREDENTIALS_KEY)
    if (!existing) {
      const credsPath = legacyCredentialsPath()
      if (fs.existsSync(credsPath)) {
        await store.set(LAST_CREDENTIALS_KEY, JSON.parse(fs.readFileSync(credsPath, 'utf8')))
        importedCredentials = true
      }
    }
  } catch {
    importedCredentials = false
  }

  try {
    await store.set(LEGACY_IMPORT_KEY, true)
  } catch {
    return { imported: false, reason: 'unavailable' }
  }
  return { imported: importedCredentials }
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
  importLegacyState,
  legacyCredentialsPath
}
