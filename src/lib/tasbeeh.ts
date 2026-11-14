// Smart Tasbeeh — pure logic (no React Native imports) so the behaviour can be
// unit-tested against the real implementation (scripts/run-tasbeeh-tests.sh).
//
// The exact advancement contract (from the 0.0.4 spec):
//   When the current counter reaches the target exactly:
//     1. trigger a short vibration            (handled by the screen)
//     2. mark the current Dhikr as completed
//     3. automatically advance to the next Dhikr
//     4. reset the current counter to zero
//     5. display the next Dhikr immediately   (handled by the screen)
//     6. counting can continue immediately — no Next button
//   After the final Dhikr of a sequence completes, the cycle is complete and
//   the user is offered to start another cycle (startNextCycle).
import type { DhikrDayStats, DhikrItem, TasbeehSequence } from '../types';

export const DEFAULT_DHIKR: DhikrItem[] = [
  {
    id: 'subhanallah',
    ar: 'سُبْحَانَ اللَّهِ',
    translit: 'Subḥānallāh',
    meaning: 'Glory be to Allah',
  },
  {
    id: 'astaghfirullah',
    ar: 'أَسْتَغْفِرُ اللَّهَ',
    translit: 'Astaghfirullāh',
    meaning: 'I seek forgiveness from Allah',
  },
  {
    id: 'alhamdulillah',
    ar: 'الْحَمْدُ لِلَّهِ',
    translit: 'Alḥamdulillāh',
    meaning: 'All praise is for Allah',
  },
  {
    id: 'allahuakbar',
    ar: 'اللَّهُ أَكْبَرُ',
    translit: 'Allāhu akbar',
    meaning: 'Allah is the Greatest',
  },
];

export const TARGET_CHOICES = [10, 33, 34, 99];

export function newSequence(items: DhikrItem[] = DEFAULT_DHIKR, target = 33): TasbeehSequence {
  return {
    items: items.map((i) => ({ ...i })),
    target,
    index: 0,
    count: 0,
    completed: items.map(() => false),
    cycles: 0,
  };
}

export function emptyDayStats(): DhikrDayStats {
  return { counts: {}, cycles: 0 };
}

/** Local calendar date key (YYYY-MM-DD) used for daily statistics. */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type CountResult = {
  seq: TasbeehSequence;
  stats: DhikrDayStats;
  /** True when this tap completed the current Dhikr (reached the target). */
  completedItem: boolean;
  /** True when the tap completed the final Dhikr of the sequence. */
  cycleDone: boolean;
  /** The Dhikr that was completed on this tap (for UI messaging). */
  completedItemInfo: DhikrItem | null;
};

/**
 * Apply one tap of the counting button. Pure: returns new state.
 * Cycle completion (cycleDone) leaves index/count at the end of the sequence;
 * startNextCycle() then resets for another round.
 */
export function applyCount(seq: TasbeehSequence, stats: DhikrDayStats, now: Date = new Date()): CountResult {
  const item = seq.items[seq.index];
  const count = seq.count + 1;
  const base: CountResult = {
    seq: { ...seq, items: seq.items.map((i) => ({ ...i })), completed: [...seq.completed] },
    stats: {
      counts: { ...stats.counts },
      cycles: stats.cycles,
    },
    completedItem: false,
    cycleDone: false,
    completedItemInfo: null,
  };
  if (!item) return base;

  // Daily statistics: counts are attributed to the tapped Dhikr.
  base.stats.counts[item.id] = (base.stats.counts[item.id] ?? 0) + 1;

  // >= (not just ===) so lowering the target below the live count still advances.
  if (count >= seq.target) {
    base.completedItem = true;
    base.completedItemInfo = item;
    base.seq.completed[seq.index] = true;
    const isLast = seq.index >= seq.items.length - 1;
    if (isLast) {
      base.cycleDone = true;
      base.seq.count = seq.target;
      base.seq.cycles = seq.cycles + 1;
      base.stats.cycles = stats.cycles + 1;
    } else {
      base.seq.index = seq.index + 1;
      base.seq.count = 0;
    }
    return base;
  }

  base.seq.count = count;
  return base;
}

/** Reset the current Dhikr's counter (keeps position and completed marks). */
export function resetCount(seq: TasbeehSequence): TasbeehSequence {
  return { ...seq, count: 0, completed: [...seq.completed] };
}

/** Reset the whole session: back to the first Dhikr, nothing completed. */
export function resetSession(seq: TasbeehSequence): TasbeehSequence {
  return { ...seq, index: 0, count: 0, completed: seq.items.map(() => false) };
}

/** Start another cycle after a completion (or restart mid-cycle). */
export function startNextCycle(seq: TasbeehSequence): TasbeehSequence {
  return resetSession(seq);
}

export function setTarget(seq: TasbeehSequence, target: number): TasbeehSequence {
  const t = Math.max(1, Math.min(100000, Math.floor(target)));
  return { ...seq, target: t };
}

export function cycleComplete(seq: TasbeehSequence): boolean {
  return seq.items.length > 0 && seq.completed.every(Boolean);
}

export function reorderItems(items: DhikrItem[], from: number, to: number): DhikrItem[] {
  const next = items.map((i) => ({ ...i }));
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next;
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Remove item at index; clamps the live session position so counting stays valid.
 */
export function removeItem(seq: TasbeehSequence, index: number): TasbeehSequence {
  if (seq.items.length <= 1 || index < 0 || index >= seq.items.length) return seq;
  const items = seq.items.map((i) => ({ ...i }));
  items.splice(index, 1);
  const completed = seq.completed.filter((_, i) => i !== index);
  let cur = seq.index;
  let count = seq.count;
  if (index < seq.index) cur -= 1;
  if (index === seq.index) {
    // The live Dhikr was removed — start its successor fresh.
    count = 0;
    if (cur >= items.length) cur = items.length - 1;
    if (cur < 0) cur = 0;
  }
  return { ...seq, items, completed, index: cur, count };
}

export function addItem(seq: TasbeehSequence, item: DhikrItem): TasbeehSequence {
  return {
    ...seq,
    items: [...seq.items.map((i) => ({ ...i })), { ...item }],
    completed: [...seq.completed, false],
  };
}

/**
 * Defensive normaliser for state restored from persistence: fills any missing
 * fields so a corrupt/partial entry can never break the screen.
 */
export function normalizeSequence(raw: unknown): TasbeehSequence {
  const fallback = newSequence();
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Partial<TasbeehSequence>;
  const items: DhikrItem[] =
    Array.isArray(r.items) && r.items.length > 0
      ? r.items
          .filter((i): i is DhikrItem => !!i && typeof i.ar === 'string')
          .map((i) => ({
            id: typeof i.id === 'string' && i.id ? i.id : `dhikr-${Math.random().toString(36).slice(2, 9)}`,
            ar: i.ar,
            translit: typeof i.translit === 'string' ? i.translit : '',
            meaning: typeof i.meaning === 'string' ? i.meaning : '',
          }))
      : fallback.items;
  const completed = Array.isArray(r.completed)
    ? items.map((_, i) => !!r.completed![i])
    : items.map(() => false);
  const index = typeof r.index === 'number' && r.index >= 0 ? Math.min(Math.floor(r.index), items.length - 1) : 0;
  const target = typeof r.target === 'number' && r.target >= 1 ? Math.floor(r.target) : 33;
  const count = typeof r.count === 'number' && r.count >= 0 ? Math.floor(r.count) : 0;
  const cycles = typeof r.cycles === 'number' && r.cycles >= 0 ? Math.floor(r.cycles) : 0;
  return { items, target, index, count, completed, cycles };
}
