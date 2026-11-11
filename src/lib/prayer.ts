import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';
import type { MethodId, PrayerKey, Settings } from '../types';
import { PRAYER_KEYS } from '../types';

export interface DayTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

const FACTORIES: Record<MethodId, () => ReturnType<typeof CalculationMethod.MuslimWorldLeague>> = {
  muslimWorldLeague: () => CalculationMethod.MuslimWorldLeague(),
  egyptian: () => CalculationMethod.Egyptian(),
  karachi: () => CalculationMethod.Karachi(),
  ummAlQura: () => CalculationMethod.UmmAlQura(),
  northAmerica: () => CalculationMethod.NorthAmerica(),
  kuwait: () => CalculationMethod.Kuwait(),
  qatar: () => CalculationMethod.Qatar(),
  singapore: () => CalculationMethod.Singapore(),
  turkey: () => CalculationMethod.Turkey(),
  dubai: () => CalculationMethod.Dubai(),
  tehran: () => CalculationMethod.Tehran(),
  moonsighting: () => CalculationMethod.MoonsightingCommittee(),
};

function params(method: MethodId, madhab: 'shafi' | 'hanafi') {
  const p = FACTORIES[method]();
  p.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return p;
}

export function timesFor(date: Date, settings: Pick<Settings, 'lat' | 'lng' | 'method' | 'madhab'>): DayTimes {
  const coords = new Coordinates(settings.lat, settings.lng);
  const t = new PrayerTimes(coords, date, params(settings.method, settings.madhab));
  return {
    fajr: t.fajr,
    sunrise: t.sunrise,
    dhuhr: t.dhuhr,
    asr: t.asr,
    maghrib: t.maghrib,
    isha: t.isha,
  };
}

export function prayerTime(times: DayTimes, key: PrayerKey): Date {
  return times[key];
}

export interface NextPrayerInfo {
  key: PrayerKey | 'sunrise';
  at: Date;
  /** the prayer that is currently "in effect" (the most recent one that began) */
  current: PrayerKey | 'sunrise';
  currentAt: Date;
}

export function nextPrayer(now: Date, times: DayTimes, tomorrow: DayTimes): NextPrayerInfo {
  const sequence: { key: PrayerKey | 'sunrise'; at: Date }[] = [
    { key: 'fajr', at: times.fajr },
    { key: 'sunrise', at: times.sunrise },
    { key: 'dhuhr', at: times.dhuhr },
    { key: 'asr', at: times.asr },
    { key: 'maghrib', at: times.maghrib },
    { key: 'isha', at: times.isha },
    { key: 'fajr', at: tomorrow.fajr },
  ];
  for (const entry of sequence) {
    if (entry.at.getTime() > now.getTime()) {
      const idx = sequence.indexOf(entry);
      const prev = sequence[Math.max(0, idx - 1)];
      return { key: entry.key, at: entry.at, current: prev.key, currentAt: prev.at };
    }
  }
  // Should be unreachable (tomorrow.fajr is always in the future).
  return { key: 'fajr', at: tomorrow.fajr, current: 'isha', currentAt: times.isha };
}

export function formatTime(date: Date, format: 12 | 24): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const mm = m.toString().padStart(2, '0');
  if (format === 24) return `${h.toString().padStart(2, '0')}:${mm}`;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${suffix}`;
}

export function countdownParts(from: Date, to: Date): { h: number; m: number; s: number; totalMs: number } {
  const totalMs = Math.max(0, to.getTime() - from.getTime());
  const totalSec = Math.floor(totalMs / 1000);
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
    totalMs,
  };
}

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const PRAYER_ORDER = PRAYER_KEYS;
