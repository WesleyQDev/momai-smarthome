var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/config/constants.ts
var require_constants = __commonJS({
  "src/config/constants.ts"(exports2, module2) {
    var path2 = require("path");
    function fallbackDataDir() {
      const base = path2.basename(__dirname) === "dist" ? path2.join(__dirname, "..") : path2.join(__dirname, "..", "..");
      return path2.join(base, "data");
    }
    var dataDir2 = process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || fallbackDataDir();
    module2.exports = {
      get DEFAULT_DB_PATH() {
        const dDir = process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || fallbackDataDir();
        return process.env.DB_PATH || path2.join(dDir, "smarthome.sqlite");
      },
      get ENCRYPTION_KEY_PATH() {
        const dDir = process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || fallbackDataDir();
        return process.env.ENCRYPTION_KEY_PATH || path2.join(dDir, ".encryption-key");
      },
      HA_DEFAULT_URL: "http://homeassistant.local:8123",
      ENCRYPTION_ALGORITHM: "aes-256-gcm",
      IV_LENGTH: 12,
      AUTH_TAG_LENGTH: 16
    };
  }
});

// src/database/database.ts
var require_database = __commonJS({
  "src/database/database.ts"(exports2, module2) {
    var BetterSqlite3 = require("better-sqlite3");
    var fs2 = require("fs");
    var path2 = require("path");
    var { DEFAULT_DB_PATH } = require_constants();
    var DatabaseManager = class {
      constructor(dbPath = process.env.DB_PATH || DEFAULT_DB_PATH) {
        this.dbPath = process.env.DB_PATH || DEFAULT_DB_PATH;
        this.db = null;
        this.dbPath = dbPath;
        this.db = null;
      }
      async init() {
        if (this.db) return this;
        const dbDir = path2.dirname(this.dbPath);
        if (!fs2.existsSync(dbDir)) {
          fs2.mkdirSync(dbDir, { recursive: true });
        }
        try {
          this.db = new BetterSqlite3(this.dbPath);
          await this._createTables();
          return this;
        } catch (err) {
          this.db = null;
          throw new Error(`Falha ao conectar ao banco de dados SQLite: ${err.message}`);
        }
      }
      async _createTables() {
        const queries = [
          `CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        provider_type TEXT NOT NULL,
        name TEXT,
        config_encrypted TEXT NOT NULL,
        user_email TEXT,
        auto_connect INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
          `CREATE TABLE IF NOT EXISTS cached_entities (
        entity_id TEXT PRIMARY KEY,
        connection_id TEXT NOT NULL,
        name TEXT,
        domain TEXT,
        type_name TEXT,
        room TEXT,
        state_json TEXT,
        attributes_json TEXT,
        online INTEGER DEFAULT 1,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (connection_id) REFERENCES connections(id)
      )`,
          `CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        connection_id TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT DEFAULT 'room',
        FOREIGN KEY (connection_id) REFERENCES connections(id)
      )`,
          `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_email TEXT,
        encrypted_tokens TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
        ];
        for (const query of queries) {
          await this.run(query);
        }
        const columns = await this.all(`PRAGMA table_info(connections)`);
        if (!columns.some((column) => column.name === "auto_connect")) {
          await this.run(`ALTER TABLE connections ADD COLUMN auto_connect INTEGER NOT NULL DEFAULT 1`);
        }
      }
      run(sql, params = []) {
        const result = this.db.prepare(sql).run(...params);
        return Promise.resolve({ lastID: Number(result.lastInsertRowid), changes: result.changes });
      }
      get(sql, params = []) {
        return Promise.resolve(this.db.prepare(sql).get(...params));
      }
      all(sql, params = []) {
        return Promise.resolve(this.db.prepare(sql).all(...params));
      }
      close() {
        if (!this.db) return Promise.resolve();
        this.db.close();
        this.db = null;
        return Promise.resolve();
      }
    };
    module2.exports = DatabaseManager;
  }
});

// src/auth/tokenManager.ts
var require_tokenManager = __commonJS({
  "src/auth/tokenManager.ts"(exports2, module2) {
    var crypto = require("crypto");
    var fs2 = require("fs");
    var path2 = require("path");
    var { ENCRYPTION_ALGORITHM, IV_LENGTH, ENCRYPTION_KEY_PATH } = require_constants();
    function resolveLegacyKey() {
      const env = process.env.MOMAI_SMARTHOME_LEGACY_KEY;
      if (env && String(env).trim()) return String(env).trim();
      const file = path2.join(__dirname, "..", "..", "data", ".encryption-legacy-key");
      try {
        if (fs2.existsSync(file)) {
          const content = fs2.readFileSync(file, "utf8").trim();
          if (content) return content;
        }
      } catch {
      }
      return null;
    }
    var TokenManager = class {
      constructor(dbManager) {
        this.dbManager = null;
        this.encryptionSecret = "";
        this.dbManager = dbManager;
        this.encryptionSecret = process.env.ENCRYPTION_KEY || this._loadOrCreateKey();
      }
      _loadOrCreateKey(customDir = null) {
        const candidatePaths = [
          customDir ? path2.join(customDir, ".encryption-key") : null,
          ENCRYPTION_KEY_PATH,
          path2.join(require_constants().DEFAULT_DB_PATH, "..", ".encryption-key"),
          path2.join(__dirname, "..", "..", "data", ".encryption-key")
        ].filter(Boolean);
        for (const keyPath2 of candidatePaths) {
          try {
            if (fs2.existsSync(keyPath2)) {
              const existing = fs2.readFileSync(keyPath2, "utf8").trim();
              if (existing) return existing;
            }
          } catch {
          }
        }
        const keyPath = candidatePaths[0];
        const key = crypto.randomBytes(32).toString("hex");
        try {
          fs2.mkdirSync(path2.dirname(keyPath), { recursive: true });
          fs2.writeFileSync(keyPath, key, { encoding: "utf8", mode: 384 });
        } catch {
        }
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
        return crypto.createHash("sha256").update(String(this.encryptionSecret)).digest();
      }
      encrypt(data) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = this._getKey();
        const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
        const jsonString = JSON.stringify(data);
        let encrypted = cipher.update(jsonString, "utf8", "hex");
        encrypted += cipher.final("hex");
        const authTag = cipher.getAuthTag().toString("hex");
        return {
          iv: iv.toString("hex"),
          encryptedData: encrypted,
          authTag
        };
      }
      decrypt(encryptedPayload, secret = this.encryptionSecret) {
        const key = crypto.createHash("sha256").update(String(secret)).digest();
        const iv = Buffer.from(encryptedPayload.iv, "hex");
        const authTag = Buffer.from(encryptedPayload.authTag, "hex");
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedPayload.encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return JSON.parse(decrypted);
      }
      async saveConnection(id, providerType, config, name, email) {
        await this.dbManager.init();
        const encryptedObject = this.encrypt(config);
        const encryptedJson = JSON.stringify(encryptedObject);
        const sql = `
      INSERT INTO connections (id, provider_type, name, config_encrypted, user_email, auto_connect, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        provider_type = excluded.provider_type,
        name = excluded.name,
        config_encrypted = excluded.config_encrypted,
        user_email = excluded.user_email,
        auto_connect = 1,
        updated_at = CURRENT_TIMESTAMP;
    `;
        await this.dbManager.run(sql, [id, providerType, name, encryptedJson, email]);
      }
      async getLastCredentials() {
        try {
          const dbDir = path2.dirname(this.dbManager.dbPath);
          const credsPath = path2.join(dbDir, "last_credentials.json");
          if (fs2.existsSync(credsPath)) {
            const content = fs2.readFileSync(credsPath, "utf8");
            return JSON.parse(content);
          }
        } catch {
        }
        return null;
      }
      async clearLastCredentials() {
        try {
          const credsPath = path2.join(path2.dirname(this.dbManager.dbPath), "last_credentials.json");
          if (fs2.existsSync(credsPath)) fs2.unlinkSync(credsPath);
        } catch {
        }
      }
      async getConnection(id) {
        await this.dbManager.init();
        const row = await this.dbManager.get(`SELECT * FROM connections WHERE id = ?`, [id]);
        if (!row) return null;
        let config = null;
        let migrated = false;
        try {
          const encryptedPayload = JSON.parse(row.config_encrypted);
          if (encryptedPayload && encryptedPayload.encryptedData && encryptedPayload.iv && encryptedPayload.authTag) {
            try {
              config = this.decrypt(encryptedPayload);
            } catch {
              const candidateKeys = [
                ENCRYPTION_KEY_PATH,
                path2.join(require_constants().DEFAULT_DB_PATH, "..", ".encryption-key"),
                path2.join(__dirname, "..", "..", "data", ".encryption-key")
              ];
              for (const kPath of candidateKeys) {
                try {
                  if (fs2.existsSync(kPath)) {
                    const fileKey = fs2.readFileSync(kPath, "utf8").trim();
                    if (fileKey) {
                      config = this.decrypt(encryptedPayload, fileKey);
                      migrated = true;
                      break;
                    }
                  }
                } catch {
                }
              }
              if (!config) {
                const legacyKey = resolveLegacyKey();
                if (legacyKey) {
                  try {
                    config = this.decrypt(encryptedPayload, legacyKey);
                    migrated = true;
                  } catch {
                  }
                }
              }
            }
          } else if (encryptedPayload && typeof encryptedPayload === "object" && (encryptedPayload.url || encryptedPayload.token)) {
            config = encryptedPayload;
            migrated = true;
          }
        } catch {
          try {
            if (typeof row.config_encrypted === "string" && (row.config_encrypted.includes("http") || row.config_encrypted.includes("token"))) {
              config = JSON.parse(row.config_encrypted);
              migrated = true;
            }
          } catch {
          }
        }
        if (!config) {
          const lastCreds = await this.getLastCredentials();
          if (lastCreds && lastCreds.url && lastCreds.token) {
            config = { url: lastCreds.url, token: lastCreds.token };
            migrated = true;
          } else {
            console.error("[TokenManager] Erro ao descriptografar config da conex\xE3o", id);
            return null;
          }
        }
        if (migrated) {
          try {
            await this.dbManager.run(
              `UPDATE connections SET config_encrypted = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              [JSON.stringify(this.encrypt(config)), id]
            );
          } catch {
          }
        }
        return {
          id: row.id,
          providerType: row.provider_type,
          name: row.name,
          email: row.user_email,
          config,
          autoConnect: row.auto_connect === 1,
          updatedAt: row.updated_at
        };
      }
      async listConnections() {
        await this.dbManager.init();
        return this.dbManager.all(
          `SELECT id, provider_type, name, user_email, auto_connect, updated_at
       FROM connections
       WHERE auto_connect = 1
       ORDER BY updated_at DESC, rowid DESC`
        );
      }
      async getLastConnection() {
        await this.dbManager.init();
        const row = await this.dbManager.get(
          `SELECT id FROM connections ORDER BY updated_at DESC, rowid DESC LIMIT 1`
        );
        return row ? this.getConnection(row.id) : null;
      }
      async deactivateAllConnections() {
        await this.dbManager.init();
        await this.dbManager.run(`DELETE FROM cached_entities`);
        await this.dbManager.run(`DELETE FROM rooms`);
        await this.dbManager.run(`UPDATE connections SET auto_connect = 0`);
      }
      async removeConnection(id) {
        await this.dbManager.init();
        await this.dbManager.run(`DELETE FROM cached_entities WHERE connection_id = ?`, [id]);
        await this.dbManager.run(`DELETE FROM rooms WHERE connection_id = ?`, [id]);
        await this.dbManager.run(`DELETE FROM connections WHERE id = ?`, [id]);
      }
      async cacheEntities(connectionId, entities) {
        await this.dbManager.init();
        await this.dbManager.run(`DELETE FROM cached_entities WHERE connection_id = ?`, [connectionId]);
        for (const e of entities) {
          await this.dbManager.run(
            `INSERT OR REPLACE INTO cached_entities (entity_id, connection_id, name, domain, type_name, room, state_json, attributes_json, online, last_seen)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              e.id,
              connectionId,
              e.name,
              e.domain || "",
              e.type || "",
              e.room || "",
              JSON.stringify(e.state || {}),
              JSON.stringify(e.attributes || {}),
              e.online ? 1 : 0
            ]
          );
        }
      }
      async getCachedEntities(connectionId) {
        await this.dbManager.init();
        const rows = await this.dbManager.all(
          `SELECT * FROM cached_entities WHERE connection_id = ? ORDER BY room, name`,
          [connectionId]
        );
        return rows.map((r) => ({
          id: r.entity_id,
          name: r.name,
          domain: r.domain,
          type: r.type_name,
          room: r.room,
          state: JSON.parse(r.state_json || "{}"),
          attributes: JSON.parse(r.attributes_json || "{}"),
          online: Boolean(r.online)
        }));
      }
    };
    module2.exports = TokenManager;
  }
});

// src/auth/haAuth.ts
var require_haAuth = __commonJS({
  "src/auth/haAuth.ts"(exports2, module2) {
    var HomeAssistantAuth = class {
      constructor(options = {}) {
        this.url = "";
        this.token = "";
        this.url = options.url || process.env.HA_URL || "http://homeassistant.local:8123";
        this.token = options.token || process.env.HA_TOKEN || "";
      }
      setCredentials(url, token) {
        this.url = url;
        this.token = token;
      }
      getUrl() {
        return this.url;
      }
      getToken() {
        return this.token;
      }
    };
    module2.exports = HomeAssistantAuth;
  }
});

// src/integrations/provider.ts
var require_provider = __commonJS({
  "src/integrations/provider.ts"(exports2, module2) {
    var { EventEmitter } = require("events");
    var BaseProvider = class extends EventEmitter {
      constructor(config = {}) {
        super();
        this.config = config;
        this.connected = false;
        this.name = "generic";
      }
      async connect() {
        throw new Error("connect() must be implemented by subclass");
      }
      async disconnect() {
        throw new Error("disconnect() must be implemented by subclass");
      }
      async listDevices() {
        throw new Error("listDevices() must be implemented by subclass");
      }
      async turnOn(deviceId, params = {}) {
        throw new Error("turnOn() must be implemented by subclass");
      }
      async turnOff(deviceId, params = {}) {
        throw new Error("turnOff() must be implemented by subclass");
      }
      async getStatus() {
        return { connected: this.connected, name: this.name };
      }
    };
    module2.exports = BaseProvider;
  }
});

// src/integrations/providers/homeAssistant.ts
var require_homeAssistant = __commonJS({
  "src/integrations/providers/homeAssistant.ts"(exports2, module2) {
    var https = require("https");
    var http = require("http");
    var BaseProvider = require_provider();
    var WebSocket;
    try {
      WebSocket = require("ws");
    } catch (e) {
      if (typeof globalThis.WebSocket !== "undefined") {
        WebSocket = globalThis.WebSocket;
      }
    }
    var HA_DOMAINS = {
      light: { name: "Light", icon: "lightbulb", services: ["turn_on", "turn_off", "toggle"] },
      switch: { name: "Switch", icon: "switch", services: ["turn_on", "turn_off", "toggle"] },
      fan: { name: "Fan", icon: "fan", services: ["turn_on", "turn_off", "toggle"] },
      cover: { name: "Cover", icon: "curtains", services: ["open_cover", "close_cover", "stop_cover"] },
      lock: { name: "Lock", icon: "lock", services: ["lock", "unlock"] },
      climate: { name: "Climate", icon: "thermostat", services: ["set_temperature", "set_hvac_mode"] },
      sensor: { name: "Sensor", icon: "sensor", services: [] },
      binary_sensor: { name: "Binary Sensor", icon: "motion", services: [] },
      media_player: { name: "Media Player", icon: "tv", services: ["turn_on", "turn_off", "volume_set"] },
      camera: { name: "Camera", icon: "camera", services: ["turn_on", "turn_off"] },
      vacuum: { name: "Vacuum", icon: "vacuum", services: ["start", "stop", "return_to_base"] },
      scene: { name: "Scene", icon: "palette", services: ["turn_on"] },
      automation: { name: "Automation", icon: "autorenew", services: ["turn_on", "turn_off", "toggle"] },
      alarm_control_panel: { name: "Alarm", icon: "security", services: ["alarm_arm_away", "alarm_arm_home", "alarm_disarm"] },
      sun: { name: "Sun", icon: "sun", services: [] },
      weather: { name: "Weather", icon: "cloud-sun", services: [] },
      remote: { name: "Remote", icon: "remote", services: ["turn_on", "turn_off"] }
    };
    var EXCLUDED_DOMAINS = /* @__PURE__ */ new Set([
      "update",
      "person",
      "zone",
      "todo",
      "tts",
      "stt",
      "conversation",
      "event",
      "hacs",
      "device_tracker",
      "input_button",
      "input_select",
      "select",
      "number",
      "input_number",
      "text",
      "input_text",
      "datetime",
      "input_datetime",
      "persistent_notification",
      "button",
      "diagnostics",
      "system_health"
    ]);
    var REQUEST_TIMEOUT_MS = 4e3;
    var TRANSIENT_ERRORS_BEFORE_DISCONNECT = 10;
    var DISCONNECT_PROBE_DELAY_MS = 5e3;
    var COLOR_NAME_TO_RGB = {
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
      quente: "warm",
      frio: "cool"
    };
    function parseColor(color) {
      if (!color || typeof color !== "string") return null;
      const c = color.trim().toLowerCase();
      if (COLOR_NAME_TO_RGB[c]) {
        if (typeof COLOR_NAME_TO_RGB[c] === "string") {
          return { color_temp_kelvin: COLOR_NAME_TO_RGB[c] === "warm" ? 2700 : 6500 };
        }
        return { rgb_color: COLOR_NAME_TO_RGB[c] };
      }
      const hexMatch = c.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (hexMatch) {
        return {
          rgb_color: [
            parseInt(hexMatch[1], 16),
            parseInt(hexMatch[2], 16),
            parseInt(hexMatch[3], 16)
          ]
        };
      }
      return null;
    }
    var HomeAssistantProvider = class extends BaseProvider {
      constructor(config = {}) {
        super(config);
        this.name = "Home Assistant";
        this.url = config.url || process.env.HA_URL || "http://homeassistant.local:8123";
        this.token = config.token || process.env.HA_TOKEN || "";
        this.cachedDevices = /* @__PURE__ */ new Map();
        this.lastError = null;
        this._lastConnectAttempt = 0;
        this.ws = null;
        this.wsConnected = false;
        this.wsReconnectTimer = null;
        this.wsMessageId = 0;
        this._isDisconnecting = false;
        this._transientErrCount = 0;
        this._disconnectCheckTimer = null;
      }
      _getWsUrl() {
        try {
          const parsed = new URL(this.url);
          const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
          return `${protocol}//${parsed.host}/api/websocket`;
        } catch {
          return null;
        }
      }
      _connectWebSocket() {
        if (!WebSocket) {
          console.warn("[HAProvider] WebSocket n\xE3o dispon\xEDvel no ambiente.");
          return;
        }
        const wsUrl = this._getWsUrl();
        if (!wsUrl || !this.token) return;
        this._closeWebSocket(false);
        try {
          const ws = new WebSocket(wsUrl);
          this.ws = ws;
          const on = (event, listener) => {
            if (typeof ws.on === "function") {
              ws.on(event, listener);
            } else if (typeof ws.addEventListener === "function") {
              ws.addEventListener(event, (e) => {
                const data = e.data !== void 0 ? e.data : e;
                listener(data);
              });
            }
          };
          on("error", (err) => {
            const msg = err?.message || String(err || "");
            if (!msg.includes("closed before the connection was established")) {
              console.warn("[HAProvider] Erro no WebSocket:", msg);
            }
          });
          on("open", () => {
          });
          on("message", (raw) => {
            try {
              const data = typeof raw === "string" ? raw : raw?.data || raw.toString();
              const msg = JSON.parse(data);
              this._handleWsMessage(msg);
            } catch (err) {
              console.warn("[HAProvider] Erro ao processar mensagem do WebSocket:", err.message);
            }
          });
          on("close", () => {
            if (this.ws !== ws) {
              return;
            }
            this.wsConnected = false;
            if (!this._isDisconnecting && this.token && this.url) {
              this._scheduleWsReconnect();
            }
          });
        } catch (err) {
          console.warn("[HAProvider] Erro ao instanciar WebSocket:", err.message);
          if (!this._isDisconnecting && this.token && this.url) {
            this._scheduleWsReconnect();
          }
        }
      }
      _setConnected(connected, error = null) {
        const changed = this.connected !== connected || error && this.lastError !== error;
        this.connected = connected;
        if (connected) this.lastError = null;
        if (error) this.lastError = error;
        if (changed) {
          try {
            this.emit("connection_changed", { connected, error: this.lastError });
          } catch (e) {
          }
        }
      }
      // Falha transitória (ha_network/ha_timeout): uma leve queda de rede não deve
      // derrubar a conexão nem mostrar a tela de "desconectado" na UI. Mantém o
      // provider conectado na primeira falha, agenda um probe de recuperação e só
      // marca desconectado quando as falhas consecutivas persistem.
      _handleTransientFailure(err) {
        this._transientErrCount++;
        if (this.connected && this._transientErrCount < TRANSIENT_ERRORS_BEFORE_DISCONNECT) {
          if (this.lastError !== err?.message) this.lastError = err?.message || "Falha ao comunicar com o Home Assistant";
          this._scheduleDisconnectProbe();
          return;
        }
        this._transientErrCount = 0;
        this._setConnected(false, err?.message || "Falha ao comunicar com o Home Assistant");
      }
      _scheduleDisconnectProbe() {
        if (this._disconnectCheckTimer) clearTimeout(this._disconnectCheckTimer);
        this._disconnectCheckTimer = setTimeout(async () => {
          this._disconnectCheckTimer = null;
          if (!this.connected || this._isDisconnecting || !this.url || !this.token) return;
          try {
            await this._get("/api/config");
            this._transientErrCount = 0;
            if (this.lastError) {
              this.lastError = null;
              try {
                this.emit("connection_changed", { connected: true, error: null });
              } catch (e) {
              }
            }
          } catch (err) {
            if (err?.code === "ha_auth" || err?.message && err.message.includes("401")) {
              this._transientErrCount = 0;
              this._setConnected(false, "Token do Home Assistant inv\xE1lido ou expirado (HTTP 401 Unauthorized)");
              return;
            }
            this._handleTransientFailure(err);
          }
        }, DISCONNECT_PROBE_DELAY_MS);
        if (this._disconnectCheckTimer && typeof this._disconnectCheckTimer.unref === "function") {
          this._disconnectCheckTimer.unref();
        }
      }
      _handleWsMessage(msg) {
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "auth_required") {
          if (this.ws && (this.ws.readyState === 1 || WebSocket && this.ws.readyState === WebSocket.OPEN)) {
            this.ws.send(JSON.stringify({ type: "auth", access_token: this.token }));
          }
          return;
        }
        if (msg.type === "auth_ok") {
          this.wsConnected = true;
          const subId = ++this.wsMessageId;
          if (this.ws && (this.ws.readyState === 1 || WebSocket && this.ws.readyState === WebSocket.OPEN)) {
            this.ws.send(JSON.stringify({
              id: subId,
              type: "subscribe_events",
              event_type: "state_changed"
            }));
          }
          return;
        }
        if (msg.type === "auth_invalid") {
          console.warn("[HAProvider] Autentica\xE7\xE3o WebSocket recusada pelo Home Assistant:", msg.message);
          this.wsConnected = false;
          this._setConnected(false, "Token do Home Assistant inv\xE1lido ou expirado (HTTP 401 Unauthorized)");
          return;
        }
        if (msg.type === "event" && msg.event && msg.event.event_type === "state_changed") {
          const eventData = msg.event.data;
          if (eventData && eventData.new_state && eventData.entity_id) {
            const domain = eventData.entity_id.split(".")[0];
            if (EXCLUDED_DOMAINS.has(domain) || eventData.entity_id.startsWith("sensor.backup_")) {
              return;
            }
            const normalized = this._normalizeEntity(eventData.new_state);
            this.cachedDevices.set(normalized.id, normalized);
            this.emit("state_changed", { device: normalized, entityId: normalized.id });
          }
        }
      }
      _scheduleWsReconnect() {
        if (this.wsReconnectTimer) clearTimeout(this.wsReconnectTimer);
        if (this._isDisconnecting || !this.url || !this.token) return;
        this.wsReconnectTimer = setTimeout(() => {
          if (!this._isDisconnecting && this.url && this.token) {
            this._connectWebSocket();
          }
        }, 5e3);
        if (this.wsReconnectTimer && typeof this.wsReconnectTimer.unref === "function") {
          this.wsReconnectTimer.unref();
        }
      }
      _closeWebSocket(resetConnected = true) {
        if (this.wsReconnectTimer) {
          clearTimeout(this.wsReconnectTimer);
          this.wsReconnectTimer = null;
        }
        if (this.ws) {
          const socket = this.ws;
          this.ws = null;
          try {
            if (typeof socket.on === "function") {
              socket.on("error", () => {
              });
            } else if (typeof socket.addEventListener === "function") {
              try {
                socket.addEventListener("error", () => {
                });
              } catch {
              }
            }
            if (typeof socket.terminate === "function") {
              socket.terminate();
            } else if (typeof socket.close === "function") {
              socket.close();
            }
          } catch {
          }
        }
        if (resetConnected) {
          this.wsConnected = false;
        }
      }
      _get(urlPath) {
        return new Promise((resolve, reject) => {
          let settled = false;
          const parsedUrl = new URL(urlPath, this.url.replace(/\/$/, ""));
          const isHttps = parsedUrl.protocol === "https:";
          const transport = isHttps ? https : http;
          const req = transport.request(
            parsedUrl.toString(),
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store",
                Pragma: "no-cache"
              }
            },
            (res) => {
              let body = "";
              res.on("data", (chunk) => body += chunk);
              res.on("end", () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                  try {
                    resolve(JSON.parse(body));
                  } catch {
                    resolve(null);
                  }
                } else if (res.statusCode === 401 || res.statusCode === 403) {
                  const err = new Error(`Token do Home Assistant inv\xE1lido ou expirado (HTTP ${res.statusCode})`);
                  err.code = "ha_auth";
                  reject(err);
                } else {
                  const err = new Error(`HA API error ${res.statusCode}: ${body.slice(0, 200)}`);
                  err.code = "ha_http";
                  reject(err);
                }
              });
            }
          );
          const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            const err = new Error("Tempo limite ao consultar o Home Assistant (servidor lento ou offline)");
            err.code = "ha_timeout";
            req.destroy(err);
            reject(err);
          }, REQUEST_TIMEOUT_MS);
          req.on("error", (err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (!err.code) err.code = "ha_network";
            reject(err);
          });
          req.end();
        });
      }
      _post(urlPath, payload = {}) {
        return new Promise((resolve, reject) => {
          let settled = false;
          const parsedUrl = new URL(urlPath, this.url.replace(/\/$/, ""));
          const isHttps = parsedUrl.protocol === "https:";
          const transport = isHttps ? https : http;
          const postData = JSON.stringify(payload);
          const req = transport.request(
            parsedUrl.toString(),
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData)
              }
            },
            (res) => {
              let body = "";
              res.on("data", (chunk) => body += chunk);
              res.on("end", () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                  try {
                    resolve(JSON.parse(body));
                  } catch {
                    resolve(null);
                  }
                } else if (res.statusCode === 401 || res.statusCode === 403) {
                  const err = new Error(`Token do Home Assistant inv\xE1lido ou expirado (HTTP ${res.statusCode})`);
                  err.code = "ha_auth";
                  reject(err);
                } else {
                  const err = new Error(`HA API error ${res.statusCode}: ${body.slice(0, 200)}`);
                  err.code = "ha_http";
                  reject(err);
                }
              });
            }
          );
          const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            const err = new Error("Tempo limite ao chamar o Home Assistant (servidor lento ou offline)");
            err.code = "ha_timeout";
            req.destroy(err);
            reject(err);
          }, REQUEST_TIMEOUT_MS);
          req.on("error", (err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (!err.code) err.code = "ha_network";
            reject(err);
          });
          req.write(postData);
          req.end();
        });
      }
      async connect() {
        this._isDisconnecting = false;
        if (!this.token) {
          throw new Error("Home Assistant token is required");
        }
        const now = Date.now();
        if (!this.connected && this._lastConnectAttempt && now - this._lastConnectAttempt < 15e3) {
          const friendly = this.lastError || `O servidor Home Assistant em ${this.url} est\xE1 offline ou inacess\xEDvel.`;
          const err = new Error(friendly);
          err.code = "ha_cooldown";
          throw err;
        }
        this._lastConnectAttempt = now;
        let config = null;
        let lastErr = null;
        try {
          config = await this._get("/api/config");
        } catch (err) {
          lastErr = err;
        }
        if (!config) {
          const code = lastErr?.code;
          let friendly = `Falha ao conectar ao Home Assistant em ${this.url}: ${lastErr?.message || "sem resposta"}`;
          if (code === "ha_auth") {
            friendly = "Token do Home Assistant inv\xE1lido ou expirado (HTTP 401). Gere um novo Long-Lived Access Token em: Perfil do usu\xE1rio \u2192 Seguran\xE7a \u2192 Tokens de Acesso de Longa Dura\xE7\xE3o.";
            this._setConnected(false, friendly);
          } else if (code === "ha_timeout") {
            friendly = `O servidor Home Assistant em ${this.url} demorou demais para responder. Verifique se ele est\xE1 ligado e acess\xEDvel.`;
          } else if (code === "ha_network") {
            friendly = `N\xE3o foi poss\xEDvel acessar o servidor em ${this.url} (conex\xE3o recusada ou offline). Verifique se o Home Assistant est\xE1 ligado, se a URL/IP est\xE1 correto e se est\xE1 na mesma rede.`;
          }
          if (code !== "ha_auth") {
            this.lastError = friendly;
          }
          const err = new Error(friendly);
          err.code = code || "ha_error";
          throw err;
        }
        this._transientErrCount = 0;
        this._setConnected(true);
        this._connectWebSocket();
        return {
          success: true,
          message: `Conectado ao Home Assistant (${config.version || "desconhecido"})`,
          providerName: this.name,
          version: config.version,
          locationName: config.location_name
        };
      }
      async disconnect() {
        this._isDisconnecting = true;
        if (this._disconnectCheckTimer) {
          clearTimeout(this._disconnectCheckTimer);
          this._disconnectCheckTimer = null;
        }
        this._transientErrCount = 0;
        this._setConnected(false);
        this._closeWebSocket(true);
        this.cachedDevices.clear();
        return { success: true, message: "Desconectado do Home Assistant" };
      }
      async listDevices() {
        if (!this.connected && this.url && this.token) {
          try {
            await this.connect();
          } catch (err) {
            this._setConnected(false, err.message);
          }
        }
        if (!this.connected) {
          return [];
        }
        try {
          const states = await this._get("/api/states");
          const devices = states.filter((s) => {
            const domain = s.entity_id?.split(".")[0];
            if (!domain || EXCLUDED_DOMAINS.has(domain)) return false;
            if (s.entity_id.startsWith("sensor.backup_")) return false;
            return Boolean(HA_DOMAINS[domain] || s.attributes?.friendly_name);
          }).map((s) => this._normalizeEntity(s));
          this.cachedDevices.clear();
          devices.forEach((d) => this.cachedDevices.set(d.id, d));
          this.lastError = null;
          return devices;
        } catch (err) {
          if (err.code === "ha_auth" || err.message && err.message.includes("401")) {
            this._setConnected(false, "Token do Home Assistant inv\xE1lido ou expirado (HTTP 401 Unauthorized)");
          } else {
            this.lastError = err.message;
          }
          console.warn("[HAProvider] Erro ao listar dispositivos:", err.message);
          return [];
        }
      }
      async getDeviceState(deviceId) {
        if (!this.connected || !deviceId) return null;
        try {
          const state = await this._get(`/api/states/${encodeURIComponent(deviceId)}?refresh=${Date.now()}`);
          if (!state) return null;
          const device = this._normalizeEntity(state);
          this.cachedDevices.set(device.id, device);
          return device;
        } catch (err) {
          console.warn("[HAProvider] Erro ao consultar estado do dispositivo:", err.message);
          return null;
        }
      }
      async turnOn(deviceId, params = {}) {
        const device = this.cachedDevices.get(deviceId);
        const domain = deviceId.split(".")[0];
        const haPayload = { entity_id: deviceId };
        let servicePath = `/api/services/${domain}/turn_on`;
        if (domain === "lock") {
          servicePath = `/api/services/lock/unlock`;
        } else if (domain === "cover") {
          servicePath = `/api/services/cover/open_cover`;
        }
        if (domain === "light") {
          if (params.brightness !== void 0 && params.brightness !== null) {
            haPayload.brightness_pct = Math.max(0, Math.min(100, Number(params.brightness)));
          }
          if (params.color) {
            const parsed = parseColor(params.color);
            if (parsed) Object.assign(haPayload, parsed);
          }
          if (params.color_temp) {
            const kelvin = Number(params.color_temp);
            if (Number.isFinite(kelvin)) {
              haPayload.color_temp_kelvin = Math.max(2e3, Math.min(6500, kelvin));
            }
          }
        }
        for (const key of Object.keys(params)) {
          if (!["brightness", "color", "color_temp"].includes(key)) {
            haPayload[key] = params[key];
          }
        }
        try {
          await this._post(servicePath, haPayload);
          if (device && device.state) {
            device.state.on = true;
            if (domain === "cover") device.state.isOpen = true;
            if (domain === "lock") device.state.locked = false;
          }
          if (device) {
            this.cachedDevices.set(deviceId, device);
            if (!this.wsConnected) {
              this.emit("state_changed", { device, entityId: deviceId });
            }
          }
          return { success: true, deviceId, action: "turnOn", payload: haPayload };
        } catch (err) {
          return { success: false, error: err.message };
        }
      }
      async turnOff(deviceId, params = {}) {
        const device = this.cachedDevices.get(deviceId);
        const domain = deviceId.split(".")[0];
        let servicePath = `/api/services/${domain}/turn_off`;
        if (domain === "lock") {
          servicePath = `/api/services/lock/lock`;
        } else if (domain === "cover") {
          servicePath = `/api/services/cover/close_cover`;
        }
        try {
          await this._post(servicePath, { entity_id: deviceId, ...params });
          if (device && device.state) {
            device.state.on = false;
            if (domain === "cover") device.state.isOpen = false;
            if (domain === "lock") device.state.locked = true;
          }
          if (device) {
            this.cachedDevices.set(deviceId, device);
            if (!this.wsConnected) {
              this.emit("state_changed", { device, entityId: deviceId });
            }
          }
          return { success: true, deviceId, action: "turnOff" };
        } catch (err) {
          return { success: false, error: err.message };
        }
      }
      async toggle(deviceId) {
        const domain = deviceId.split(".")[0];
        const device = this.cachedDevices.get(deviceId);
        const toggleDomains = /* @__PURE__ */ new Set(["light", "switch", "fan", "automation", "input_boolean"]);
        if (toggleDomains.has(domain)) {
          try {
            await this._post(`/api/services/${domain}/toggle`, { entity_id: deviceId });
            return { success: true, deviceId, action: "toggle" };
          } catch (err) {
            return { success: false, error: err.message };
          }
        }
        return device?.state?.on ? this.turnOff(deviceId) : this.turnOn(deviceId);
      }
      async sendRemoteCommand(deviceId, command, extra = {}) {
        const domain = deviceId.split(".")[0];
        const cmdUpper = String(Array.isArray(command) ? command[0] : command).toUpperCase().trim();
        let relatedEntities = [];
        try {
          const baseName = deviceId.split(".")[1].replace(/_\d+$/, "");
          const states = await this._get("/api/states");
          relatedEntities = states.filter((s) => {
            const id = s.entity_id;
            return (id.startsWith("media_player.") || id.startsWith("remote.")) && id.includes(baseName);
          });
        } catch (e) {
        }
        const mediaPlayers = relatedEntities.filter((s) => s.entity_id.startsWith("media_player."));
        const remotes = relatedEntities.filter((s) => s.entity_id.startsWith("remote."));
        if (cmdUpper === "YOUTUBE" || cmdUpper === "NETFLIX") {
          const appId = cmdUpper === "YOUTUBE" ? "com.google.android.youtube.tv" : "com.netflix.ninja";
          let executed = false;
          let lastErr = null;
          for (const mp of mediaPlayers) {
            try {
              await this._post("/api/services/media_player/play_media", { entity_id: mp.entity_id, media_content_type: "app", media_content_id: appId });
              executed = true;
            } catch (e) {
              lastErr = e;
            }
          }
          for (const rm of remotes) {
            try {
              await this._post("/api/services/remote/turn_on", { entity_id: rm.entity_id, activity: appId });
              executed = true;
            } catch (e) {
              lastErr = e;
            }
          }
          if (executed) return { success: true };
          const msg = lastErr?.message || "nenhuma entidade de TV/remote correspondente";
          console.warn("[HAProvider] Falha ao abrir o app via media/remote:", msg);
          return { success: false, error: `N\xE3o foi poss\xEDvel abrir ${cmdUpper}: ${msg}` };
        }
        const inputActivityMap = {
          "HDMI 1": "passthrough://media_1",
          "HDMI1": "passthrough://media_1",
          "HDMI 2": "passthrough://media_2",
          "HDMI2": "passthrough://media_2",
          "HDMI 3": "passthrough://media_3",
          "HDMI3": "passthrough://media_3",
          "TV": "passthrough://media_0",
          "AV": "passthrough://media_av"
        };
        const isTvCmd = cmdUpper === "TV" || cmdUpper === "TV1" || cmdUpper === "LIVE TV" || cmdUpper === "TV AO VIVO";
        const isInputCmd = Boolean(inputActivityMap[cmdUpper]) || isTvCmd;
        if (isInputCmd) {
          const act = inputActivityMap[cmdUpper] || "passthrough://media_0";
          let inputExecuted = false;
          let inputLastErr = null;
          for (const mp of mediaPlayers) {
            try {
              await this._post("/api/services/media_player/select_source", { entity_id: mp.entity_id, source: command });
              inputExecuted = true;
            } catch (e) {
              inputLastErr = e;
            }
            if (isTvCmd && Array.isArray(mp.attributes?.source_list)) {
              const matchedSource = mp.attributes.source_list.find((s) => {
                const l = String(s).toLowerCase().trim();
                return l === "tv" || l === "live tv" || l === "tv ao vivo" || l === "dtv" || l === "tv/dtv" || l === "antenna" || l === "tuner" || l === "sintonizador";
              });
              if (matchedSource) {
                try {
                  await this._post("/api/services/media_player/select_source", { entity_id: mp.entity_id, source: matchedSource });
                  inputExecuted = true;
                } catch (e) {
                  inputLastErr = e;
                }
              }
            }
          }
          for (const mp of mediaPlayers) {
            try {
              await this._post("/api/services/media_player/play_media", { entity_id: mp.entity_id, media_content_type: "app", media_content_id: act });
              inputExecuted = true;
            } catch (e) {
              inputLastErr = e;
            }
            if (isTvCmd) {
              try {
                await this._post("/api/services/media_player/play_media", { entity_id: mp.entity_id, media_content_type: "app", media_content_id: "com.tcl.tv" });
                inputExecuted = true;
              } catch (e) {
                inputLastErr = e;
              }
            }
          }
          for (const rm of remotes) {
            try {
              await this._post("/api/services/remote/turn_on", { entity_id: rm.entity_id, activity: act });
              inputExecuted = true;
            } catch (e) {
              inputLastErr = e;
            }
            for (const inputCmd of ["TV_INPUT", "INPUT", "TV", "LIVE_TV"]) {
              try {
                await this._post("/api/services/remote/send_command", { entity_id: rm.entity_id, command: [inputCmd] });
                inputExecuted = true;
              } catch (e) {
                inputLastErr = e;
              }
            }
          }
          if (inputExecuted) return { success: true };
          const inputMsg = inputLastErr?.message || "nenhuma entidade de TV/remote correspondente";
          console.warn("[HAProvider] Falha ao trocar entrada da TV:", inputMsg);
          return { success: false, error: `N\xE3o foi poss\xEDvel alternar para ${cmdUpper}: ${inputMsg}` };
        }
        if (domain === "remote") {
          if (typeof deviceId !== "string" || !deviceId.startsWith("remote.")) {
            return { success: false, error: "Comando de controle remoto requer uma entidade do dom\xEDnio remote (ex.: remote.tv_sala)." };
          }
          const remoteCmdMap = {
            UP: "DPAD_UP",
            DOWN: "DPAD_DOWN",
            LEFT: "DPAD_LEFT",
            RIGHT: "DPAD_RIGHT",
            ENTER: "DPAD_CENTER",
            OK: "DPAD_CENTER",
            PLAY: "MEDIA_PLAY",
            PAUSE: "MEDIA_PAUSE",
            PLAY_PAUSE: "MEDIA_PLAY_PAUSE",
            PREV: "MEDIA_PREVIOUS",
            PREVIOUS: "MEDIA_PREVIOUS",
            NEXT: "MEDIA_NEXT",
            VOLUME_UP: "VOLUME_UP",
            VOL_UP: "VOLUME_UP",
            VOLUME_DOWN: "VOLUME_DOWN",
            VOL_DOWN: "VOLUME_DOWN",
            MUTE: "MUTE",
            BACK: "BACK",
            HOME: "HOME",
            TV: "TV_INPUT",
            AV: "TV_INPUT",
            INPUT: "TV_INPUT",
            TV_INPUT: "TV_INPUT"
          };
          const targetCmd = remoteCmdMap[cmdUpper] || cmdUpper;
          const commandArray = [targetCmd];
          return this._post("/api/services/remote/send_command", { entity_id: deviceId, command: commandArray, ...extra });
        }
        if (cmdUpper === "YOUTUBE" || cmdUpper === "NETFLIX") {
          const sourceName = cmdUpper === "YOUTUBE" ? "YouTube" : "Netflix";
          const appId = cmdUpper === "YOUTUBE" ? "com.google.android.youtube.tv" : "com.netflix.ninja";
          try {
            const res = await this.controlMedia(deviceId, "source", sourceName);
            if (res?.success !== false) return res;
          } catch (e) {
          }
          try {
            const res = await this._post("/api/services/media_player/play_media", {
              entity_id: deviceId,
              media_content_type: "app",
              media_content_id: appId
            });
            if (res?.success !== false) return res;
          } catch (e) {
          }
          return this._post("/api/services/media_player/play_media", {
            entity_id: deviceId,
            media_content_type: "url",
            media_content_id: cmdUpper === "YOUTUBE" ? "https://www.youtube.com" : "https://www.netflix.com"
          });
        }
        if (["UP", "DOWN", "LEFT", "RIGHT", "ENTER", "OK", "BACK", "HOME", "MENU"].includes(cmdUpper)) {
          try {
            return await this._post("/api/services/media_player/play_media", {
              entity_id: deviceId,
              media_content_type: "action",
              media_content_id: cmdUpper === "ENTER" ? "DPAD_CENTER" : cmdUpper === "UP" ? "DPAD_UP" : cmdUpper === "DOWN" ? "DPAD_DOWN" : cmdUpper === "LEFT" ? "DPAD_LEFT" : cmdUpper === "RIGHT" ? "DPAD_RIGHT" : cmdUpper
            });
          } catch (e) {
          }
        }
        return this.controlMedia(deviceId, command, extra.value);
      }
      async controlMedia(deviceId, action, value) {
        const domain = deviceId.split(".")[0];
        const serviceMap = {
          play: "media_play",
          pause: "media_pause",
          stop: "media_stop",
          next: "media_next_track",
          previous: "media_previous_track",
          volume_up: "volume_up",
          volume_down: "volume_down"
        };
        if (action === "volume" && value !== void 0) {
          const level = Number(value) / 100;
          if (!Number.isFinite(level)) {
            return { success: false, error: `N\xEDvel de volume inv\xE1lido: ${value}` };
          }
          return this._post("/api/services/media_player/volume_set", {
            entity_id: deviceId,
            volume_level: Math.max(0, Math.min(1, level))
          });
        }
        if (action === "mute") {
          return this._post("/api/services/media_player/volume_mute", { entity_id: deviceId, is_volume_muted: true });
        }
        if (action === "unmute") {
          return this._post("/api/services/media_player/volume_mute", { entity_id: deviceId, is_volume_muted: false });
        }
        if (action === "source" && value) {
          return this._post("/api/services/media_player/select_source", { entity_id: deviceId, source: value });
        }
        const service = serviceMap[action] || action;
        return this._post(`/api/services/${domain}/${service}`, { entity_id: deviceId });
      }
      async setClimate(deviceId, temperature, hvacMode) {
        const results = [];
        if (temperature !== void 0 && temperature !== null) {
          const tempNum = Number(temperature);
          if (!Number.isFinite(tempNum)) {
            return { success: false, error: `Temperatura inv\xE1lida: ${temperature}` };
          }
          const res = await this._post("/api/services/climate/set_temperature", {
            entity_id: deviceId,
            temperature: tempNum
          });
          results.push(res);
        }
        if (hvacMode) {
          const res = await this._post("/api/services/climate/set_hvac_mode", {
            entity_id: deviceId,
            hvac_mode: hvacMode
          });
          results.push(res);
        }
        return { success: true, results };
      }
      async callService(domain, service, data = {}) {
        if (!this.connected) throw new Error("Home Assistant offline ou desconectado");
        const SAFE_PATH_RE = /^[a-z_][a-z0-9_]*$/;
        if (typeof domain !== "string" || !SAFE_PATH_RE.test(domain)) {
          throw new Error("Dom\xEDnio inv\xE1lido. Use apenas letras min\xFAsculas e underscore (ex.: light, media_player).");
        }
        if (typeof service !== "string" || !SAFE_PATH_RE.test(service)) {
          throw new Error("Servi\xE7o inv\xE1lido. Use apenas letras min\xFAsculas e underscore (ex.: turn_on, select_source).");
        }
        return this._post(`/api/services/${domain}/${service}`, data);
      }
      _normalizeEntity(state) {
        const domain = state.entity_id?.split(".")[0];
        const domainInfo = HA_DOMAINS[domain] || { name: domain, icon: "help" };
        const attrs = state.attributes || {};
        const rawState = String(state.state || "").toLowerCase().trim();
        let isOn = false;
        if (domain === "light" || domain === "switch" || domain === "fan" || domain === "automation" || domain === "remote" || domain === "input_boolean") {
          isOn = rawState === "on" || rawState === "home" || rawState === "active";
        } else if (domain === "climate") {
          isOn = rawState !== "off" && rawState !== "unavailable" && rawState !== "unknown";
        } else if (domain === "media_player") {
          isOn = rawState !== "off" && rawState !== "standby" && rawState !== "unavailable" && rawState !== "unknown";
        } else if (domain === "lock") {
          isOn = rawState === "unlocked" || rawState === "unlocking";
        } else if (domain === "cover") {
          isOn = rawState === "open" || rawState === "opening";
        } else if (domain === "vacuum") {
          isOn = rawState === "cleaning" || rawState === "returning" || rawState === "on";
        } else if (domain === "sensor" || domain === "sun" || domain === "weather") {
          isOn = false;
        } else {
          isOn = rawState === "on" || rawState === "home" || rawState === "open" || rawState === "playing" || rawState === "active" || rawState !== "off" && rawState !== "unavailable" && rawState !== "unknown" && rawState !== "standby" && rawState !== "closed" && rawState !== "locked";
        }
        const normalized = {
          id: state.entity_id,
          name: attrs.friendly_name || state.entity_id,
          type: domainInfo.name,
          domain,
          icon: domainInfo.icon,
          provider: this.name,
          room: attrs.area_id || attrs.area || "",
          online: rawState !== "unavailable" && rawState !== "unknown",
          state: {
            on: isOn,
            rawState: state.state
          },
          attributes: {
            deviceClass: attrs.device_class || null,
            unitOfMeasurement: attrs.unit_of_measurement || null,
            haIcon: attrs.icon || null
          }
        };
        if (domain === "light") {
          normalized.state.brightness = attrs.brightness !== void 0 && attrs.brightness !== null ? Math.round(attrs.brightness / 255 * 100) : null;
          normalized.state.colorTemp = attrs.color_temp || null;
          normalized.state.colorTempKelvin = attrs.color_temp_kelvin || (attrs.color_temp ? Math.round(1e6 / attrs.color_temp) : null);
          let rgb = null;
          if (Array.isArray(attrs.rgb_color) && attrs.rgb_color.length === 3) {
            rgb = attrs.rgb_color;
          }
          normalized.state.rgbColor = rgb;
          normalized.state.hexColor = rgb ? `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1].toString(16).padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}` : null;
          normalized.attributes.supported = domainInfo.services;
        } else if (domain === "climate") {
          normalized.state.temperature = attrs.current_temperature ?? null;
          normalized.state.targetTemperature = attrs.temperature ?? null;
          normalized.state.hvacMode = state.state;
          normalized.state.hvacModes = attrs.hvac_modes || [];
          normalized.attributes.supported = domainInfo.services;
        } else if (domain === "cover") {
          normalized.state.position = attrs.current_position ?? null;
          normalized.state.isOpen = rawState === "open" || rawState === "opening";
        } else if (domain === "sensor" || domain === "binary_sensor") {
          normalized.state.value = state.state;
          normalized.state.unit = attrs.unit_of_measurement || "";
        } else if (domain === "lock") {
          normalized.state.locked = rawState === "locked";
        } else if (domain === "media_player") {
          normalized.state.volume = attrs.volume_level !== void 0 && attrs.volume_level !== null ? attrs.volume_level : null;
          normalized.state.isMuted = Boolean(attrs.is_volume_muted);
          normalized.state.source = attrs.source || null;
          normalized.state.mediaTitle = attrs.media_title || attrs.media_content_id || null;
          normalized.state.mediaArtist = attrs.media_artist || null;
          normalized.state.isPlaying = rawState === "playing";
          normalized.attributes.source_list = attrs.source_list || [];
          normalized.attributes.supported = domainInfo.services;
        } else if (domain === "sun") {
          normalized.state.rawState = state.state;
          normalized.state.elevation = attrs.elevation ?? null;
          normalized.state.azimuth = attrs.azimuth ?? null;
          normalized.state.rising = attrs.rising ?? false;
          normalized.attributes.next_rising = attrs.next_rising || null;
          normalized.attributes.next_setting = attrs.next_setting || null;
          normalized.attributes.next_dawn = attrs.next_dawn || null;
          normalized.attributes.next_dusk = attrs.next_dusk || null;
        } else if (domain === "weather") {
          normalized.state.rawState = state.state;
          normalized.state.temperature = attrs.temperature ?? null;
          normalized.state.temperatureUnit = attrs.temperature_unit || "\xB0C";
          normalized.state.humidity = attrs.humidity ?? null;
          normalized.state.pressure = attrs.pressure ?? null;
          normalized.state.pressureUnit = attrs.pressure_unit || "hPa";
          normalized.state.windSpeed = attrs.wind_speed ?? null;
          normalized.state.windSpeedUnit = attrs.wind_speed_unit || "km/h";
        }
        return normalized;
      }
    };
    module2.exports = HomeAssistantProvider;
  }
});

// src/integrations/deviceManager.ts
var require_deviceManager = __commonJS({
  "src/integrations/deviceManager.ts"(exports2, module2) {
    var { EventEmitter } = require("events");
    var HomeAssistantProvider = require_homeAssistant();
    var PROVIDER_REGISTRY = {
      homeassistant: HomeAssistantProvider
    };
    var DeviceManager = class extends EventEmitter {
      constructor() {
        super();
        this.providers = /* @__PURE__ */ new Map();
        this._lastErrorLogged = /* @__PURE__ */ new Map();
        this._lastConnectFail = /* @__PURE__ */ new Map();
        this._registerQueue = Promise.resolve();
      }
      async registerProvider(type, config = {}) {
        const run = this._registerQueue.then(
          () => this._registerProvider(type, config),
          () => this._registerProvider(type, config)
        );
        this._registerQueue = run.then(() => {
        }, () => {
        });
        return run;
      }
      async _registerProvider(type, config = {}) {
        const ProviderClass = PROVIDER_REGISTRY[type];
        if (!ProviderClass) {
          throw new Error(`Provider desconhecido: ${type}. Dispon\xEDveis: ${Object.keys(PROVIDER_REGISTRY).join(", ")}`);
        }
        const lastFail = this._lastConnectFail.get(type) || 0;
        if (lastFail && Date.now() - lastFail < 15e3) {
          const err = new Error(
            "Home Assistant indispon\xEDvel (tentativa anterior falhou). Verifique se o servidor est\xE1 ligado e acess\xEDvel na rede."
          );
          err.code = "ha_cooldown";
          throw err;
        }
        if (this.providers.has(type)) {
          await this.providers.get(type).disconnect();
        }
        const provider = new ProviderClass(config);
        if (typeof provider.on === "function") {
          provider.on("state_changed", (data) => {
            this.emit("state_changed", data);
          });
          provider.on("connection_changed", (data) => {
            this.emit("connection_changed", data);
          });
        }
        this.providers.set(type, provider);
        let result;
        try {
          result = await provider.connect();
        } catch (err) {
          this._lastConnectFail.set(type, Date.now());
          const last = this._lastErrorLogged.get(type) || 0;
          if (Date.now() - last > 6e4) {
            console.warn(`[DeviceManager] Connect offline/error for ${type}:`, err.message);
            this._lastErrorLogged.set(type, Date.now());
          }
          result = { success: false, error: err.message, code: err.code || "ha_error" };
        }
        return result;
      }
      async unregisterProvider(type) {
        const provider = this.providers.get(type);
        if (provider) {
          await provider.disconnect();
          this.providers.delete(type);
        }
        return { success: true };
      }
      async listDevices(providerType) {
        if (providerType) {
          const provider = this.providers.get(providerType);
          if (!provider) return [];
          return provider.listDevices();
        }
        const allDevices = [];
        for (const provider of this.providers.values()) {
          try {
            const devices = await provider.listDevices();
            allDevices.push(...devices);
          } catch (err) {
            console.warn(`[DeviceManager] Erro ao listar devices de ${provider.name}:`, err.message);
          }
        }
        return allDevices;
      }
      async getDeviceState(deviceId, providerType) {
        const provider = this._resolveProvider(deviceId, providerType);
        if (!provider || typeof provider.getDeviceState !== "function") return null;
        return provider.getDeviceState(deviceId);
      }
      async turnOn(deviceId, providerType, params = {}) {
        const provider = this._resolveProvider(deviceId, providerType);
        if (!provider) return { success: false, error: "Nenhum provider dispon\xEDvel para este dispositivo" };
        return provider.turnOn(deviceId, params);
      }
      async turnOff(deviceId, providerType, params = {}) {
        const provider = this._resolveProvider(deviceId, providerType);
        if (!provider) return { success: false, error: "Nenhum provider dispon\xEDvel para este dispositivo" };
        return provider.turnOff(deviceId, params);
      }
      async toggle(deviceId, providerType) {
        const provider = this._resolveProvider(deviceId, providerType);
        if (!provider || typeof provider.toggle !== "function") {
          return { success: false, error: "Provider n\xE3o suporta altern\xE2ncia para este dispositivo" };
        }
        return provider.toggle(deviceId);
      }
      async sendRemoteCommand(deviceId, command, extra = {}, providerType) {
        const provider = this._resolveProvider(deviceId, providerType);
        if (!provider) return { success: false, error: "Nenhum provider dispon\xEDvel para este dispositivo" };
        if (typeof provider.sendRemoteCommand === "function") {
          return provider.sendRemoteCommand(deviceId, command, extra);
        }
        return { success: false, error: "Provider n\xE3o suporta comandos de controle remoto" };
      }
      async controlMedia(deviceId, action, value, providerType) {
        const provider = this._resolveProvider(deviceId, providerType);
        if (!provider) return { success: false, error: "Nenhum provider dispon\xEDvel para este dispositivo" };
        if (typeof provider.controlMedia === "function") {
          return provider.controlMedia(deviceId, action, value);
        }
        return { success: false, error: "Provider n\xE3o suporta controle de m\xEDdia" };
      }
      async setClimate(deviceId, temperature, hvacMode, providerType) {
        const provider = this._resolveProvider(deviceId, providerType);
        if (!provider) return { success: false, error: "Nenhum provider dispon\xEDvel para este dispositivo" };
        if (typeof provider.setClimate === "function") {
          return provider.setClimate(deviceId, temperature, hvacMode);
        }
        return { success: false, error: "Provider n\xE3o suporta controle de climatiza\xE7\xE3o" };
      }
      async callService(domain, service, data = {}, providerType) {
        if (providerType) {
          const provider = this.providers.get(providerType);
          if (!provider) throw new Error(`Provider ${providerType} n\xE3o encontrado`);
          return provider.callService(domain, service, data);
        }
        for (const provider of this.providers.values()) {
          if (typeof provider.callService === "function") {
            try {
              return await provider.callService(domain, service, data);
            } catch {
            }
          }
        }
        throw new Error("Nenhum provider respondeu ao servi\xE7o");
      }
      getStatus() {
        const statuses = {};
        let anyConnected = false;
        let lastError = null;
        for (const [type, provider] of this.providers.entries()) {
          statuses[type] = { connected: provider.connected, name: provider.name, error: provider.lastError || null };
          if (provider.connected) anyConnected = true;
          if (provider.lastError) lastError = provider.lastError;
        }
        return {
          providers: statuses,
          connected: anyConnected,
          lastError
        };
      }
      async disconnectAll() {
        for (const [type, provider] of this.providers.entries()) {
          await provider.disconnect();
        }
        this.providers.clear();
      }
      _resolveProvider(deviceId, providerType) {
        if (providerType) return this.providers.get(providerType);
        for (const provider of this.providers.values()) {
          if (provider.cachedDevices?.has(deviceId)) return provider;
        }
        return this.providers.values().next().value || null;
      }
    };
    DeviceManager.PROVIDER_REGISTRY = PROVIDER_REGISTRY;
    module2.exports = DeviceManager;
  }
});

// src/index.ts
var require_src = __commonJS({
  "src/index.ts"(exports2, module2) {
    var path2 = require("path");
    var { EventEmitter } = require("events");
    try {
      require("dotenv").config({ path: path2.join(__dirname, "..", ".env") });
    } catch (e) {
    }
    var DatabaseManager = require_database();
    var TokenManager = require_tokenManager();
    var HomeAssistantAuth = require_haAuth();
    var DeviceManager = require_deviceManager();
    var MomAIHomeConnector = class extends EventEmitter {
      constructor(options = {}) {
        super();
        this.dbManager = null;
        this.tokenManager = null;
        this.auth = null;
        this.devices = null;
        this.isConnected = false;
        this.connections = [];
        this.lastCredentials = null;
        this._mutex = Promise.resolve();
        this._lastWarnTs = 0;
        this.dbManager = new DatabaseManager(options.dbPath);
        this.tokenManager = new TokenManager(this.dbManager);
        this.auth = new HomeAssistantAuth(options.authOptions);
        this.devices = new DeviceManager();
        if (typeof this.devices.on === "function") {
          this.devices.on("state_changed", (data) => {
            this.emit("state_changed", data);
          });
          this.devices.on("connection_changed", (data) => {
            this.isConnected = Boolean(data?.connected);
            this.emit("connection_changed", data);
          });
        }
        this.isConnected = false;
        this.connections = [];
      }
      // Log com throttle: quando o Home Assistant está fora, o init roda a cada
      // comando e cada warn ia para o main.log (escrita em disco no processo
      // principal) a cada poucos segundos — isso contribuía para micro-travamentos
      // no app. Máximo 1 aviso por minuto.
      _warn(message, detail) {
        const now = Date.now();
        if (now - (this._lastWarnTs || 0) < 6e4) return;
        this._lastWarnTs = now;
        console.warn(message, detail ?? "");
      }
      async init(momai2) {
        if (momai2?.storage?.storageDir && this.dbManager) {
          const customDbPath = path2.join(momai2.storage.storageDir, "smarthome.sqlite");
          if (this.dbManager.db && this.dbManager.dbPath !== customDbPath) {
            await this.dbManager.close();
          }
          this.dbManager.dbPath = customDbPath;
          if (this.tokenManager && typeof this.tokenManager.reloadKey === "function") {
            this.tokenManager.reloadKey(momai2.storage.storageDir);
          }
        }
        await this.dbManager.init();
        const conns = await this.tokenManager.listConnections();
        for (const conn of conns) {
          try {
            const full = await this.tokenManager.getConnection(conn.id);
            if (!full || !full.config) continue;
            if (!this.connections.some((c) => c.id === full.id)) {
              this.connections.push({ id: full.id, type: full.providerType, name: full.name, email: full.email });
            }
            try {
              const regRes = await this.devices.registerProvider(full.providerType, full.config);
              if (regRes && regRes.success !== false) {
                this.isConnected = true;
              } else {
                this._warn(`[MomAIHomeConnector] Provider ${conn.id} offline/falha na conex\xE3o:`, regRes?.error);
              }
            } catch (regErr) {
              this._warn(`[MomAIHomeConnector] Erro ao registrar provider para ${conn.id}:`, regErr.message);
            }
          } catch (err) {
            this._warn(`[MomAIHomeConnector] Falha ao restaurar conex\xE3o ${conn.id}:`, err.message);
          }
        }
        return this.getStatus();
      }
      // Mutex simples (promise chain) serializando ensureConnected/init: evita
      // que duas chamadas concorrentes criem providers em paralelo e deixem
      // WebSocket órfão quando o HA está offline (M2).
      _withLock(fn) {
        const run = this._mutex.then(fn, fn);
        this._mutex = run.then(() => {
        }, () => {
        });
        return run;
      }
      async ensureConnected(momai2) {
        return this._withLock(async () => {
          const status = this.devices.getStatus();
          const haProvider = this.devices?.providers?.get?.("homeassistant") || status?.providers?.homeassistant;
          if (this.isConnected && this.connections.length > 0 && status.connected && haProvider?.connected) {
            return this.getStatus();
          }
          if (haProvider && typeof haProvider.connect === "function" && haProvider.url && haProvider.token) {
            try {
              const res = await haProvider.connect();
              if (res && res.success !== false) {
                this.isConnected = true;
                return this.getStatus();
              }
            } catch {
            }
          }
          await this.init(momai2).catch(() => {
          });
          return this.getStatus();
        });
      }
      async connectToHomeAssistant(url, token, name, momai2) {
        if (!url || !token) throw new Error("URL e token do Home Assistant s\xE3o obrigat\xF3rios");
        url = String(url).trim().replace(/\/+$/, "");
        token = String(token).trim();
        const parsedUrl = new URL(url);
        if (!["http:", "https:"].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) {
          throw new Error("A URL deve usar HTTP ou HTTPS e n\xE3o pode conter credenciais");
        }
        if (momai2?.storage?.storageDir && this.dbManager) {
          const customDbPath = path2.join(momai2.storage.storageDir, "smarthome.sqlite");
          if (this.dbManager.db && this.dbManager.dbPath !== customDbPath) {
            await this.dbManager.close();
          }
          this.dbManager.dbPath = customDbPath;
          if (this.tokenManager && typeof this.tokenManager.reloadKey === "function") {
            this.tokenManager.reloadKey(momai2.storage.storageDir);
          }
        }
        await this.dbManager.init();
        const displayName = name || "Home Assistant";
        await this.disconnectAll(momai2).catch(() => {
        });
        this.auth.setCredentials(url, token);
        const connectionId = "ha_" + Date.now();
        const result = await this.devices.registerProvider("homeassistant", { url, token });
        if (!result || result.success === false) {
          const code = result?.code;
          const urlMsg = url ? ` em ${url}` : "";
          if (code === "ha_auth") {
            throw new Error(
              "Token do Home Assistant inv\xE1lido ou expirado (HTTP 401). Gere um novo Long-Lived Access Token em: Perfil do usu\xE1rio \u2192 Seguran\xE7a \u2192 Tokens de Acesso de Longa Dura\xE7\xE3o, e confira se a URL (ex.: http://192.168.1.10:8123) est\xE1 correta."
            );
          }
          if (code === "ha_timeout") {
            throw new Error(`O servidor Home Assistant${urlMsg} demorou demais para responder. Verifique se ele est\xE1 ligado e acess\xEDvel na rede.`);
          }
          if (code === "ha_network") {
            throw new Error(`N\xE3o foi poss\xEDvel acessar o servidor${urlMsg} (conex\xE3o recusada ou offline). Verifique se o Home Assistant est\xE1 ligado, se a URL/IP est\xE1 correto e se est\xE1 na mesma rede.`);
          }
          throw new Error(`Falha ao conectar ao Home Assistant: ${result?.error || ""}`);
        }
        await this.tokenManager.saveConnection(
          connectionId,
          "homeassistant",
          { url, token },
          displayName,
          "local"
        );
        this.lastCredentials = { url, token, name: displayName };
        const entities = await this.devices.listDevices("homeassistant");
        await this.tokenManager.cacheEntities(connectionId, entities).catch(() => {
        });
        if (!this.connections.some((c) => c.id === connectionId)) {
          this.connections.push({ id: connectionId, type: "homeassistant", name: displayName, email: "local" });
        }
        this.isConnected = true;
        return { connectionId, ...result };
      }
      async listConnections() {
        return this.tokenManager.listConnections();
      }
      async getLastConnection(momai2) {
        if (momai2?.storage?.storageDir && this.dbManager) {
          const customDbPath = path2.join(momai2.storage.storageDir, "smarthome.sqlite");
          if (this.dbManager.db && this.dbManager.dbPath !== customDbPath) {
            await this.dbManager.close();
          }
          if (this.dbManager.dbPath !== customDbPath) {
            this.dbManager.dbPath = customDbPath;
          }
          if (this.tokenManager && typeof this.tokenManager.reloadKey === "function") {
            this.tokenManager.reloadKey(momai2.storage.storageDir);
          }
        }
        try {
          const savedConnection = await this.tokenManager.getLastConnection();
          if (savedConnection?.config) {
            return { url: savedConnection.config.url || "", token: savedConnection.config.token || "", name: savedConnection.name || "" };
          }
        } catch {
        }
        if (momai2?.storage) {
          try {
            const savedConns = await momai2.storage.get("connections");
            if (savedConns && typeof savedConns === "object") {
              const entries = Object.values(savedConns);
              if (entries.length > 0) {
                const last = entries[entries.length - 1];
                if (last && last.url) {
                  return { url: last.url, token: last.token || "", name: last.name || "" };
                }
              }
            }
          } catch {
          }
        }
        if (this.lastCredentials && (this.lastCredentials.url || this.lastCredentials.token)) {
          return { url: this.lastCredentials.url || "", token: this.lastCredentials.token || "", name: this.lastCredentials.name || "" };
        }
        try {
          const savedTokenCreds = await this.tokenManager.getLastCredentials();
          if (savedTokenCreds && (savedTokenCreds.url || savedTokenCreds.token)) {
            return { url: savedTokenCreds.url || "", token: savedTokenCreds.token || "", name: savedTokenCreds.name || "" };
          }
        } catch {
        }
        return { url: "", token: "", name: "" };
      }
      async getDevices(connectionId) {
        const status = this.devices.getStatus();
        if (Object.keys(status.providers).length === 0) {
          try {
            const conns = await this.tokenManager.listConnections();
            if (conns.length > 0) {
              const cached = await this.tokenManager.getCachedEntities(connectionId || conns[0].id);
              if (cached && cached.length > 0) return cached;
            }
          } catch {
          }
          return [];
        }
        if (connectionId) {
          const conn = this.connections.find((c) => c.id === connectionId);
          if (conn) return this.devices.listDevices(conn.type);
          return [];
        }
        const devices = await this.devices.listDevices();
        if (!devices || devices.length === 0) {
          try {
            const conns = await this.tokenManager.listConnections();
            for (const c of conns) {
              const cached = await this.tokenManager.getCachedEntities(c.id);
              if (cached && cached.length > 0) return cached;
            }
          } catch {
          }
        }
        return devices;
      }
      async syncDevices(connectionId) {
        const devices = await this.getDevices(connectionId);
        if (connectionId && devices.length > 0) {
          await this.tokenManager.cacheEntities(connectionId, devices).catch(() => {
          });
        } else if (this.connections.length === 1 && devices.length > 0) {
          await this.tokenManager.cacheEntities(this.connections[0].id, devices).catch(() => {
          });
        }
        return devices;
      }
      async getDeviceState(deviceId, connectionType) {
        return this.devices.getDeviceState(deviceId, connectionType);
      }
      async turnOnDevice(deviceId, connectionType, params = {}) {
        return this.devices.turnOn(deviceId, connectionType, params);
      }
      async turnOffDevice(deviceId, connectionType, params = {}) {
        return this.devices.turnOff(deviceId, connectionType, params);
      }
      async toggleDevice(deviceId, connectionType) {
        return this.devices.toggle(deviceId, connectionType);
      }
      async sendRemoteCommand(deviceId, command, extra = {}, connectionType) {
        return this.devices.sendRemoteCommand(deviceId, command, extra, connectionType);
      }
      async controlMedia(deviceId, action, value, connectionType) {
        return this.devices.controlMedia(deviceId, action, value, connectionType);
      }
      async setClimate(deviceId, temperature, hvacMode, connectionType) {
        return this.devices.setClimate(deviceId, temperature, hvacMode, connectionType);
      }
      async callService(domain, service, data, connectionType) {
        return this.devices.callService(domain, service, data, connectionType);
      }
      async removeConnection(connectionId, momai2) {
        const conn = this.connections.find((c) => c.id === connectionId);
        if (conn) {
          await this.devices.unregisterProvider(conn.type);
          this.connections = this.connections.filter((c) => c.id !== connectionId);
        }
        if (momai2?.storage) {
          try {
            const existing = await momai2.storage.get("connections") || {};
            delete existing[connectionId];
            await momai2.storage.set("connections", existing);
          } catch {
          }
        }
        await this.tokenManager.removeConnection(connectionId);
        this.isConnected = this.connections.length > 0;
        return { success: true };
      }
      async disconnectAll(momai2) {
        await this.devices.disconnectAll();
        if (momai2?.storage) {
          try {
            await momai2.storage.set("connections", {});
          } catch {
          }
          try {
            await momai2.storage.set("last_credentials", null);
          } catch {
          }
        }
        await this.tokenManager.deactivateAllConnections().catch(() => {
        });
        await this.tokenManager.clearLastCredentials().catch(() => {
        });
        this.connections = [];
        this.lastCredentials = null;
        this.auth.setCredentials("", "");
        this.isConnected = false;
        return { success: true, message: "Todas as conex\xF5es encerradas." };
      }
      getStatus() {
        const providerStatus = this.devices.getStatus();
        const haProvider = providerStatus?.providers?.homeassistant;
        const isProviderConnected = Boolean(providerStatus?.connected || haProvider?.connected);
        return {
          connected: this.isConnected && isProviderConnected,
          connections: this.connections.map((c) => ({
            id: c.id,
            type: c.type,
            name: c.name
          })),
          providerStatus,
          lastError: providerStatus?.lastError || null
        };
      }
    };
    var defaultInstance = new MomAIHomeConnector();
    defaultInstance.MomAIHomeConnector = MomAIHomeConnector;
    module2.exports = defaultInstance;
  }
});

// runtime.ts
var path = require("path");
var fs = require("fs");
try {
  require("dotenv").config({ path: path.join(__dirname, ".env") });
} catch (e) {
}
var dataDir = process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || path.join(__dirname, "data");
process.env.DB_PATH = process.env.DB_PATH || path.join(dataDir, "smarthome.sqlite");
var connector = require_src();
function safeSend(msg) {
  try {
    if (typeof process.send === "function") process.send(msg);
  } catch (err) {
    console.warn("[runtime] Erro ao enviar mensagem ao host:", err && err.message ? err.message : err);
  }
}
process.on("uncaughtException", (err) => {
  console.error("[runtime] Erro n\xE3o tratado no worker (continuando):", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[runtime] Rejei\xE7\xE3o n\xE3o tratada no worker (continuando):", reason);
});
var deviceCache = { names: [], byRoom: {} };
var ready = false;
function actionsConfigFile() {
  return path.join(dataDir, "extensions", "momai-smarthome", "actions-state_changed.json");
}
function legacyActionsConfigFile() {
  return path.join(dataDir, "extensions", "momaismarthome", "actions-state_changed.json");
}
function loadConfiguredActions() {
  try {
    const parsed = JSON.parse(fs.readFileSync(actionsConfigFile(), "utf8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((act) => act && typeof act.target === "string" && act.target.trim().length > 0);
  } catch {
    try {
      const parsed = JSON.parse(fs.readFileSync(legacyActionsConfigFile(), "utf8"));
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((act) => act && typeof act.target === "string" && act.target.trim().length > 0);
    } catch {
      return [];
    }
  }
}
function saveConfiguredActions(actions) {
  const file = actionsConfigFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(Array.isArray(actions) ? actions : [], null, 2));
}
async function init() {
  try {
    const momaiObj = typeof momai !== "undefined" && momai ? momai : { storage: { storageDir: dataDir } };
    await connector.init(momaiObj);
    ready = true;
    safeSend({ type: "ready" });
    connector.ensureConnected(momaiObj).then(() => refreshDeviceCache()).catch((err) => {
      safeSend({ type: "log", message: `Background connect error: ${err.message}` });
    });
  } catch (err) {
    ready = true;
    safeSend({ type: "ready" });
  }
}
init().catch((err) => console.warn("[runtime] Auto-init error:", err));
var lastStateMap = /* @__PURE__ */ new Map();
var LAST_STATE_MAX = 5e3;
function recordLastState(entityId, deviceState) {
  const now = Date.now();
  const last = lastStateMap.get(entityId);
  if (last && last.state === deviceState && now - last.timestamp < 3e3) {
    return false;
  }
  lastStateMap.set(entityId, { state: deviceState, timestamp: now });
  if (lastStateMap.size > LAST_STATE_MAX) {
    const oldest = lastStateMap.keys().next().value;
    if (oldest !== void 0) lastStateMap.delete(oldest);
  }
  return true;
}
if (typeof connector.on === "function") {
  connector.on("state_changed", (data) => {
    if (data && data.device) {
      try {
        const state = data.device.state;
        const deviceState = state && typeof state === "object" ? state.on != null ? state.on ? "on" : "off" : String(state.value ?? state.state ?? "") : String(state ?? "");
        const volumeKey = state && typeof state === "object" && state.volume != null ? `${deviceState}:v${Math.round(state.volume * 100)}` : deviceState;
        const entityId = data.entityId || data.device.id;
        if (!recordLastState(entityId, volumeKey)) {
          return;
        }
        const dispatchEvent = typeof momai !== "undefined" && momai && typeof momai.sendEvent === "function" ? (type, payload) => momai.sendEvent(type, payload) : (type, payload) => {
          safeSend({ type: "event", eventType: type, data: payload });
        };
        const eventData = {
          device: data.device,
          entityId,
          deviceName: data.device.name || data.device.id,
          deviceState,
          deviceRoom: data.device.room || null
        };
        dispatchEvent("state_changed", {
          ...eventData
        });
      } catch (err) {
        console.warn("[runtime] Erro ao transmitir evento state_changed:", err);
      }
    }
  });
  connector.on("connection_changed", (data) => {
    const dispatchEvent = typeof momai !== "undefined" && momai && typeof momai.sendEvent === "function" ? (type, payload) => momai.sendEvent(type, payload) : (type, payload) => {
      safeSend({ type: "event", eventType: type, data: payload });
    };
    try {
      dispatchEvent("connection_changed", {
        connected: Boolean(data?.connected),
        error: data?.error || null
      });
    } catch (err) {
      console.warn("[runtime] Erro ao transmitir evento connection_changed:", err);
    }
  });
}
async function refreshDeviceCache() {
  try {
    await connector.ensureConnected().catch(() => {
    });
    const devices = typeof connector.syncDevices === "function" ? await connector.syncDevices() : await connector.getDevices();
    const names = devices.map((d) => `${d.name} (${d.id})`);
    const byRoom = {};
    for (const d of devices) {
      const room = d.room || "outros";
      if (!byRoom[room]) byRoom[room] = [];
      byRoom[room].push(d.name);
    }
    deviceCache = { names, byRoom };
    return devices;
  } catch {
    return [];
  }
}
var syncInterval = setInterval(async () => {
  if (ready && connector.isConnected) {
    await refreshDeviceCache().catch(() => {
    });
  }
}, 3e4);
if (typeof syncInterval.unref === "function") syncInterval.unref();
var tools = module.exports.tools = [
  {
    name: "control_device",
    description: "Liga, desliga ou ajusta um dispositivo inteligente (luzes, interruptores, TV, ar condicionado, etc). Use list_devices primeiro para ver os nomes dispon\xEDveis.",
    parameters: {
      type: "object",
      required: ["device_name", "action"],
      properties: {
        device_name: {
          type: "string",
          description: "Nome exato ou parcial do dispositivo"
        },
        action: {
          type: "string",
          enum: ["on", "off", "toggle"],
          description: "A\xE7\xE3o principal"
        },
        brightness: {
          type: "number",
          description: "Brilho (0-100) para luzes"
        },
        color: {
          type: "string",
          description: 'Cor da luz (ex: "vermelho", "azul", "verde", "amarelo", "roxo", "rosa", "laranja", "branco", "quente", "frio" ou HEX "#FF0000")'
        },
        color_temp: {
          type: "number",
          description: "Temperatura da cor em Kelvin (ex: 2700 para luz quente, 6500 para luz fria)"
        }
      }
    }
  },
  {
    name: "set_light_color",
    description: "Mude a cor, brilho ou temperatura de cor de uma l\xE2mpada ou fita LED inteligente.",
    parameters: {
      type: "object",
      required: ["device_name"],
      properties: {
        device_name: {
          type: "string",
          description: "Nome da l\xE2mpada ou grupo de luzes"
        },
        color: {
          type: "string",
          description: 'Nome da cor (ex: "vermelho", "azul", "verde", "amarelo", "roxo", "rosa", "laranja", "branco", "quente", "frio") ou formato HEX'
        },
        brightness: {
          type: "number",
          description: "Brilho da l\xE2mpada de 0 a 100%"
        },
        color_temp: {
          type: "number",
          description: "Temperatura da cor em Kelvin (ex: 2700K a 6500K)"
        }
      }
    }
  },
  {
    name: "control_tv_remote",
    description: "Controle de TV e reprodutores de m\xEDdia: comandos de controle remoto (power, volume, mute, canais, navega\xE7\xE3o), altern\xE2ncia de entrada/fonte (HDMI 1, Netflix) e reprodu\xE7\xE3o.",
    parameters: {
      type: "object",
      required: ["device_name"],
      properties: {
        device_name: {
          type: "string",
          description: "Nome da TV ou Media Player"
        },
        command: {
          type: "string",
          description: "Bot\xE3o do controle remoto: power, volume_up, volume_down, mute, channel_up, channel_down, play, pause, home, back, up, down, left, right, select"
        },
        action: {
          type: "string",
          enum: ["play", "pause", "stop", "next", "previous", "volume_up", "volume_down", "mute", "unmute", "source", "volume"],
          description: "A\xE7\xE3o de m\xEDdia"
        },
        value: {
          type: "string",
          description: 'Valor para a\xE7\xE3o (ex: n\xEDvel do volume de 0 a 100, ou nome da entrada/fonte como "HDMI 1", "Netflix")'
        }
      }
    }
  },
  {
    name: "control_climate",
    description: "Ajuste a temperatura alvo e o modo de opera\xE7\xE3o do ar condicionado ou termostato.",
    parameters: {
      type: "object",
      required: ["device_name"],
      properties: {
        device_name: {
          type: "string",
          description: "Nome do ar condicionado ou termostato"
        },
        temperature: {
          type: "number",
          description: "Temperatura desejada em graus Celsius"
        },
        hvac_mode: {
          type: "string",
          enum: ["cool", "heat", "fan_only", "auto", "off"],
          description: "Modo do ar condicionado: cool (frio), heat (quente), fan_only (ventila\xE7\xE3o), auto (autom\xE1tico), off (desligado)"
        }
      }
    }
  },
  {
    name: "call_ha_service",
    description: "Executa um servi\xE7o arbitr\xE1rio do Home Assistant (para automa\xE7\xF5es avan\xE7adas e servi\xE7os n\xE3o mapeados).",
    parameters: {
      type: "object",
      required: ["domain", "service"],
      properties: {
        domain: {
          type: "string",
          description: 'Dom\xEDnio do servi\xE7o (ex: "light", "media_player", "climate", "remote", "cover", "vacuum", "scene")'
        },
        service: {
          type: "string",
          description: 'Nome do servi\xE7o (ex: "turn_on", "send_command", "select_source", "set_temperature")'
        },
        data: {
          type: "object",
          description: 'Dados adicionais em JSON para o servi\xE7o (ex: { entity_id: "light.sala", rgb_color: [255,0,0] })'
        }
      }
    }
  },
  {
    name: "list_devices",
    description: "Lista todos os dispositivos inteligentes dispon\xEDveis com seus estados atuais.",
    parameters: {
      type: "object",
      properties: {
        room: {
          type: "string",
          description: "Filtrar por c\xF4modo (opcional)"
        }
      }
    }
  },
  {
    name: "query_device",
    description: "Obt\xE9m o estado detalhado de um dispositivo espec\xEDfico.",
    parameters: {
      type: "object",
      required: ["device_name"],
      properties: {
        device_name: {
          type: "string",
          description: "Nome do dispositivo"
        }
      }
    }
  },
  {
    name: "open_device_control",
    description: "Abre a interface de controle flutuante (overlay window) de um dispositivo espec\xEDfico (TV, controle remoto, l\xE2mpada, ar condicionado, etc) quando o usu\xE1rio pede para abrir ou exibir a tela de controle do dispositivo.",
    parameters: {
      type: "object",
      required: ["device_name"],
      properties: {
        device_name: {
          type: "string",
          description: 'Nome do dispositivo cujo controle deve ser exibido (ex: "televis\xE3o", "luz da sala", "ar condicionado")'
        }
      }
    }
  },
  {
    name: "close_device_control",
    description: "Fecha a interface de controle flutuante (overlay) aberta. Use device_name para fechar o controle de um dispositivo espec\xEDfico; omita para fechar o controle mais recente; ou use all=true para fechar todos os controles abertos.",
    parameters: {
      type: "object",
      required: [],
      properties: {
        device_name: {
          type: "string",
          description: 'Nome do dispositivo cujo controle deve ser fechado (opcional). Ex: "televis\xE3o", "luz da sala".'
        },
        all: {
          type: "boolean",
          description: "Se true, fecha todos os controles abertos."
        }
      }
    }
  }
];
var hbInterval = setInterval(() => {
  safeSend({ type: "heartbeat", timestamp: Date.now() });
}, 3e4);
if (typeof hbInterval.unref === "function") hbInterval.unref();
process.on("message", async (msg) => {
  if (msg.type === "execute") {
    try {
      const { requestId, payload } = msg;
      const { toolName, args = {}, momai: momai2 } = payload || {};
      const result = await executeTool(toolName, args, momai2);
      safeSend({ type: "response", requestId, result });
    } catch (err) {
      safeSend({
        type: "response",
        requestId: msg.requestId,
        result: { ok: false, error: err.message }
      });
    }
  } else if (msg.type === "shutdown") {
    process.exit(0);
  }
});
process.on("disconnect", () => {
  process.exit(0);
});
function normalizeString(str) {
  return String(str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
var CLIMATE_MODE_LABELS = {
  cool: "frio",
  heat: "quente",
  fan_only: "ventila\xE7\xE3o",
  auto: "autom\xE1tico",
  dry: "seco",
  heat_cool: "autom\xE1tico (aquecer/resfriar)",
  off: "desligado"
};
function deviceStateLabel(device) {
  const domain = device?.domain;
  const raw = String(device?.state?.rawState ?? "").toLowerCase().trim();
  const on = Boolean(device?.state?.on);
  if (domain === "climate") {
    return CLIMATE_MODE_LABELS[raw] || raw || (on ? "ligado" : "desligado");
  }
  if (domain === "sensor" || domain === "binary_sensor" || domain === "sun" || domain === "weather") {
    if (raw === "on" || raw === "home" || raw === "active" || raw === "above_horizon") return "ativo";
    if (raw === "off" || raw === "away" || raw === "closed" || raw === "below_horizon") return "inativo";
    if (raw) return raw;
    return on ? "ativo" : "inativo";
  }
  return on ? "on" : "off";
}
function matchDeviceFromList(query, devices) {
  if (!query || typeof query !== "string" || !Array.isArray(devices) || devices.length === 0) return null;
  const normQuery = normalizeString(query);
  if (!normQuery) return null;
  const exact = devices.find(
    (d) => normalizeString(d.name) === normQuery || normalizeString(d.id) === normQuery
  );
  if (exact) return exact;
  const partial = devices.find(
    (d) => normalizeString(d.name).includes(normQuery) || normalizeString(d.id).includes(normQuery)
  );
  if (partial) return partial;
  const STOP_WORDS = /* @__PURE__ */ new Set(["da", "do", "das", "dos", "de", "a", "o", "e", "para", "com", "meu", "minha", "seu", "sua"]);
  const tokens = normQuery.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
  if (tokens.length === 0) return null;
  const SYNONYMS = {
    tv: ["televisao", "television", "tv", "media_player", "remote"],
    televisao: ["tv", "television", "televisao", "media_player"],
    luz: ["lampada", "iluminacao", "light", "led"],
    lampada: ["luz", "iluminacao", "light", "led"],
    ar: ["clima", "termostato", "arcondicionado", "climate"],
    clima: ["ar", "termostato", "climate"]
  };
  let bestDevice = null;
  let maxScore = 0;
  for (const device of devices) {
    const normName = normalizeString(device.name);
    const normId = normalizeString(device.id);
    const normRoom = normalizeString(device.room);
    let score = 0;
    for (const token of tokens) {
      const matchPatterns = SYNONYMS[token] || [token];
      const matchesName = matchPatterns.some((p) => normName.includes(p));
      const matchesId = matchPatterns.some((p) => normId.includes(p));
      const matchesRoom = matchPatterns.some((p) => normRoom.includes(p));
      if (matchesName) score += 3;
      if (matchesId) score += 2;
      if (matchesRoom) score += 2;
    }
    if (score > maxScore) {
      maxScore = score;
      bestDevice = device;
    }
  }
  return maxScore > 0 ? bestDevice : null;
}
async function matchDevice(query, momai2) {
  if (!query || typeof query !== "string") return null;
  await connector.ensureConnected(momai2).catch(() => {
  });
  const devices = await connector.getDevices().catch(() => []);
  return matchDeviceFromList(query, devices);
}
async function executeTool(toolName, args, momai2) {
  if (typeof toolName === "object" && toolName !== null) {
    const opts = toolName;
    toolName = opts.toolName || opts.name || opts.tool;
    args = opts.args || opts.parameters || opts.payload?.args || {};
    momai2 = opts.momai || opts.context || opts.payload?.context || momai2;
  }
  args = args || {};
  if (toolName !== "connectToHomeAssistant" && toolName !== "get_actions" && toolName !== "set_actions") {
    await connector.ensureConnected(momai2).catch(() => {
    });
  }
  switch (toolName) {
    case "control_device": {
      if (!args.device_name || !args.action) {
        const all = await connector.getDevices().catch(() => []);
        const names = all.map((d) => d.name).join(", ");
        return {
          ok: false,
          error: `Informe device_name e action. Dispositivos dispon\xEDveis: ${names || "Nenhum conectado"}`,
          instruction: `Erro: Informe device_name e action. Dispositivos dispon\xEDveis: ${names || "Nenhum conectado"}`
        };
      }
      const device = await matchDevice(args.device_name, momai2);
      if (!device) {
        const all = await connector.getDevices();
        const errorMsg = `Dispositivo "${args.device_name}" n\xE3o encontrado. Dispon\xEDveis: ${all.map((d) => d.name).join(", ")}`;
        return { ok: false, error: errorMsg, instruction: errorMsg };
      }
      let result;
      const provider = device.provider?.toLowerCase().replace(/\s+/g, "");
      if (args.action === "toggle") {
        result = await connector.toggleDevice(device.id, provider);
      } else if (args.action === "on") {
        result = await connector.turnOnDevice(device.id, provider, {
          brightness: args.brightness,
          color: args.color,
          color_temp: args.color_temp
        });
      } else {
        result = await connector.turnOffDevice(device.id, provider);
      }
      await refreshDeviceCache();
      if (result && result.success === false) {
        const errorMsg = `Falha ao ${args.action === "on" ? "ligar" : "desligar"} "${device.name}": ${result.error || "erro desconhecido"}`;
        return { ok: false, error: errorMsg, instruction: errorMsg };
      }
      const successMsg = `Dispositivo "${device.name}" foi ${args.action === "on" ? "ligado" : args.action === "off" ? "desligado" : "alternado"} com sucesso.`;
      return { ok: true, device: device.name, action: args.action, result, instruction: successMsg };
    }
    case "set_light_color": {
      if (!args.device_name) return { ok: false, error: "Informe device_name", instruction: "Informe device_name" };
      const device = await matchDevice(args.device_name, momai2);
      if (!device) {
        const all = await connector.getDevices();
        const errorMsg = `Dispositivo "${args.device_name}" n\xE3o encontrado. Dispon\xEDveis: ${all.map((d) => d.name).join(", ")}`;
        return { ok: false, error: errorMsg, instruction: errorMsg };
      }
      const provider = device.provider?.toLowerCase().replace(/\s+/g, "");
      const result = await connector.turnOnDevice(device.id, provider, {
        color: args.color,
        brightness: args.brightness,
        color_temp: args.color_temp
      });
      await refreshDeviceCache();
      if (result && result.success === false) return { ok: false, error: result.error || "Falha ao atualizar a luz", instruction: result.error || "Falha ao atualizar a luz" };
      const successMsg = `Luz "${device.name}" ajustada com sucesso.`;
      return { ok: true, device: device.name, result, instruction: successMsg };
    }
    case "control_tv_remote": {
      if (!args.device_name) return { ok: false, error: "Informe device_name", instruction: "Informe device_name" };
      const device = await matchDevice(args.device_name, momai2);
      if (!device) {
        const all = await connector.getDevices();
        const errorMsg = `Dispositivo "${args.device_name}" n\xE3o encontrado. Dispon\xEDveis: ${all.map((d) => d.name).join(", ")}`;
        return { ok: false, error: errorMsg, instruction: errorMsg };
      }
      const provider = device.provider?.toLowerCase().replace(/\s+/g, "");
      let result;
      if (args.command) {
        result = await connector.sendRemoteCommand(device.id, args.command, { value: args.value }, provider);
      } else if (args.action) {
        result = await connector.controlMedia(device.id, args.action, args.value, provider);
      } else {
        return { ok: false, error: "Informe command ou action", instruction: "Informe command ou action" };
      }
      if (result && result.success === false) return { ok: false, error: result.error || "Falha ao controlar a m\xEDdia", instruction: result.error || "Falha ao controlar a m\xEDdia" };
      const successMsg = `Comando enviado para a TV/Media "${device.name}" com sucesso.`;
      return { ok: true, device: device.name, result, instruction: successMsg };
    }
    case "control_climate": {
      if (!args.device_name) return { ok: false, error: "Informe device_name", instruction: "Informe device_name" };
      const device = await matchDevice(args.device_name, momai2);
      if (!device) {
        const all = await connector.getDevices();
        const errorMsg = `Dispositivo "${args.device_name}" n\xE3o encontrado. Dispon\xEDveis: ${all.map((d) => d.name).join(", ")}`;
        return { ok: false, error: errorMsg, instruction: errorMsg };
      }
      const provider = device.provider?.toLowerCase().replace(/\s+/g, "");
      const result = await connector.setClimate(device.id, args.temperature, args.hvac_mode, provider);
      if (result && result.success === false) return { ok: false, error: result.error || "Falha ao controlar a climatiza\xE7\xE3o", instruction: result.error || "Falha ao controlar a climatiza\xE7\xE3o" };
      const successMsg = `Climatiza\xE7\xE3o do dispositivo "${device.name}" ajustada com sucesso.`;
      return { ok: true, device: device.name, result, instruction: successMsg };
    }
    case "call_ha_service": {
      if (!args.domain || !args.service) return { ok: false, error: "Informe domain e service", instruction: "Informe domain e service" };
      const result = await connector.callService(args.domain, args.service, args.data || {});
      const successMsg = `Servi\xE7o ${args.domain}.${args.service} executado com sucesso.`;
      return { ok: true, result, instruction: successMsg };
    }
    case "list_devices": {
      await connector.ensureConnected(momai2).catch(() => {
      });
      const devices = await connector.getDevices(args.connectionId);
      if ((!devices || devices.length === 0) && !connector.isConnected) {
        const conns = await connector.listConnections().catch(() => []);
        if (conns.length === 0) {
          return {
            ok: false,
            error: "Nenhuma conex\xE3o do Home Assistant configurada. Configure a integra\xE7\xE3o no painel.",
            instruction: "Erro: Nenhuma conex\xE3o do Home Assistant configurada. Por favor, adicione sua URL e Token no painel do MomAI Smart Home."
          };
        }
        return {
          ok: false,
          error: "Falha ao conectar com o Home Assistant. Verifique a URL e o token de acesso.",
          instruction: "Erro: N\xE3o foi poss\xEDvel se conectar ao Home Assistant. Verifique a URL, token ou status da rede."
        };
      }
      const filtered = args.room ? devices.filter((d) => d.room?.toLowerCase() === args.room.toLowerCase()) : devices;
      const list = filtered.map((d) => ({
        name: d.name,
        id: d.id,
        type: d.domain,
        room: d.room || null,
        state: deviceStateLabel(d),
        value: d.domain === "sensor" ? d.state.value : null,
        temperature: d.state.temperature || d.state.targetTemperature || null,
        brightness: d.state.brightness || null
      }));
      const textList = list.map((d) => `- ${d.name} (${d.type}, estado: ${d.state}${d.room ? ", c\xF4modo: " + d.room : ""})`).join("\n");
      return {
        ok: true,
        devices: list,
        instruction: `Aqui est\xE3o os ${list.length} dispositivos encontrados:
${textList}
Responda apresentando essa lista ao usu\xE1rio de forma clara.`
      };
    }
    case "query_device": {
      const device = await matchDevice(args.device_name, momai2);
      if (!device) {
        const all = await connector.getDevices().catch(() => []);
        const names = all.map((d) => d.name).join(", ");
        const errorMsg = `Dispositivo "${args.device_name}" n\xE3o encontrado.${names ? " Dispon\xEDveis: " + names : ""}`;
        return { ok: false, error: errorMsg, instruction: errorMsg };
      }
      return { ok: true, device, instruction: JSON.stringify({ ok: true, device }) };
    }
    case "open_device_control": {
      await connector.ensureConnected(momai2).catch(() => {
      });
      const allDevices = await connector.getDevices().catch(() => []);
      let device = matchDeviceFromList(args.device_name, allDevices);
      if (!device && allDevices.length > 0) {
        device = allDevices.find((d) => d.domain === "media_player" || d.domain === "remote" || d.domain === "tv");
      }
      if (!device) {
        const rawName = String(args.device_name || "Controle").trim();
        const norm = normalizeString(rawName);
        let domain = "media_player";
        if (norm.includes("luz") || norm.includes("lampada") || norm.includes("iluminacao") || norm.includes("led")) {
          domain = "light";
        } else if (norm.includes("ar") || norm.includes("clima") || norm.includes("arcondicionado") || norm.includes("termostato")) {
          domain = "climate";
        }
        device = {
          id: `${domain}_custom`,
          name: rawName || "Controle Remoto",
          domain,
          provider: "homeassistant",
          state: { on: false },
          attributes: {}
        };
      }
      let overlayWidth = 320;
      let overlayHeight = 540;
      if (device.domain === "media_player" || device.domain === "remote") {
        overlayWidth = 320;
        overlayHeight = 520;
      } else if (device.domain === "light") {
        overlayWidth = 320;
        overlayHeight = 540;
      } else if (device.domain === "climate") {
        overlayWidth = 320;
        overlayHeight = 460;
      } else {
        overlayWidth = 300;
        overlayHeight = 440;
      }
      const overlayPayload = {
        skillId: "momai-smarthome",
        panel: "dist/panel.js",
        panelType: "momaismarthome-panel",
        strategy: "replace",
        overlayId: device.id,
        overlaySize: { width: overlayWidth, height: overlayHeight },
        structuredResponse: {
          type: "momaismarthome-panel",
          data: {
            device,
            allDevices
          }
        }
      };
      const dispatchEvent = momai2 && typeof momai2.sendEvent === "function" ? (type, payload) => momai2.sendEvent(type, payload) : (type, payload) => {
        safeSend({ type: "event", eventType: type, data: payload });
      };
      try {
        dispatchEvent("open_overlay", overlayPayload);
      } catch (err) {
        console.warn("[runtime] Erro ao enviar sendEvent:", err);
      }
      return {
        ok: true,
        tool: "open_device_control",
        directResponse: `Abri o controle de "${device.name}" no overlay flutuante.`,
        instruction: `Interface de controle do dispositivo "${device.name}" aberta com sucesso no overlay flutuante.`
      };
    }
    case "close_device_control": {
      const dispatchEvent = momai2 && typeof momai2.sendEvent === "function" ? (type, payload) => momai2.sendEvent(type, payload) : (type, payload) => {
        safeSend({ type: "event", eventType: type, data: payload });
      };
      const deviceName = typeof args?.device_name === "string" && args.device_name.trim() ? args.device_name.trim() : "";
      const all = args?.all === true;
      let deviceId = "";
      if (deviceName) {
        const dev = await matchDevice(deviceName, momai2).catch(() => null);
        deviceId = dev?.id || "";
      }
      try {
        dispatchEvent("close_overlay", { skillId: "momai-smarthome", device_name: deviceName, overlay_id: deviceId, all });
      } catch (err) {
        console.warn("[runtime] Erro ao enviar close_overlay:", err);
      }
      return {
        ok: true,
        tool: "close_device_control",
        instruction: all ? "Todos os controles flutuantes foram fechados." : deviceName ? `Controle do dispositivo "${deviceName}" fechado.` : "Interface de controle flutuante fechada."
      };
    }
    case "get_actions": {
      const actions = loadConfiguredActions();
      return { ok: true, actions };
    }
    case "set_actions": {
      const incoming = Array.isArray(args?.actions) ? args.actions : [];
      const valid = incoming.filter(
        (a) => a && typeof a === "object" && typeof a.target === "string" && a.target.trim().length > 0
      );
      saveConfiguredActions(valid);
      return {
        ok: true,
        actions: valid,
        instruction: valid.length === 1 ? "1 a\xE7\xE3o salva." : `${valid.length} a\xE7\xF5es salvas.`
      };
    }
    case "connectToHomeAssistant": {
      const result = await connector.connectToHomeAssistant(args.url, args.token, args.name, momai2);
      await refreshDeviceCache();
      return { ok: true, ...result };
    }
    case "getDevices": {
      await connector.ensureConnected(momai2).catch(() => {
      });
      const devices = await connector.getDevices(args.connectionId);
      return { ok: true, devices };
    }
    case "syncDevices": {
      await connector.ensureConnected(momai2).catch(() => {
      });
      const devices = typeof connector.syncDevices === "function" ? await connector.syncDevices(args.connectionId) : await connector.getDevices(args.connectionId);
      await refreshDeviceCache();
      return { ok: true, devices };
    }
    case "getDeviceState": {
      const device = await connector.getDeviceState(args.deviceId, args.providerType);
      return { ok: Boolean(device), device };
    }
    case "turnOnDevice": {
      const result = await connector.turnOnDevice(args.deviceId, args.providerType, args.params || {});
      await refreshDeviceCache();
      return { ok: result?.success !== false, ...result };
    }
    case "turnOffDevice": {
      const result = await connector.turnOffDevice(args.deviceId, args.providerType, args.params || {});
      await refreshDeviceCache();
      return { ok: result?.success !== false, ...result };
    }
    case "toggleDevice": {
      const result = await connector.toggleDevice(args.deviceId, args.providerType);
      await refreshDeviceCache();
      return { ok: result?.success !== false, ...result };
    }
    case "setClimate": {
      const result = await connector.setClimate(args.deviceId, args.temperature, args.hvacMode, args.providerType);
      await refreshDeviceCache();
      return { ok: result?.success !== false, ...result };
    }
    case "listConnections": {
      const connections = await connector.listConnections();
      return { ok: true, connections };
    }
    case "getStatus": {
      const status = await connector.getStatus(momai2);
      return { ok: true, ...status };
    }
    case "getLastConnection": {
      const result = await connector.getLastConnection(momai2);
      return { ok: true, ...result };
    }
    case "disconnectAll": {
      const result = await connector.disconnectAll(momai2);
      return { ok: true, ...result };
    }
    case "removeConnection": {
      const result = await connector.removeConnection(args.connectionId, momai2);
      return { ok: true, ...result };
    }
    case "callService": {
      safeSend({ type: "log", message: `[callService] domain=${args.domain} service=${args.service} data=${JSON.stringify(args.data)} provider=${args.providerType || "homeassistant"}` });
      try {
        const result = await connector.callService(args.domain, args.service, args.data, args.providerType || "homeassistant");
        safeSend({ type: "log", message: `[callService] OK domain=${args.domain} service=${args.service} result=${JSON.stringify(result)}` });
        return { ok: true, data: result };
      } catch (err) {
        const errMsg = err && err.message ? err.message : String(err);
        safeSend({ type: "log", message: `[callService] ERROR domain=${args.domain} service=${args.service} error=${errMsg}` });
        return { ok: false, error: errMsg };
      }
    }
    default:
      return { ok: false, error: `Unknown tool: ${toolName}` };
  }
}
module.exports.execute = executeTool;
module.exports.executeTool = executeTool;
