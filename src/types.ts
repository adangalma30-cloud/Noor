export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_KEYS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PRAYER_NAMES: Record<PrayerKey, { en: string; ar: string }> = {
  fajr: { en: 'Fajr', ar: 'الفجر' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
  asr: { en: 'Asr', ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha: { en: 'Isha', ar: 'العشاء' },
};

export type MethodId =
  | 'muslimWorldLeague'
  | 'egyptian'
  | 'karachi'
  | 'ummAlQura'
  | 'northAmerica'
  | 'kuwait'
  | 'qatar'
  | 'singapore'
  | 'turkey'
  | 'dubai'
  | 'tehran'
  | 'moonsighting';

export interface City {
  n: string;
  a: string;
  c: string;
  r?: string;
  lat: number;
  lng: number;
  t: string;
  p?: number;
}

export interface Settings {
  locationMode: 'auto' | 'manual';
  city: City | null;
  lat: number;
  lng: number;
  label: string;
  method: MethodId;
  madhab: 'shafi' | 'hanafi';
  timeFormat: 12 | 24;
  theme: 'light' | 'dark' | 'system';
  hijriAdjust: number;
  preMinutes: number;
  notifyAtTime: boolean;
  notifyPerPrayer: Record<PrayerKey, boolean>;
  adhanDefault: string;
  adhanPerPrayer: Record<PrayerKey, string | null>;
  adhanVolume: number;
  autoPlayAdhan: boolean;
  showTranslation: boolean;
  fontSize: 17 | 19 | 21;
  readingGoal: number;
}

export interface Progress {
  bookmarks: Record<string, boolean>;
  lastRead: { surah: number; ayah: number } | null;
  tracker: Record<string, Record<PrayerKey, boolean>>;
  readingLog: Record<string, number>;
  tasbeeh: { count: number; total: number; preset: string };
}

export interface AdhanTrack {
  id: string;
  name: string;
  muezzin: string;
  isFajr: boolean;
  durationSec: number;
  /** Notification sound file name inside Android res/raw (bundled tracks only). */
  soundFile: string | null;
  license: string;
  /** require() asset id for in-app playback. */
  src: number;
  imported?: boolean;
  uri?: string;
}

export interface ReciterInfo {
  id: string;
  name: string;
  source: string;
  license: string;
  /** surah number -> require() asset id or file uri */
  files: Record<number, number | string>;
  /** optional per-ayah files: surah -> ayah -> uri (enables verse repeat) */
  ayahFiles?: Record<number, Record<number, string>>;
  imported?: boolean;
}
