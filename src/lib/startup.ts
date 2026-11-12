import { loadPersistedState } from './store';

/**
 * Startup sequencing for NOOR.
 *
 * Rules:
 *  - The dashboard must appear quickly and must always appear: no task here may
 *    hold the splash screen hostage.
 *  - Only saved settings are essential. Audio, the imported-recitation library
 *    and notifications are optional and start after the dashboard is up.
 *  - Everything is local: no network, no remote APIs, works in airplane mode.
 */

/** Rejects with a descriptive error if `promise` has not settled within `ms`. */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms} ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

/**
 * Essential startup: load saved settings so the dashboard can render with the
 * user's city, calculation method and theme. Throws (rather than hanging or
 * silently ignoring) on failure so the caller can show an error + retry.
 * Corrupt stored JSON never throws — the store falls back to defaults.
 */
export async function runEssentialStartup(timeoutMs = 3000): Promise<void> {
  await withTimeout(loadPersistedState(), timeoutMs, 'Loading saved settings');
}
