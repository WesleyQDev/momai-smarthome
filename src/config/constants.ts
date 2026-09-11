const path = require('path');

// Fallback data dir when MOMAI_DATA_DIR is unset (local runs outside the host).
// Source layout is src/config (two levels below the extension root); the
// bundled worker lives in dist/ (one level below the root), so resolve the
// root accordingly instead of hardcoding '../..'.
function fallbackDataDir() {
  const base = path.basename(__dirname) === 'dist'
    ? path.join(__dirname, '..')
    : path.join(__dirname, '..', '..');
  return path.join(base, 'data');
}

// Mode-scoped base (Symlink vs Testar Loja) so the extension's own database
// and encryption key never cross environments. Older hosts fall back to the
// shared data root.
function storageBaseDir() {
  return process.env.MOMAI_EXTENSION_STORAGE_DIR || process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || fallbackDataDir();
}
module.exports = {
  get DEFAULT_DB_PATH() {
    return process.env.DB_PATH || path.join(storageBaseDir(), 'smarthome.sqlite');
  },
  get ENCRYPTION_KEY_PATH() {
    return process.env.ENCRYPTION_KEY_PATH || path.join(storageBaseDir(), '.encryption-key');
  },

  HA_DEFAULT_URL: 'http://homeassistant.local:8123',

  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  IV_LENGTH: 12,
  AUTH_TAG_LENGTH: 16
};
