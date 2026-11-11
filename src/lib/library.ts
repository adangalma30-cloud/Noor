import { ADHAN_TRACKS, QURAN_BUNDLED } from '../data/audio-assets';
import type { AdhanTrack, ReciterInfo } from '../types';

export interface LibraryState {
  adhans: AdhanTrack[];
  reciters: ReciterInfo[];
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const LIBRARY_KEY = 'noor.library.v1';

let library: LibraryState = { adhans: [], reciters: [] };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function loadLibrary(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(LIBRARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LibraryState;
      library = { adhans: parsed.adhans ?? [], reciters: parsed.reciters ?? [] };
      emit();
    }
  } catch {
    // ignore corrupt library — bundled content still works
  }
}

function persist() {
  AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library)).catch(() => {});
}

export function useLibrary(): LibraryState {
  return useSyncExternalStore(subscribe, () => library);
}

export function allAdhanTracks(): AdhanTrack[] {
  return [...ADHAN_TRACKS, ...library.adhans];
}

export function findTrack(id: string | null | undefined): AdhanTrack | undefined {
  if (!id) return undefined;
  return allAdhanTracks().find((t) => t.id === id);
}

export function allReciters(): ReciterInfo[] {
  return [...QURAN_BUNDLED, ...library.reciters];
}

export function findReciter(id: string): ReciterInfo | undefined {
  return allReciters().find((r) => r.id === id);
}

export function addImportedAdhan(track: AdhanTrack): void {
  library = { ...library, adhans: [...library.adhans.filter((t) => t.id !== track.id), track] };
  persist();
  emit();
}

export function removeImportedAdhan(id: string): void {
  library = { ...library, adhans: library.adhans.filter((t) => t.id !== id) };
  persist();
  emit();
}

export function upsertImportedReciter(reciter: ReciterInfo): void {
  library = { ...library, reciters: [...library.reciters.filter((r) => r.id !== reciter.id), reciter] };
  persist();
  emit();
}

export function removeImportedReciter(id: string): void {
  library = { ...library, reciters: library.reciters.filter((r) => r.id !== id) };
  persist();
  emit();
}

/**
 * Classify picked audio file names into a surah/ayah map.
 * Conventions: "036.mp3" → surah 36; "036005.mp3" or "36-5.mp3" → surah 36 ayah 5.
 */
export function classifyFiles(names: string[]): {
  perSurah: Record<number, string>;
  perAyah: Record<number, Record<number, string>>;
} {
  const perSurah: Record<number, string> = {};
  const perAyah: Record<number, Record<number, string>> = {};
  for (const name of names) {
    const base = name.replace(/\.[a-z0-9]+$/i, '');
    const combo = base.match(/^(\d{1,3})[_\-]?(\d{1,3})$/);
    const single = base.match(/^(\d{1,3})$/);
    const comboFixed = base.match(/^(\d{3})(\d{3})$/);
    if (comboFixed) {
      const s = parseInt(comboFixed[1], 10);
      const a = parseInt(comboFixed[2], 10);
      if (s >= 1 && s <= 114 && a >= 1) {
        (perAyah[s] ??= {})[a] = name;
        continue;
      }
    }
    if (combo && !single) {
      const s = parseInt(combo[1], 10);
      const a = parseInt(combo[2], 10);
      if (s >= 1 && s <= 114 && a >= 1) {
        (perAyah[s] ??= {})[a] = name;
        continue;
      }
    }
    if (single) {
      const s = parseInt(single[1], 10);
      if (s >= 1 && s <= 114) perSurah[s] = name;
    }
  }
  return { perSurah, perAyah };
}
