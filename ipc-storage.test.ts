// Failing-first test: smarthome IPC storage bridge (host SQLite, per-mode).
// Run with: node ipc-storage.test.ts
const assert = require('node:assert')
const { createIpcSmarthomeStorage } = require('./ipc-storage.ts')

async function main() {
  const sent = []
  const holder = { current: null }
  const bridge = createIpcSmarthomeStorage({
    send: (msg) => sent.push(msg),
    onResponse: (fn) => {
      holder.current = fn
    },
    storageDir: '/tmp/smarthome-display-only'
  })

  const pendingGet = bridge.storage.get('actions-state_changed')
  assert.strictEqual(sent.length, 1)
  assert.strictEqual(sent[0].type, 'storage-request')
  assert.strictEqual(sent[0].method, 'storage.get')
  assert.ok(Array.isArray(sent[0].args))
  assert.strictEqual(sent[0].args[0], 'actions-state_changed')

  holder.current({
    type: 'storage-response',
    requestId: sent[0].requestId,
    result: { ok: true, value: [] }
  })
  assert.deepStrictEqual(await pendingGet, [])

  sent.length = 0
  const pendingSet = bridge.storage.set('actions-state_changed', [])
  assert.strictEqual(sent.length, 1)
  assert.strictEqual(sent[0].method, 'storage.set')
  holder.current({
    type: 'storage-response',
    requestId: sent[0].requestId,
    result: { ok: true, value: undefined }
  })
  assert.strictEqual(await pendingSet, undefined)
  console.log('ipc-storage roundtrip ok')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
