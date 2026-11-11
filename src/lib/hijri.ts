/**
 * Hijri (Umm al-Qura / Kuwaiti tabular) conversion computed locally.
 * Validated against Umm al-Qura: 11 Nov 2026 = 1 Jumada al-Akhirah 1448.
 * A user adjustment (settings.hijriAdjust, ±2 days) absorbs moon-sighting drift.
 */

export interface HijriDate {
  y: number;
  m: number;
  d: number;
}

export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhul-Qi'dah",
  'Dhul-Hijjah',
];

export const HIJRI_MONTHS_AR = [
  'مُحَرَّم',
  'صَفَر',
  'رَبِيع ٱلْأَوَّل',
  'رَبِيع ٱلثَّانِي',
  'جُمَادَىٰ ٱلْأُولَىٰ',
  'جُمَادَىٰ ٱلْآخِرَة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو ٱلْقَعْدَة',
  'ذُو ٱلْحِجَّة',
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function gregorianToJD(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

export function toHijri(date: Date, adjust = 0): HijriDate {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate()) + adjust + 1;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l) / 709);
  const d = l - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { y, m, d };
}

export function hijriToGregorian(h: HijriDate): Date {
  const jd =
    Math.floor((11 * h.y + 3) / 30) +
    354 * h.y +
    30 * h.m -
    Math.floor((h.m - 1) / 2) +
    h.d +
    1948440 -
    386;
  // JD to Gregorian (valid for JD >= 2299161)
  let a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const dd = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * dd) / 4);
  const mm = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * mm + 2) / 5) + 1;
  const month = mm + 3 - 12 * Math.floor(mm / 10);
  const year = 100 * b + dd - 4800 + Math.floor(mm / 10);
  return new Date(year, month - 1, day);
}

export function formatHijri(h: HijriDate, withYear = true): string {
  return `${h.d} ${HIJRI_MONTHS[h.m - 1]}${withYear ? ` ${h.y}` : ''}`;
}

export function formatHijriAr(h: HijriDate, withYear = true): string {
  return `${h.d} ${HIJRI_MONTHS_AR[h.m - 1]}${withYear ? ` ${h.y} هـ` : ''}`;
}

export function weekdayName(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export function weekdayNameAr(date: Date): string {
  return WEEKDAYS_AR[date.getDay()];
}

export interface IslamicEvent {
  m: number;
  d: number;
  name: string;
  note?: string;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { m: 1, d: 1, name: 'Islamic New Year' },
  { m: 1, d: 10, name: 'Day of Ashura', note: 'Fast the 9th and 10th, or 10th and 11th' },
  { m: 3, d: 12, name: 'Mawlid al-Nabi', note: 'Observed by many communities; date may vary' },
  { m: 7, d: 27, name: 'Isra and Miʿraj', note: 'Observed by many communities; date may vary' },
  { m: 8, d: 15, name: 'Mid-Shaʿban', note: 'Observed by many communities' },
  { m: 9, d: 1, name: 'First of Ramadan', note: 'Subject to moon sighting' },
  { m: 9, d: 27, name: 'Laylat al-Qadr (commonly observed)', note: 'Seek it in the last ten nights, odd nights' },
  { m: 10, d: 1, name: 'Eid al-Fitr', note: 'Subject to moon sighting' },
  { m: 12, d: 9, name: 'Day of Arafah', note: 'Fast for those not performing Hajj' },
  { m: 12, d: 10, name: 'Eid al-Adha', note: 'Subject to moon sighting' },
];

export function eventsForHijriMonth(m: number): IslamicEvent[] {
  return ISLAMIC_EVENTS.filter((e) => e.m === m);
}

export function daysInHijriMonth(h: HijriDate): number {
  // odd months 30, even months 29, with leap adjustments from conversion round-trip
  const len = h.m % 2 === 1 ? 30 : 29;
  // verify round trip for month length robustness
  const start = hijriToGregorian({ y: h.y, m: h.m, d: 1 });
  let count = 0;
  for (let i = 0; i < 32; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const hh = toHijri(d);
    if (hh.y === h.y && hh.m === h.m) count++;
    else break;
  }
  return count || len;
}
