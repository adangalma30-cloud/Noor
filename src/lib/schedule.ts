import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { ADHAN_TRACKS } from '../data/audio-assets';
import { findTrack } from './library';
import { addDays, dayKey, timesFor } from './prayer';
import { getSettings } from './store';
import { PRAYER_KEYS, PRAYER_NAMES, type PrayerKey } from '../types';

export const REMINDER_CHANNEL = 'reminders';

/** Fallback channel for imported adhans (custom sounds require a rebuild). */
export const CUSTOM_CHANNEL = 'custom';

export function channelForTrack(trackId: string | null | undefined): string {
  const t = findTrack(trackId);
  return t?.soundFile ? `adhan-${t.id}` : CUSTOM_CHANNEL;
}

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function ensureChannels(): Promise<void> {
  const base: {
    importance: Notifications.AndroidImportance;
    vibrationPattern: number[];
    lightColor: string;
    enableVibrate: boolean;
    showBadge: boolean;
  } = {
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 220],
    lightColor: '#0E5A44',
    enableVibrate: true,
    showBadge: false,
  };
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
    ...base,
    name: 'Prayer reminders',
    sound: 'default',
  });
  await Notifications.setNotificationChannelAsync(CUSTOM_CHANNEL, {
    ...base,
    name: 'Adhan (custom / default sound)',
    sound: 'default',
  });
  for (const t of ADHAN_TRACKS) {
    await Notifications.setNotificationChannelAsync(`adhan-${t.id}`, {
      ...base,
      name: `Adhan – ${t.name}`,
      sound: t.soundFile,
    });
  }
}

function notificationFor(key: PrayerKey, atTime: boolean, label: string) {
  const name = PRAYER_NAMES[key];
  return atTime
    ? {
        title: `It is time for ${name.en}`,
        body: `${name.en} prayer begins now in ${label}.`,
      }
    : {
        title: `${name.en} in a few minutes`,
        body: `${name.en} prayer begins shortly in ${label}. Prepare for salah.`,
      };
}

/**
 * Schedule prayer notifications for the next 7 days (rolling; refreshed on
 * every app launch and settings change). expo-notifications persists alarms
 * with AlarmManager and re-registers them after device restarts.
 */
export async function rescheduleAll(): Promise<number> {
  const s = getSettings();
  await ensureNotificationPermissions();
  await ensureChannels();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  let count = 0;
  for (let d = 0; d < 7; d++) {
    const day = addDays(now, d);
    const times = timesFor(day, s);
    for (const key of PRAYER_KEYS) {
      const at = times[key];
      if (at.getTime() <= now.getTime()) continue;

      if (s.notifyAtTime && s.notifyPerPrayer[key]) {
        const trackId = s.adhanPerPrayer[key] ?? s.adhanDefault;
        const track = findTrack(trackId);
        const content = {
          ...notificationFor(key, true, s.label),
          sound: track?.soundFile ?? 'default',
          // Android channel for custom sound + Do Not Disturb respect
          ...(track?.soundFile ? {} : {}),
        };
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: SchedulableTriggerInputTypes.DATE,
            date: at,
            channelId: channelForTrack(trackId),
          } as Notifications.DateTriggerInput,
        });
        count++;
      }

      if (s.preMinutes > 0 && s.notifyPerPrayer[key]) {
        const pre = new Date(at.getTime() - s.preMinutes * 60_000);
        if (pre.getTime() > now.getTime()) {
          await Notifications.scheduleNotificationAsync({
            content: { ...notificationFor(key, false, s.label), sound: 'default' },
            trigger: {
              type: SchedulableTriggerInputTypes.DATE,
              date: pre,
              channelId: REMINDER_CHANNEL,
            } as Notifications.DateTriggerInput,
          });
          count++;
        }
      }
    }
  }
  return count;
}

/**
 * Called from the UI when a prayer time passes while the app is open:
 * plays the assigned adhan if the user enabled automatic playback.
 */
export function adhanForPrayer(key: PrayerKey): string {
  const s = getSettings();
  return s.adhanPerPrayer[key] ?? s.adhanDefault;
}

export function scheduledDayKeys(start = new Date(), days = 7): string[] {
  return Array.from({ length: days }, (_, i) => dayKey(addDays(start, i)));
}
