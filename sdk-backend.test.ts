// Failing-first test: TokenManager on the SDK backend (host storage +
// collections) with no better-sqlite3 involved.
// Run with: node sdk-backend.test.ts
const assert = require('node:assert')
const { createMemoryBridge } = require('./src/sdk-backend.ts')
const TokenManager = require('./src/auth/tokenManager.ts')

async function main() {
  const bridge = createMemoryBridge()
  const tm = new TokenManager(bridge)

  await tm.saveConnection('test_ha', 'homeassistant', { url: 'http://ha.local:8123', token: 'secret-token' }, 'Test HA', 'test@local')
  const conn = await tm.getConnection('test_ha')
  assert.ok(conn, 'getConnection returns the saved connection')
  assert.strictEqual(conn.id, 'test_ha')
  assert.strictEqual(conn.providerType, 'homeassistant')
  assert.deepStrictEqual(conn.config, { url: 'http://ha.local:8123', token: 'secret-token' })

  const list = await tm.listConnections()
  assert.ok(Array.isArray(list) && list.length === 1, 'listConnections returns one row')

  await tm.cacheEntities('test_ha', [
    { id: 'light.sala', name: 'Sala', domain: 'light', type: 'light', room: 'Sala', state: { on: true }, attributes: {}, online: true }
  ])
  const cached = await tm.getCachedEntities('test_ha')
  assert.strictEqual(cached.length, 1)
  assert.strictEqual(cached[0].id, 'light.sala')
  assert.deepStrictEqual(cached[0].state, { on: true })

  await tm.removeConnection('test_ha')
  assert.strictEqual(await tm.getConnection('test_ha'), null)
  assert.deepStrictEqual(await tm.getCachedEntities('test_ha'), [])
  console.log('sdk-backend roundtrip ok')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
