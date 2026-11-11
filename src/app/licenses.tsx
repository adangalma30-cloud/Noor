import React from 'react';
import { Text, View } from 'react-native';
import { Card, Screen, SectionTitle, Sub, Title } from '../components/ui';
import { Spacing, useTheme } from '../theme';

function Block({ title, body }: { title: string; body: string }) {
  const t = useTheme();
  return (
    <Card style={{ marginBottom: Spacing.md }}>
      <Text style={{ color: t.text, fontWeight: '800', fontSize: 15 }}>{title}</Text>
      <Sub style={{ marginTop: 6 }}>{body}</Sub>
    </Card>
  );
}

export default function LicensesScreen() {
  return (
    <Screen>
      <Title>Sources & licenses</Title>
      <Sub style={{ marginTop: 6 }}>
        Noor is fully offline and only bundles content we could license properly. Imported files remain yours and
        never leave your device.
      </Sub>

      <SectionTitle>Quran text</SectionTitle>
      <Block
        title="Arabic text (Uthmani script)"
        body="The Noble Quran text is free of copyright. Text packaging via the semarketir/quranjson project (MIT), sourced from Tanzil.net. We are grateful to the Tanzil Project for making the Quran text freely available."
      />
      <Block
        title="English translation — The Clear Quran"
        body={'"Translation by Talal Itani, ClearQuran.com" — released under CC BY-ND 4.0 with additional permissions to reformat. The wording is unchanged. https://clearquran.com'}
      />

      <SectionTitle>Quran recitations (bundled)</SectionTitle>
      <Block
        title="H. Muammar Zainal Asyikin (Reciter 1)"
        body="CC0 1.0 (Public Domain Dedication), uploaded to archive.org (muammar_murottal_first / muammar_murottal_full). Bundled: Al-Fatiha, Ya-Sin, Al-Mulk and surahs 93–114."
      />
      <Block
        title="Saad Al-Ghamdi (Reciter 2 — sample)"
        body="Marked public domain by the uploader on archive.org (Quran-MP3-Ghamdi). Bundled: 1, 36, 67, 99, 103, 108, 110, 112–114."
      />
      <Block
        title="Atcovi (Reciter 3 — CC0)"
        body={'CC0 1.0 (Public Domain Dedication), "Recitation of the Holy Qur\'an" by Commons user Atcovi (own work, all 114 chapters available). Bundled: Al-Fatiha and surahs 93–104.'}
      />
      <Block
        title="Full recitation library"
        body="The complete set of all 114 surahs in both recitations is too large to bundle inside the app. Run scripts/fetch-recitations.py on your computer (it downloads from archive.org) and import the files into Noor — see README."
      />

      <SectionTitle>Adhan recordings (bundled)</SectionTitle>
      <Block
        title="Adhan Recordings from Doha, Qatar (2013–2014)"
        body="Public-domain mark (CC PD) on archive.org. The five per-prayer adhans (Fajr with the additional Fajr phrase, Dhuhr, Asr, Maghrib, Isha) from this collection are the app's default per-prayer set."
      />
      <Block
        title="Azaan of World Mosques (Makkah, Al-Aqsa, Cairo, and others)"
        body="Public-domain mark (CC PD) on archive.org. Bundled tracks: Masjid al-Haram Makkah, Makkah Fajr, Al-Aqsa (Naaji Qazzaaz), Cairo (Abdul Baset)."
      />
      <Block
        title="Fajr Adhan — Fouad Adan"
        body="Public-domain mark (CC PD) on archive.org (AdanAlfajrFouadAdan)."
      />

      <SectionTitle>Other content</SectionTitle>
      <Block
        title="Adhkar, Duas, 99 Names, Hijri calendar"
        body="Compiled from the Quran and the authentic Sunnah (Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Hisn al-Muslim). Presented by Noor with references."
      />
      <Block
        title="City database"
        body="GeoNames cities with population over 15,000 (CC BY 4.0 — https://www.geonames.org). Used for offline city search."
      />
      <Block
        title="Prayer time calculation"
        body="adhan (npm package by Ibraheem Ahmed), MIT license. Calculation performed entirely on your device."
      />
      <Block
        title="Font — Amiri"
        body="Amiri Quranic font by Khaled Hosny (OFL / Amiri License). Loaded locally with the app."
      />

      <Sub style={{ marginTop: Spacing.lg }}>
        If you import your own recordings, you are responsible for having the rights to use them. Noor stores them
        locally only.
      </Sub>
      <View style={{ height: 40 }} />
    </Screen>
  );
}
