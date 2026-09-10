const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { ENCRYPTION_ALGORITHM, IV_LENGTH, ENCRYPTION_KEY_PATH } = require('../config/constants.ts');
const {
  CONNECTIONS_KEY,
  LAST_CREDENTIALS_KEY,
  ENTITIES_COLLECTION,
  resolveBridge,
  importLegacyDatabase,
  defaultLegacyDbPath
} = require('../sdk-backend.ts');

// The legacy key was a fixed constant shipped in code (public, not a secret).
// It only READS credentials created by old versions; on read, getConnection
// re-encrypts with the real key (.encryption-key / ENCRYPTION_KEY).
// Resolution order: MOMAI_SMARTHOME_LEGACY_KEY env -> unversioned
// data/.encryption-legacy-key file (0600) -> unreadable without a key.
function resolveLegacyKey() {
  const env = process.env.MOMAI_SMARTHOME_LEGACY_KEY;
  if (env && String(env).trim()) return String(env).trim();
  const file = path.join(__dirname, '..', '..', 'data', '.encryption-legacy-key');
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8').trim();
      if (content) return content;
    }
  } catch {}
  return null;
}

function legacyCredentialsPath() {
  return path.join(path.dirname(defaultLegacyDbPath()), 'last_credentials.json');
}

class TokenManager {
  _attachedBridge = null
  encryptionSecret: string = ''
  _legacyDone = false

  constructor(bridge = null) {
    // Backward compatible: anything without a storage area is ignored and the
    // bridge resolves lazily per operation (worker IPC or memory fallback).
    if (bridge && bridge.storage) this._attachedBridge = bridge;
    this.encryptionSecret = process.env.ENCRYPTION_KEY || this._loadOrCreateKey();
  }

  attachBridge(bridge) {
    if (bridge && bridge.storage) this._attachedBridge = bridge;
    return this;
  }

  async _store() {
    const bridge = this._attachedBridge || resolveBridge();
    if (!this._legacyDone) {
      this._legacyDone = true;
      try {
        await importLegacyDatabase({ bridge });
      } catch {}
    }
    return bridge;
  }

  _loadOrCreateKey(customDir = null) {
    const candidatePaths = [
      customDir ? path.join(customDir, '.encryption-key') : null,
      ENCRYPTION_KEY_PATH,
      path.join(require('../config/constants.ts').DEFAULT_DB_PATH, '..', '.encryption-key'),
      path.join(__dirname, '..', '..', 'data', '.encryption-key')
    ].filter(Boolean);

    for (const keyPath of candidatePaths) {
      try {
        if (fs.existsSync(keyPath)) {
          const existing = fs.readFileSync(keyPath, 'utf8').trim();
          if (existing) return existing;
        }
      } catch {}
    }

    const keyPath = candidatePaths[0];
    const key = crypto.randomBytes(32).toString('hex');
    try {
      fs.mkdirSync(path.dirname(keyPath), { recursive: true });
      fs.writeFileSync(keyPath, key, { encoding: 'utf8', mode: 0o600 });
    } catch {}
    return key;
  }

  reloadKey(customDir) {
    if (process.env.ENCRYPTION_KEY) {
      this.encryptionSecret = process.env.ENCRYPTION_KEY;
    } else {
      this.encryptionSecret = this._loadOrCreateKey(customDir);
    }
  }

  _getKey() {
    return crypto.createHash('sha256').update(String(this.encryptionSecret)).digest();
  }

  encrypt(data) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = this._getKey();
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    const jsonString = JSON.stringify(data);
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag
    };
  }

  decrypt(encryptedPayload, secret = this.encryptionSecret) {
    const key = crypto.createHash('sha256').update(String(secret)).digest();
    const iv = Buffer.from(encryptedPayload.iv, 'hex');
    const authTag = Buffer.from(encryptedPayload.authTag, 'hex');

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedPayload.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  async _readConnections() {
    const bridge = await this._store();
    try {
      return (await bridge.storage.get(CONNECTIONS_KEY)) || {};
    } catch {
      return {};
    }
  }

  async _writeConnections(map) {
    const bridge = await this._store();
    await bridge.storage.set(CONNECTIONS_KEY, map);
  }

  async saveConnection(id, providerType, config, name, email) {
    const map = await this._readConnections();
    map[id] = {
      id,
      provider_type: providerType,
      name,
      user_email: email,
      config: this.encrypt(config),
      auto_connect: 1,
      updated_at: new Date().toISOString()
    };
    await this._writeConnections(map);
  }

  async getLastCredentials() {
    const bridge = await this._store();
    try {
      const stored = await bridge.storage.get(LAST_CREDENTIALS_KEY);
      if (stored) return stored;
    } catch {}
    try {
      const credsPath = legacyCredentialsPath();
      if (fs.existsSync(credsPath)) {
        return JSON.parse(fs.readFileSync(credsPath, 'utf8'));
      }
    } catch {}
    return null;
  }

  async setLastCredentials(creds) {
    const bridge = await this._store();
    await bridge.storage.set(LAST_CREDENTIALS_KEY, creds);
  }

  async clearLastCredentials() {
    const bridge = await this._store();
    try {
      await bridge.storage.set(LAST_CREDENTIALS_KEY, null);
    } catch {}
    try {
      const credsPath = legacyCredentialsPath();
      if (fs.existsSync(credsPath)) fs.unlinkSync(credsPath);
    } catch {}
  }

  _configFromRecord(storedConfig) {
    // Accepts the encrypted envelope (object or JSON string) and legacy
    // plaintext configs. Returns { config, migrated }.
    let payload = storedConfig;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        if (payload.includes('http') || payload.includes('token')) {
          try {
            return { config: JSON.parse(payload), migrated: true };
          } catch {}
        }
        return { config: null, migrated: false };
      }
    }
    if (payload && payload.encryptedData && payload.iv && payload.authTag) {
      try {
        return { config: this.decrypt(payload), migrated: false };
      } catch {
        const candidatePaths = [
          ENCRYPTION_KEY_PATH,
          path.join(require('../config/constants.ts').DEFAULT_DB_PATH, '..', '.encryption-key'),
          path.join(__dirname, '..', '..', 'data', '.encryption-key')
        ];
        for (const kPath of candidatePaths) {
          try {
            if (fs.existsSync(kPath)) {
              const fileKey = fs.readFileSync(kPath, 'utf8').trim();
              if (fileKey) return { config: this.decrypt(payload, fileKey), migrated: true };
            }
          } catch {}
        }
        const legacyKey = resolveLegacyKey();
        if (legacyKey) {
          try {
            return { config: this.decrypt(payload, legacyKey), migrated: true };
          } catch {}
        }
        return { config: null, migrated: false };
      }
    }
    if (payload && typeof payload === 'object' && (payload.url || payload.token)) {
      return { config: payload, migrated: true };
    }
    return { config: null, migrated: false };
  }

  async getConnection(id) {
    const map = await this._readConnections();
    const row = map[id];
    if (!row) return null;

    const { config, migrated } = this._configFromRecord(row.config);

    let resolved = config;
    let needsWrite = migrated;
    if (!resolved) {
      const lastCreds = await this.getLastCredentials();
      if (lastCreds && lastCreds.url && lastCreds.token) {
        resolved = { url: lastCreds.url, token: lastCreds.token };
        needsWrite = true;
      } else {
        console.error('[TokenManager] Erro ao descriptografar config da conexão', id);
        return null;
      }
    }

    if (needsWrite) {
      try {
        const fresh = await this._readConnections();
        if (fresh[id]) {
          fresh[id] = { ...fresh[id], config: this.encrypt(resolved), updated_at: new Date().toISOString() };
          await this._writeConnections(fresh);
        }
      } catch {}
    }

    return {
      id: row.id,
      providerType: row.provider_type,
      name: row.name,
      email: row.user_email,
      config: resolved,
      autoConnect: row.auto_connect !== 0,
      updatedAt: row.updated_at
    };
  }

  async listConnections() {
    const map = await this._readConnections();
    return Object.values(map)
      .filter((row) => row && row.auto_connect !== 0)
      .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
      .map((row) => ({
        id: row.id,
        provider_type: row.provider_type,
        name: row.name,
        user_email: row.user_email,
        auto_connect: row.auto_connect === 0 ? 0 : 1,
        updated_at: row.updated_at
      }));
  }

  async getLastConnection() {
    const map = await this._readConnections();
    const rows = Object.values(map);
    if (rows.length === 0) return null;
    rows.sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')));
    return this.getConnection(rows[0].id);
  }

  async deactivateAllConnections() {
    const map = await this._readConnections();
    for (const row of Object.values(map)) {
      if (row) row.auto_connect = 0;
    }
    await this._writeConnections(map);
    const bridge = await this._store();
    try {
      await bridge.collections.clear(ENTITIES_COLLECTION, { olderThanMs: -1 });
    } catch {}
  }

  async removeConnection(id) {
    const map = await this._readConnections();
    delete map[id];
    await this._writeConnections(map);
    const bridge = await this._store();
    try {
      const rows = await bridge.collections.list(ENTITIES_COLLECTION, { where: { connection_id: id }, limit: 500 });
      for (const row of rows) {
        try {
          await bridge.collections.remove(ENTITIES_COLLECTION, row._rowId);
        } catch {}
      }
    } catch {}
  }

  async cacheEntities(connectionId, entities) {
    const bridge = await this._store();
    try {
      const existing = await bridge.collections.list(ENTITIES_COLLECTION, { where: { connection_id: connectionId }, limit: 500 });
      for (const row of existing) {
        try {
          await bridge.collections.remove(ENTITIES_COLLECTION, row._rowId);
        } catch {}
      }
    } catch {}

    for (const e of entities || []) {
      try {
        await bridge.collections.insert(ENTITIES_COLLECTION, {
          connection_id: connectionId,
          entity_id: e.id,
          name: e.name,
          domain: e.domain || '',
          type: e.type || '',
          room: e.room || '',
          state: e.state || {},
          attributes: e.attributes || {},
          online: e.online ? 1 : 0
        });
      } catch {}
    }
  }

  async getCachedEntities(connectionId) {
    const bridge = await this._store();
    const out = [];
    let offset = 0;
    for (;;) {
      let rows = [];
      try {
        rows = await bridge.collections.list(ENTITIES_COLLECTION, { where: { connection_id: connectionId }, limit: 500, offset });
      } catch {
        break;
      }
      if (!rows || rows.length === 0) break;
      for (const r of rows) {
        out.push({
          id: r.entity_id,
          name: r.name,
          domain: r.domain,
          type: r.type,
          room: r.room,
          state: r.state || {},
          attributes: r.attributes || {},
          online: Boolean(r.online)
        });
      }
      if (rows.length < 500) break;
      offset += rows.length;
    }
    out.sort((a, b) => String(a.room || '').localeCompare(String(b.room || '')) || String(a.name || '').localeCompare(String(b.name || '')));
    return out;
  }
}

module.exports = TokenManager;
