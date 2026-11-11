import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { City, MethodId, PrayerKey, Progress, Settings } from '../types';

const SETTINGS_KEY = 'noor.settings.v1';
const PROGRESS_KEY = 'noor.progress.v1';

export const DEFAULT_SETTINGS: Settings = {
  locationMode: 'manual',
  city: { n: 'Nairobi', a: 'Nairobi', c: 'KE', r: '05', lat: -1.283, lng: 36.817, t: 'Africa/Nairobi', p: 4397073 },
  lat: -1.283,
  lng: 36.817,
  label: 'Nairobi, KE',
  method: 'muslimWorldLeague',
  madhab: 'shafi',
  timeFormat: 12,
  theme: 'system',
  hijriAdjust: 0,
  preMinutes: 10,
  notifyAtTime: true,
  notifyPerPrayer: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  adhanDefault: 'doha_fajr',
  adhanPerPrayer: {
    fajr: 'doha_fajr',
    dhuhr: 'doha_dhuhr',
    asr: 'doha_asr',
    maghrib: 'doha_maghrib',
    isha: 'doha_isha',
  },
  adhanVolume: 0.9,
  autoPlayAdhan: true,
  showTranslation: true,
  fontSize: 19,
  readingGoal: 20,
};

export const DEFAULT_PROGRESS: Progress = {
  bookmarks: {},
  lastRead: null,
  tracker: {},
  readingLog: {},
  tasbeeh: { count: 0, total: 0, preset: 'سُبْحَانَ اللَّهِ' },
};

let settings: Settings = DEFAULT_SETTINGS;
let progress: Progress = DEFAULT_PROGRESS;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function loadPersistedState(): Promise<void> {
  try {
    const [s, p] = await Promise.all([AsyncStorage.getItem(SETTINGS_KEY), AsyncStorage.getItem(PROGRESS_KEY)]);
    if (s) settings = { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
    if (p) progress = { ...DEFAULT_PROGRESS, ...JSON.parse(p) };
    emit();
  } catch {
    // Corrupt storage must never break the app — fall back to defaults.
  }
}

function persistSettings() {
  AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
}
function persistProgress() {
  AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)).catch(() => {});
}

export function updateSettings(patch: Partial<Settings>): void {
  settings = { ...settings, ...patch };
  persistSettings();
  emit();
}

export function setCity(city: City): void {
  updateSettings({ city, lat: city.lat, lng: city.lng, label: `${city.n}, ${city.c}`, locationMode: 'manual' });
}

export function setGpsLocation(lat: number, lng: number, label: string): void {
  updateSettings({ locationMode: 'auto', lat, lng, label });
}

export function updateProgress(patch: Partial<Progress>): void {
  progress = { ...progress, ...patch };
  persistProgress();
  emit();
}

export function toggleBookmark(key: string): void {
  const bookmarks = { ...progress.bookmarks };
  if (bookmarks[key]) delete bookmarks[key];
  else bookmarks[key] = true;
  updateProgress({ bookmarks });
}

export function logPrayer(dateKey: string, prayer: PrayerKey, value: boolean): void {
  const day = { ...(progress.tracker[dateKey] ?? {}) };
  day[prayer] = value;
  updateProgress({ tracker: { ...progress.tracker, [dateKey]: day } });
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => settings);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, () => progress);
}

export function getSettings(): Settings {
  return settings;
}

export function getProgress(): Progress {
  return progress;
}

export const METHOD_LABELS: Record<MethodId, string> = {
  muslimWorldLeague: 'Muslim World League (18° / 17°)',
  egyptian: 'Egyptian General Authority (19.5° / 17.5°)',
  karachi: 'University of Islamic Sciences, Karachi (18° / 18°)',
  ummAlQura: 'Umm al-Qura, Makkah (18.5° / 90 min)',
  northAmerica: 'ISNA, North America (15° / 15°)',
  kuwait: 'Kuwait (18° / 17.5°)',
  qatar: 'Qatar (18° / 90 min)',
  singapore: 'Singapore (20° / 18°)',
  turkey: 'Türkiye (Diyanet, 18° / 17°)',
  dubai: 'Dubai (18.2° / 18.2°)',
  tehran: 'Institute of Geophysics, Tehran (17.7° / 14°)',
  moonsighting: 'Moonsighting Committee (18° / 18°)',
};
