// Startup smoke test: exercises the REAL compiled store.ts + startup.ts.
// Behavior of AsyncStorage is stubbed: ok / reject / hang.
const assert = require('node:assert');
const path = require('node:path');

const smokeDir = path.join(__dirname, '..', '.smoke');
const store = require(path.join(smokeDir, 'lib', 'store.js'));
const startup = require(path.join(smokeDir, 'lib', 'startup.js'));

function setBehavior(behavior, data = {}) {
  globalThis.__AS_BEHAVIOR__ = behavior;
  globalThis.__AS_DATA__ = data;
}

async function expectRejects(promise, needle) {
  let failed = false;
  try {
    await promise;
  } catch (e) {
    failed = true;
    assert.ok(String(e.message || e).includes(needle), `error message should include "${needle}", got: ${e}`);
  }
  assert.ok(failed, `expected rejection containing "${needle}"`);
}

(async () => {
  // 1. withTimeout resolves when the promise settles in time.
  setBehavior('ok', { 'noor.settings.v1': JSON.stringify({ label: 'Mombasa, KE' }) });
  const v = await startup.withTimeout(Promise.resolve(42), 1000, 'fast');
  assert.strictEqual(v, 42);

  // 2. withTimeout rejects after the deadline with a descriptive message.
  const t0 = Date.now();
  await expectRejects(
    startup.withTimeout(new Promise(() => {}), 120, 'Slow task'),
    'Slow task timed out after 120 ms',
  );
  assert.ok(Date.now() - t0 < 1500, 'timeout must fire promptly');

  // 3. Happy path: persisted settings merge over defaults.
  setBehavior('ok', { 'noor.settings.v1': JSON.stringify({ label: 'Mombasa, KE', timeFormat: 24 }) });
  await store.loadPersistedState();
  assert.strictEqual(store.getSettings().label, 'Mombasa, KE');
  assert.strictEqual(store.getSettings().timeFormat, 24);
  assert.strictEqual(store.getSettings().method, 'muslimWorldLeague', 'untouched keys keep defaults');

  // 4. Corrupt JSON must NOT throw — falls back to defaults.
  setBehavior('ok', { 'noor.settings.v1': '{corrupt!!!', 'noor.progress.v1': 'also bad' });
  await store.loadPersistedState();
  assert.strictEqual(store.getSettings().label, 'Nairobi, KE', 'defaults restored after corrupt data');

  // 5. Storage-layer failure propagates (so the UI can show error + retry).
  setBehavior('reject');
  await expectRejects(store.loadPersistedState(), 'storage offline');

  // 6. Hanging storage must trip the essential-startup timeout (never infinite).
  setBehavior('hang');
  const t1 = Date.now();
  await expectRejects(startup.runEssentialStartup(250), 'timed out after 250 ms');
  assert.ok(Date.now() - t1 < 3000, 'essential startup must fail fast, not hang');

  // 7. Essential startup succeeds on the happy path.
  setBehavior('ok', {});
  await startup.runEssentialStartup(1000);

  console.log('STARTUP SMOKE TESTS: 7/7 PASSED');
})().catch((e) => {
  console.error('SMOKE TEST FAILED:', e);
  process.exit(1);
});
