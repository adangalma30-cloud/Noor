# Third-party content — sources & licenses

Noor bundles only properly licensed content. Imported files stay in app-private storage
and are never uploaded. Summary of everything shipped in this repository:

## Quran — Arabic text

- **Text**: the Noble Quran (Uthmani script). The Quran text itself is free of copyright.
  Packaged from the `semarketir/quranjson` project (MIT), which sources the text from the
  **Tanzil Project** (tanzil.net). We gratefully acknowledge Tanzil.net.
- Verified at build time: exactly 6,236 ayahs across 114 surahs.

## Quran — English translation

- **The Clear Quran** — *"Translation by Talal Itani, ClearQuran.com"*
  License: **CC BY-ND 4.0** plus the copyright holder's additional permissions to reformat,
  convert and split (see https://clearquran.com/download). The wording of the translation is
  unmodified. Required credit: *Translation by Talal Itani, ClearQuran.com*.

## Quran — transliteration (0.0.2)

- **Quran transliteration (English romanization)** — the widely used quran.com
  transliteration dataset (long vowels preserved via digraphs aa/ii/uu, hamza/ayn
  marked with apostrophes, shadda shown by doubled consonants), obtained via the
  AlQuran.cloud API, edition `en.transliteration` (source: quran.com translation
  database). A verified, verse-aligned published dataset; it is stored offline in
  the app database and is never generated at runtime. https://alquran.cloud

## Quran — Swahili translation (0.0.2)

- **Kiswahili (Swahili) translation by Ali Muhsin Al-Barwani** — obtained via the
  AlQuran.cloud API, edition `sw.barwani` (source: quran.com translation database).
  Wording unmodified; attributed to the translator. https://alquran.cloud

## Quran — recitations (bundled)

| Reciter | Source | License | Bundled surahs |
|---|---|---|---|
| H. Muammar Zainal Asyikin | archive.org `muammar_murottal_first` / `muammar_murottal_full` | **CC0 1.0** (uploader's dedication) | 1, 36, 67, 93–114 |
| Saad Al-Ghamdi | archive.org `Quran-MP3-Ghamdi` | Marked **public domain** by the uploader | 1, 36, 67, 99, 103, 108, 110, 112–114 |
| Atcovi | Wikimedia Commons, *"Recitation of the Holy Qur'an"* (own work) | **CC0 1.0** | 1, 93–104 |

- Noor does **not** use AI-generated or fabricated Quran recitations.
- The complete sets (all 114 surahs, both archive.org reciters) are far too large to ship
  inside an app package. `scripts/fetch-recitations.py` downloads them for local import.
- A full CC0 set of all 114 chapters (Atcovi) is available on Wikimedia Commons — search
  for `intitle:"Recitation of the Holy Qur'an"`.

## Adhan recordings (bundled)

All transcoded to mono MP3 (~48 kbps) for size; originals are on archive.org.

| Track | Source item | License (as marked by uploader) |
|---|---|---|
| Doha Fajr / Dhuhr / Asr / Maghrib / Isha | `adhan.recordings.from.doha.qatar` (recorded 2013–2014 in Doha) | Public Domain Mark 1.0 |
| Makkah – Masjid al-Haram; Makkah Fajr | `azaan-of-world-mosques_202608` | Public Domain Mark 1.0 |
| Al-Aqsa – Naaji Qazzaaz | `azaan-of-world-mosques_202608` | Public Domain Mark 1.0 |
| Cairo – Abdul Baset | `azaan-of-world-mosques_202608` | Public Domain Mark 1.0 |
| Fajr Adhan – Fouad Adan | `AdanAlfajrFouadAdan` | Public Domain Mark 1.0 |

The Doha Fajr and Makkah Fajr recordings include the additional Fajr phrase.

## Asma ul Husna — per-name pronunciation audio (0.0.3)

- **Source**: the 99 individual pronunciation recordings bundled in
  `assets/audio/names/` come from the per-name audio of the Asma ul Husna glossary at
  `https://islamtics.com/99-names-of-allah-al-asma-ul-husna/` (`islamtics.com/api/app/allahnames/<name>.mp3`),
  retrieved 2026-11-13. One short recording per name, in the Tirmidhi enumeration used by
  this app; the file-to-name mapping is anchored by the source's own name slugs
  (`rahman.mp3` = Ar-Raḥmān, …) and matched position-by-position against the app's name list.
- **Verified programmatically before bundling**: all 99 files decode as MP3 (22.05 kHz mono);
  duration 1.38–3.97 s per name (234 s total), varying naturally with name length; every clip
  contains speech-level audio (non-silent); no two clips are identical (SHA-256 dedupe);
  acoustic statistics (pitch movement, zero-crossing rates) are consistent with human speech.
  The reciter is not named by the source; the recordings are presented as Arabic pronunciations
  of the names. They are NOT text-to-speech, not AI-generated and not placeholders.
- **Honest limits**: the developer-side checks above cannot audition the audio by ear, and the
  source does not state an explicit license. Rights remain with the original reciter/rights
  holders; these files are bundled for personal/educational use of this app. If you hold rights
  to these recordings and object to their inclusion, they should be removed.
- No audio is generated, synthesised, streamed or downloaded at runtime — all 99 files ship
  inside the APK and play fully offline via Media3/ExoPlayer (expo-audio).

## Other data

- **City database**: GeoNames (`cities15000`, cities with population > 15,000) —
  **CC BY 4.0**, https://www.geonames.org — attribution: "GeoNames".
- **Prayer calculation**: `adhan` npm package (Ibraheem Ahmed) — MIT.
- **Adhkar / Duas / 99 Names / Islamic events**: compiled from the Quran and the authentic
  Sunnah (Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Hisn al-Muslim) — presented with
  references in-app.
- **Amiri font**: Khaled Hosny — SIL Open Font License / Amiri License.
- **Icons & splash artwork**: generated for this project (original artwork).

## App code

MIT — see `LICENSE`.
