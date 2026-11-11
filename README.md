# NOOR — Your Daily Prayer Companion

A complete, **offline-first** Islamic prayer app for Android (iOS-ready), built with React Native + Expo.
No accounts, no subscriptions, no internet required — everything works in airplane mode.

## Features

**Prayer times & notifications**
- The five daily prayers calculated on-device (`adhan` library) — never from an API
- 12 calculation methods (Muslim World League, Egyptian, Umm al-Qura, ISNA, Karachi, Diyanet…)
- Shafi'i (standard) and Hanafi Asr
- Manual city selection from a bundled database of 34,000+ cities, or GPS
- Live countdown to the next prayer, sunrise display, 12/24-hour clock
- Notifications at prayer time **and** a configurable reminder before (5–30 min)
- The adhan plays as the notification sound at prayer time — **with the app closed and the phone locked**
- Per-prayer adhan assignment and per-prayer on/off toggles
- Exact alarms (AlarmManager) with a boot receiver — alarms survive device restarts

**Adhan library**
- 10 bundled, properly licensed recordings: a complete five-per-prayer set from Doha
  (the Fajr recording includes the additional Fajr phrase), Makkah Haram, Makkah Fajr,
  Al-Aqsa, Cairo (Abdul Baset) and a Fajr adhan by Fouad Adan — different muezzin voices
- Preview every recording; set a different adhan for each prayer; favourite default
- Import your own adhan audio — stored locally, never uploaded

**Quran library**
- Complete Arabic text of all 114 surahs (Uthmani script) — fully offline
- The Clear Quran English translation (Talal Itani) — toggleable
- Three bundled reciters (H. Muammar ZA, Saad Al-Ghamdi, Atcovi-CC0 samples) with
  different voices; unlimited imported reciters
- Full-surah playback with play/pause, next/previous surah, repeat surah, adjustable speed
- Verse repeat and "play from verse" with per-ayah recitation sets (import naming below)
- Background playback with the screen off; bookmarks; last-read position; daily reading goal

**Islamic tools**
- Digital Tasbeeh counter (presets, targets, saved totals, haptics)
- Qibla compass (device magnetometer + computed bearing)
- Hijri calendar with Islamic events (Umm al-Qura style conversion, ±2 day adjustment)
- Morning & evening Adhkar and post-prayer Adhkar with counters
- Daily Duas and 99 Names of Allah
- Prayer tracker with streaks and a monthly view

**Design**
- Premium dark-green / emerald / gold / white interface, light & dark themes
- Mosque-themed gradient home screen with countdown ring, dates (Gregorian + Hijri), city,
  current prayer and quick access to Quran, Adhan, Tasbeeh and Qibla

## Requirements

- **Node.js 22.13+, 24.3+ or 26+** (Expo SDK 58 requirement)
- npm 10+
- For APK builds: an [Expo](https://expo.dev) account (free) with EAS, or Android Studio for local builds

## Run in development

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on Android. (Custom notification sounds and imported-audio
features require a development/production build — see below.)

## Build the installable APK

### Option A — EAS Build (recommended, no Android Studio needed)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview     # produces an installable .apk
```

The `preview` profile builds a shareable APK (not an app bundle). Download the APK from the
EAS dashboard and install it on any Android device.

### Option B — local build

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
# APK lands in android/app/build/outputs/apk/release/
```

You need the Android SDK + JDK 17 for Option B.

### Updating the app

Bump `version` (and `android.versionCode`) in `app.json`, commit, push, then run
`eas build -p android --profile preview` again and distribute the new APK.

## Offline guarantees

- Prayer times: computed on-device from your saved coordinates — no API calls, ever
- Quran text and translation: bundled inside the app package
- Adhan audio and city database: bundled; user-imported audio is stored in app-private storage
- Settings, bookmarks, tasbeeh counts and prayer history: local storage only
- There is no login, no analytics, no network permission used for any essential feature

## Loading the full recitation library

The bundled recitations are a curated sample (both reciters' complete sets are gigabytes).
To load every surah:

```bash
python3 scripts/fetch-recitations.py --reciter muammar --out ./quran-audio   # CC0, 114 surahs
```

Then in the app: **Adhan → Import recitation files**, and select the downloaded files
(`036.mp3` = surah 36 whole; `036005.mp3` = surah 36 ayah 5, enables verse repeat).
Files are copied into app storage — nothing is uploaded.

## Android background behaviour & battery

- Notifications use Android exact alarms and expo-notifications' boot receiver re-registers
  them after restarts; Noor also reschedules on every app launch
- On aggressive devices (Xiaomi, Huawei, Samsung, Oppo…): set Noor's battery usage to
  **Unrestricted** and allow **Alarms & reminders** (Settings → Apps → Noor → Battery).
  The in-app guide is under Settings → About
- Adhan sound respects Do Not Disturb and the system notification volume, by design

## Note on adhan & recitation audio

All bundled recordings are public-domain / CC0 (see `LICENSES.md` for provenance of each
track). Noor does **not** bundle copyrighted recitations or AI-generated Quran audio. If you
import recordings you must have the rights to use them.

## Project structure

```
app.json                  Expo config (permissions, notification sounds, icons)
src/app/                  Screens (expo-router): tabs + tools + surah reader
src/lib/                  prayer.ts (adhan), schedule.ts (alarms), hijri.ts, qibla.ts,
                          store.ts (local persistence), library.ts (audio registry), audio.ts
src/data/                 Quran text (114 surahs), English translation, cities, adhkar,
                          duas, 99 names, bundled audio registry
assets/audio/             Bundled adhan + recitation recordings
assets/images/            Icons and splash (generated artwork)
scripts/fetch-recitations.py  Downloads the full CC0 recitation sets for import
```

## Verification checklist (what we tested)

- [x] TypeScript compiles clean (`npx tsc --noEmit`)
- [x] Android bundle builds (`npx expo export --platform android`)
- [x] Prayer times validated against published Nairobi references (MWL 18°/17°, Shafi'i Asr)
- [x] Hijri conversion validated against Umm al-Qura (11 Nov 2026 = 1 Jumada al-Akhirah 1448)
- [x] Quran text integrity: exactly 6,236 ayahs across 114 surahs
- [ ] On-device: adhan with the app closed / phone locked (uses Android notification sound)
- [ ] On-device: alarms after device restart (boot receiver + reschedule-on-launch)
- [ ] On-device: full airplane-mode pass (all core features)

The two unchecked items need a physical Android device — walk through them after installing
the APK.

## License

App code: MIT. Bundled content: see `LICENSES.md`.
