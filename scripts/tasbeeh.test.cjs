// Behavioural tests for the Smart Tasbeeh reducer (src/lib/tasbeeh.ts).
// Run via scripts/run-tasbeeh-tests.sh which compiles the real module.
const assert = require('assert');
const T = require('../.smoke-tasbeeh/lib/tasbeeh.js');

let passed = 0;
function ok(name, fn) {
  fn();
  passed += 1;
  console.log('  ok -', name);
}

console.log('TASBEEH BEHAVIOUR TESTS');

ok('default sequence: four Dhikr in the specified order with target 33', () => {
  const s = T.newSequence();
  assert.strictEqual(s.items.length, 4);
  assert.deepStrictEqual(
    s.items.map((i) => i.translit),
    ['Subḥānallāh', 'Astaghfirullāh', 'Alḥamdulillāh', 'Allāhu akbar'],
  );
  assert.deepStrictEqual(
    s.items.map((i) => i.ar),
    ['سُبْحَانَ اللَّهِ', 'أَسْتَغْفِرُ اللَّهَ', 'الْحَمْدُ لِلَّهِ', 'اللَّهُ أَكْبَرُ'],
  );
  assert.strictEqual(s.target, 33);
  assert.strictEqual(s.index, 0);
  assert.strictEqual(s.count, 0);
});

ok('counting 1..32 stays on the first Dhikr', () => {
  let s = T.newSequence();
  let stats = T.emptyDayStats();
  for (let i = 0; i < 32; i++) {
    const r = T.applyCount(s, stats);
    assert.strictEqual(r.completedItem, false);
    assert.strictEqual(r.seq.index, 0);
    assert.strictEqual(r.seq.count, i + 1);
    s = r.seq;
    stats = r.stats;
  }
  assert.strictEqual(s.count, 32);
});

ok('tap 33 completes Dhikr 1, auto-advances, resets counter to zero', () => {
  let s = T.newSequence();
  let stats = T.emptyDayStats();
  for (let i = 0; i < 32; i++) {
    const r = T.applyCount(s, stats);
    s = r.seq;
    stats = r.stats;
  }
  const r = T.applyCount(s, stats);
  assert.strictEqual(r.completedItem, true, 'vibration/complete trigger');
  assert.strictEqual(r.completedItemInfo.id, 'subhanallah');
  assert.strictEqual(r.cycleDone, false);
  assert.strictEqual(r.seq.completed[0], true, 'marked completed');
  assert.strictEqual(r.seq.index, 1, 'advanced to next Dhikr');
  assert.strictEqual(r.seq.count, 0, 'counter reset to zero');
  assert.strictEqual(r.seq.items[r.seq.index].id, 'astaghfirullah', 'next Dhikr displayed');
  assert.strictEqual(r.stats.counts.subhanallah, 33, 'daily stats attributed');
});

ok('full default cycle: 33/33/33/33 auto-advances three times then completes', () => {
  let s = T.newSequence();
  let stats = T.emptyDayStats();
  const advances = [];
  for (let tap = 1; tap <= 33 * 4; tap++) {
    const r = T.applyCount(s, stats);
    if (r.completedItem) advances.push(r.completedItemInfo.id);
    s = r.seq;
    stats = r.stats;
  }
  assert.deepStrictEqual(advances, ['subhanallah', 'astaghfirullah', 'alhamdulillah', 'allahuakbar']);
  assert.strictEqual(T.cycleComplete(s), true);
  assert.strictEqual(s.cycles, 1);
  assert.strictEqual(stats.cycles, 1);
  assert.deepStrictEqual(stats.counts, { subhanallah: 33, astaghfirullah: 33, alhamdulillah: 33, allahuakbar: 33 });
});

ok('startNextCycle resets counters and completed marks, keeps cycles', () => {
  let s = T.newSequence();
  let stats = T.emptyDayStats();
  for (let tap = 0; tap < 33 * 4; tap++) {
    const r = T.applyCount(s, stats);
    s = r.seq;
    stats = r.stats;
  }
  const next = T.startNextCycle(s);
  assert.strictEqual(next.index, 0);
  assert.strictEqual(next.count, 0);
  assert.deepStrictEqual(next.completed, [false, false, false, false]);
  assert.strictEqual(next.cycles, 1, 'cycles preserved');
});

ok('custom target 99 advances at 99 (and 10 at 10)', () => {
  let s = T.setTarget(T.newSequence(), 99);
  let stats = T.emptyDayStats();
  for (let i = 0; i < 98; i++) {
    const r = T.applyCount(s, stats);
    assert.strictEqual(r.completedItem, false);
    s = r.seq;
    stats = r.stats;
  }
  let r = T.applyCount(s, stats);
  assert.strictEqual(r.completedItem, true);
  assert.strictEqual(r.seq.index, 1);
  assert.strictEqual(r.seq.count, 0);

  s = T.setTarget(T.newSequence(), 10);
  stats = T.emptyDayStats();
  for (let i = 0; i < 9; i++) {
    r = T.applyCount(s, stats);
    assert.strictEqual(r.completedItem, false);
    s = r.seq;
    stats = r.stats;
  }
  r = T.applyCount(s, stats);
  assert.strictEqual(r.completedItem, true);
});

ok('reorderItems moves entries without mutating the input', () => {
  const items = T.newSequence().items;
  const out = T.reorderItems(items, 0, 2);
  assert.deepStrictEqual(out.map((i) => i.id), ['astaghfirullah', 'alhamdulillah', 'subhanallah', 'allahuakbar']);
  assert.strictEqual(items[0].id, 'subhanallah', 'input untouched');
});

ok('addItem appends; removeItem clamps the live position', () => {
  let s = T.newSequence();
  s = T.addItem(s, { id: 'x', ar: 'x', translit: 'X', meaning: 'x' });
  assert.strictEqual(s.items.length, 5);
  // move to index 2 then remove index 0 -> current shifts to 1
  s = { ...s, index: 2, count: 7 };
  s = T.removeItem(s, 0);
  assert.strictEqual(s.items.length, 4);
  assert.strictEqual(s.index, 1);
  assert.strictEqual(s.count, 7);
  // removing the live item resets its counter
  s = T.removeItem(s, 1);
  assert.strictEqual(s.count, 0);
  assert.strictEqual(s.index, 1);
  // cannot remove the last remaining item
  let s2 = T.newSequence([{ id: 'only', ar: 'a', translit: 'A', meaning: '' }]);
  s2 = T.removeItem(s2, 0);
  assert.strictEqual(s2.items.length, 1);
});

ok('lowering the target below the live count still auto-advances on the next tap', () => {
  let s = T.setTarget(T.newSequence(), 50);
  let stats = T.emptyDayStats();
  for (let i = 0; i < 45; i++) {
    const r = T.applyCount(s, stats);
    s = r.seq;
    stats = r.stats;
  }
  s = T.setTarget(s, 33);
  const r = T.applyCount(s, stats);
  assert.strictEqual(r.completedItem, true);
  assert.strictEqual(r.seq.index, 1);
});

ok('normalizeSequence repairs partial/corrupt persisted state', () => {
  const n1 = T.normalizeSequence(null);
  assert.strictEqual(n1.items.length, 4);
  const n2 = T.normalizeSequence({ items: [{ ar: 'x' }], index: 9, count: -4, target: 0, completed: [] });
  assert.strictEqual(n2.items.length, 1);
  assert.strictEqual(n2.items[0].translit, '');
  assert.strictEqual(n2.index, 0);
  assert.strictEqual(n2.count, 0);
  assert.strictEqual(n2.target, 33);
  assert.deepStrictEqual(n2.completed, [false]);
});

ok('todayKey is a local YYYY-MM-DD date', () => {
  const k = T.todayKey(new Date(2026, 10, 14, 23, 59));
  assert.strictEqual(k, '2026-11-14');
});

console.log(`TASBEEH TESTS: ${passed}/11 PASSED`);
