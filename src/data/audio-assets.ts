import type { AdhanTrack, ReciterInfo } from '../types';

/**
 * Bundled audio registry. Every track was transcoded to mono MP3 (~48 kbps).
 * Licenses and provenance: see LICENSES.md.
 */

const ADHAN_LICENSE = 'Public-domain / CC0 recording (see LICENSES.md for provenance)';

export const ADHAN_TRACKS: AdhanTrack[] = [
  {
    id: 'doha_fajr',
    name: 'Doha – Fajr Adhan',
    muezzin: 'Doha, Qatar (2013–2014)',
    isFajr: true,
    durationSec: 217,
    soundFile: 'doha_fajr.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/doha_fajr.mp3'),
  },
  {
    id: 'doha_dhuhr',
    name: 'Doha – Dhuhr Adhan',
    muezzin: 'Doha, Qatar (2013–2014)',
    isFajr: false,
    durationSec: 179,
    soundFile: 'doha_dhuhr.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/doha_dhuhr.mp3'),
  },
  {
    id: 'doha_asr',
    name: 'Doha – Asr Adhan',
    muezzin: 'Doha, Qatar (2013–2014)',
    isFajr: false,
    durationSec: 187,
    soundFile: 'doha_asr.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/doha_asr.mp3'),
  },
  {
    id: 'doha_maghrib',
    name: 'Doha – Maghrib Adhan',
    muezzin: 'Doha, Qatar (2013–2014)',
    isFajr: false,
    durationSec: 199,
    soundFile: 'doha_maghrib.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/doha_maghrib.mp3'),
  },
  {
    id: 'doha_isha',
    name: 'Doha – Isha Adhan',
    muezzin: 'Doha, Qatar (2013–2014)',
    isFajr: false,
    durationSec: 181,
    soundFile: 'doha_isha.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/doha_isha.mp3'),
  },
  {
    id: 'makkah',
    name: 'Makkah – Masjid al-Haram',
    muezzin: 'Makkah',
    isFajr: false,
    durationSec: 205,
    soundFile: 'makkah.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/makkah.mp3'),
  },
  {
    id: 'makkah_fajr',
    name: 'Makkah – Fajr Adhan',
    muezzin: 'Makkah',
    isFajr: true,
    durationSec: 215,
    soundFile: 'makkah_fajr.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/makkah_fajr.mp3'),
  },
  {
    id: 'alaqsa',
    name: 'Al-Aqsa – Naaji Qazzaaz',
    muezzin: 'Masjid al-Aqsa',
    isFajr: false,
    durationSec: 227,
    soundFile: 'alaqsa.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/alaqsa.mp3'),
  },
  {
    id: 'cairo_abdul_baset',
    name: 'Cairo – Abdul Baset',
    muezzin: 'Cairo',
    isFajr: false,
    durationSec: 201,
    soundFile: 'cairo_abdul_baset.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/cairo_abdul_baset.mp3'),
  },
  {
    id: 'fouad_fajr',
    name: 'Fajr Adhan – Fouad Adan',
    muezzin: 'Fouad Adan',
    isFajr: true,
    durationSec: 137,
    soundFile: 'fouad_fajr.mp3',
    license: ADHAN_LICENSE,
    src: require('../../assets/audio/adhan/fouad_fajr.mp3'),
  },
];

const MU_LICENSE =
  'CC0 1.0 (Public Domain Dedication) — H. Muammar Zainal Asyikin, via archive.org';
const GH_LICENSE =
  'Marked public domain by uploader — Saad Al-Ghamdi recitation, via archive.org';

const ATOVI_LICENSE =
  'CC0 1.0 (Public Domain Dedication) — Atcovi, "Recitation of the Holy Qur\'an", via Wikimedia Commons';

export const QURAN_BUNDLED: ReciterInfo[] = [
  {
    id: 'muammar',
    name: 'H. Muammar ZA',
    source: 'archive.org (muammar_murottal)',
    license: MU_LICENSE,
    files: {
      1: require('../../assets/audio/quran/muammar/001.mp3'),
      36: require('../../assets/audio/quran/muammar/036.mp3'),
      67: require('../../assets/audio/quran/muammar/067.mp3'),
      93: require('../../assets/audio/quran/muammar/093.mp3'),
      94: require('../../assets/audio/quran/muammar/094.mp3'),
      95: require('../../assets/audio/quran/muammar/095.mp3'),
      96: require('../../assets/audio/quran/muammar/096.mp3'),
      97: require('../../assets/audio/quran/muammar/097.mp3'),
      98: require('../../assets/audio/quran/muammar/098.mp3'),
      99: require('../../assets/audio/quran/muammar/099.mp3'),
      100: require('../../assets/audio/quran/muammar/100.mp3'),
      101: require('../../assets/audio/quran/muammar/101.mp3'),
      102: require('../../assets/audio/quran/muammar/102.mp3'),
      103: require('../../assets/audio/quran/muammar/103.mp3'),
      104: require('../../assets/audio/quran/muammar/104.mp3'),
      105: require('../../assets/audio/quran/muammar/105.mp3'),
      106: require('../../assets/audio/quran/muammar/106.mp3'),
      107: require('../../assets/audio/quran/muammar/107.mp3'),
      108: require('../../assets/audio/quran/muammar/108.mp3'),
      109: require('../../assets/audio/quran/muammar/109.mp3'),
      110: require('../../assets/audio/quran/muammar/110.mp3'),
      111: require('../../assets/audio/quran/muammar/111.mp3'),
      112: require('../../assets/audio/quran/muammar/112.mp3'),
      113: require('../../assets/audio/quran/muammar/113.mp3'),
      114: require('../../assets/audio/quran/muammar/114.mp3'),
    },
  },
  {
    id: 'ghamdi',
    name: 'Saad Al-Ghamdi',
    source: 'archive.org (Quran-MP3-Ghamdi)',
    license: GH_LICENSE,
    files: {
      1: require('../../assets/audio/quran/ghamdi/001.mp3'),
      36: require('../../assets/audio/quran/ghamdi/036.mp3'),
      67: require('../../assets/audio/quran/ghamdi/067.mp3'),
      99: require('../../assets/audio/quran/ghamdi/099.mp3'),
      103: require('../../assets/audio/quran/ghamdi/103.mp3'),
      108: require('../../assets/audio/quran/ghamdi/108.mp3'),
      110: require('../../assets/audio/quran/ghamdi/110.mp3'),
      112: require('../../assets/audio/quran/ghamdi/112.mp3'),
      113: require('../../assets/audio/quran/ghamdi/113.mp3'),
      114: require('../../assets/audio/quran/ghamdi/114.mp3'),
    },
  },
  {
    id: 'atcovi',
    name: 'Atcovi (CC0)',
    source: 'Wikimedia Commons (Recitation of the Holy Qur\'an)',
    license: ATOVI_LICENSE,
    files: {
      1: require('../../assets/audio/quran/atcovi/001.mp3'),
      93: require('../../assets/audio/quran/atcovi/093.mp3'),
      94: require('../../assets/audio/quran/atcovi/094.mp3'),
      95: require('../../assets/audio/quran/atcovi/095.mp3'),
      96: require('../../assets/audio/quran/atcovi/096.mp3'),
      97: require('../../assets/audio/quran/atcovi/097.mp3'),
      98: require('../../assets/audio/quran/atcovi/098.mp3'),
      99: require('../../assets/audio/quran/atcovi/099.mp3'),
      100: require('../../assets/audio/quran/atcovi/100.mp3'),
      101: require('../../assets/audio/quran/atcovi/101.mp3'),
      102: require('../../assets/audio/quran/atcovi/102.mp3'),
      103: require('../../assets/audio/quran/atcovi/103.mp3'),
      104: require('../../assets/audio/quran/atcovi/104.mp3'),
    },
  },
];
