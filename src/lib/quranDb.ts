import { importDatabaseFromAssetAsync, openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import quranAr from '../data/quran-ar.json';
import quranEn from '../data/quran-en.json';

/**
 * Offline three-layer Quran database (SQLite).
 *
 * The DB ships inside the app package (assets/data/quran.db, built by
 * scripts/build-quran-db.py from verified sources) and is copied into the
 * app's private database directory on first use. No network is ever involved.
 * If the database cannot be opened, reads fall back to the bundled JSON layers
 * (Arabic + English) so the Quran screen always works.
 */

export interface VerseRow {
  n: number;
  ar: string;
  translit: string;
  en: string;
  sw: string;
}

export interface QuranSources {
  arabic: string;
  translit: string;
  en: string;
  sw: string;
}

const DB_NAME = 'noor-quran.db';

export const FALLBACK_SOURCES: QuranSources = {
  arabic: 'Tanzil.net — Uthmani script',
  translit: 'Quran transliteration (quran.com dataset via AlQuran.cloud)',
  en: 'Translation by Talal Itani, ClearQuran.com.',
  sw: 'Kiswahili translation by Ali Muhsin Al-Barwani (via AlQuran.cloud)',
};

const AR = quranAr as Record<string, Record<string, string>>;
const EN = quranEn as Record<string, Record<string, string>>;

let db: SQLiteDatabase | null = null;
let dbUnavailable = false;
let init: Promise<void> | null = null;

async function ensureDb(): Promise<void> {
  if (db || dbUnavailable) return;
  if (!init) {
    init = (async () => {
      try {
        await importDatabaseFromAssetAsync(DB_NAME, {
          assetId: require('../../assets/data/quran.db'),
        });
        db = openDatabaseSync(DB_NAME);
      } catch {
        dbUnavailable = true;
        db = null;
      }
    })();
  }
  await init;
}

function fallbackVerses(surah: number): VerseRow[] {
  const ar = AR[String(surah)] ?? {};
  const en = EN[String(surah)] ?? {};
  return Object.keys(ar)
    .map(Number)
    .sort((a, b) => a - b)
    .map((n) => ({
      n,
      ar: ar[String(n)] ?? '',
      translit: '',
      en: en[String(n)] ?? '',
      sw: '',
    }));
}

/** All verses of a surah (1..114), ordered. Never throws. */
export async function loadSurahVerses(surah: number): Promise<VerseRow[]> {
  await ensureDb();
  if (db) {
    try {
      const rows = db.getAllSync<{ ayah: number; arabic: string; translit: string; en: string; sw: string }>(
        'SELECT ayah, arabic, translit, en, sw FROM verses WHERE surah = ? ORDER BY ayah',
        surah,
      );
      if (rows.length > 0) {
        return rows.map((r) => ({ n: r.ayah, ar: r.arabic, translit: r.translit, en: r.en, sw: r.sw }));
      }
    } catch {
      // fall through to JSON fallback
    }
  }
  return fallbackVerses(surah);
}

/** Attribution strings for the displayed layers. Never throws. */
export async function loadQuranSources(): Promise<QuranSources> {
  await ensureDb();
  if (db) {
    try {
      const rows = db.getAllSync<{ k: string; v: string }>('SELECT k, v FROM meta');
      const map = Object.fromEntries(rows.map((r) => [r.k, r.v]));
      return {
        arabic: map.arabic ?? FALLBACK_SOURCES.arabic,
        translit: map.translit ?? FALLBACK_SOURCES.translit,
        en: map.en ?? FALLBACK_SOURCES.en,
        sw: map.sw ?? FALLBACK_SOURCES.sw,
      };
    } catch {
      // fall through
    }
  }
  return FALLBACK_SOURCES;
}
