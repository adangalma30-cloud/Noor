import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Card, Chip, Divider, Icon, Screen, SectionTitle, Sub, Title } from '../../components/ui';
import { ADHAN_TRACKS } from '../../data/audio-assets';
import { playAdhan, stopAudio } from '../../lib/audio';
import {
  addImportedAdhan,
  allAdhanTracks,
  allReciters,
  classifyFiles,
  removeImportedAdhan,
  removeImportedReciter,
  upsertImportedReciter,
  useLibrary,
} from '../../lib/library';
import { rescheduleAll } from '../../lib/schedule';
import { updateSettings, useSettings } from '../../lib/store';
import { PRAYER_KEYS, PRAYER_NAMES, type AdhanTrack, type ReciterInfo } from '../../types';
import { Radius, Spacing, useTheme } from '../../theme';

function fmt(sec: number): string {
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
}

/** Copy a picked file into app-private storage so it survives cache cleanup. */
async function copyToLibrary(uri: string, name: string): Promise<string> {
  try {
    const dir = new FileSystem.Directory(FileSystem.Paths.document, 'noor-imports');
    try {
      dir.create({ intermediates: true, idempotent: true });
    } catch {
      // already exists
    }
    const dest = new FileSystem.File(dir, name);
    await new FileSystem.File(uri).copy(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}

export default function AdhanScreen() {
  const t = useTheme();
  const settings = useSettings();
  useLibrary();
  const [playing, setPlaying] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const tracks = allAdhanTracks();

  const preview = (track: AdhanTrack) => {
    if (playing === track.id) {
      stopAudio();
      setPlaying(null);
      return;
    }
    stopAudio();
    playAdhan(track, settings.adhanVolume);
    setPlaying(track.id);
    setTimeout(() => setPlaying((p) => (p === track.id ? null : p)), (track.durationSec + 1) * 1000);
  };

  const importAdhan = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true, multiple: true });
      if (res.canceled) return;
      for (const asset of res.assets ?? []) {
        const dest = await copyToLibrary(asset.uri, asset.name);
        const id = `imported-${asset.name.replace(/\W/g, '-').toLowerCase()}`;
        addImportedAdhan({
          id,
          name: asset.name.replace(/\.[a-z0-9]+$/i, ''),
          muezzin: 'Imported recording',
          isFajr: /fajr|فجر/i.test(asset.name),
          durationSec: 0,
          soundFile: null,
          license: 'Imported by user',
          src: 0,
          imported: true,
          uri: dest,
        });
      }
      Alert.alert('Adhans imported', 'They are now available in the library and can be assigned to any prayer.');
    } catch (e) {
      Alert.alert('Import failed', String(e));
    }
  };

  const importRecitations = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true, multiple: true });
      if (res.canceled || !res.assets?.length) return;
      const names = res.assets.map((a) => a.name);
      const { perSurah, perAyah } = classifyFiles(names);
      const byName = new Map<string, string>();
      for (const a of res.assets) byName.set(a.name, await copyToLibrary(a.uri, a.name));
      const files: Record<number, string> = {};
      const ayahFiles: Record<number, Record<number, string>> = {};
      for (const [s, name] of Object.entries(perSurah)) files[Number(s)] = byName.get(name) ?? '';
      for (const [s, ayahs] of Object.entries(perAyah)) {
        ayahFiles[Number(s)] = {};
        for (const [a, name] of Object.entries(ayahs)) ayahFiles[Number(s)][Number(a)] = byName.get(name) ?? '';
      }
      const reciter: ReciterInfo = {
        id: `imported-${Date.now()}`,
        name: `Imported (${names.length} file${names.length > 1 ? 's' : ''})`,
        source: 'Imported by user',
        license: 'Imported by user',
        files,
        ayahFiles: Object.keys(ayahFiles).length ? ayahFiles : undefined,
        imported: true,
      };
      upsertImportedReciter(reciter);
      Alert.alert('Recitations imported', `${Object.keys(files).length} surahs and ${Object.keys(ayahFiles).length} per-ayah sets detected.`);
    } catch (e) {
      Alert.alert('Import failed', String(e));
    }
  };

  return (
    <Screen>
      <Title>Adhan library</Title>
      <Sub style={{ marginTop: 6 }}>
        Every recording is bundled with the app — fully offline. Preview, then assign a different adhan to each prayer.
        Sounds play as Android notification sounds at prayer time, even when the phone is locked.
      </Sub>

      <SectionTitle>Default & per-prayer</SectionTitle>
      <Card>
        <Text style={{ color: t.sub, fontSize: 12.5, marginBottom: 8 }}>Tap a prayer to choose its adhan:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
          {PRAYER_KEYS.map((k) => (
            <Chip
              key={k}
              small
              label={`${PRAYER_NAMES[k].en}: ${tracks.find((x) => x.id === (settings.adhanPerPrayer[k] ?? settings.adhanDefault))?.name.split(' – ')[0] ?? 'Default'}`}
              selected={assigning === k}
              onPress={() => setAssigning(assigning === k ? null : k)}
            />
          ))}
        </View>
        {!!assigning && (
          <View style={{ marginTop: Spacing.md }}>
            <Divider />
            <Text style={{ color: t.gold, fontWeight: '700', marginTop: Spacing.md, marginBottom: 6 }}>
              Choose adhan for {PRAYER_NAMES[assigning as keyof typeof PRAYER_NAMES].en}:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
              {tracks.map((tr) => (
                <Chip
                  key={tr.id}
                  small
                  label={tr.name}
                  selected={(settings.adhanPerPrayer[assigning as keyof typeof settings.adhanPerPrayer] ?? settings.adhanDefault) === tr.id}
                  onPress={() => {
                    updateSettings({
                      adhanPerPrayer: { ...settings.adhanPerPrayer, [assigning]: tr.id },
                    });
                    setAssigning(null);
                    rescheduleAll().catch(() => {});
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </Card>

      <SectionTitle>Recordings</SectionTitle>
      {tracks.map((track) => (
        <Card key={track.id} style={{ marginBottom: Spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              onPress={() => preview(track)}
              style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name={playing === track.id ? 'pause' : 'play'} size={20} color={t.onPrimary} filled />
            </Pressable>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 15.5 }}>
                {track.name}
                {track.isFajr ? '  · Fajr' : ''}
              </Text>
              <Sub>
                {track.muezzin} · {track.durationSec ? fmt(track.durationSec) : 'imported'} ·{' '}
                {track.imported ? 'your recording' : 'bundled'}
              </Sub>
            </View>
            {track.imported && (
              <Pressable
                onPress={() => {
                  removeImportedAdhan(track.id);
                  updateSettings({
                    adhanPerPrayer: Object.fromEntries(
                      Object.entries(settings.adhanPerPrayer).map(([k, v]) => [k, v === track.id ? null : v])
                    ) as typeof settings.adhanPerPrayer,
                  });
                  rescheduleAll().catch(() => {});
                }}
                hitSlop={8}
                style={{ marginLeft: Spacing.sm }}
              >
                <Icon name="trash" size={18} color={t.danger} />
              </Pressable>
            )}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md }}>
            <Chip
              small
              label="Default"
              selected={settings.adhanDefault === track.id}
              onPress={() => {
                updateSettings({ adhanDefault: track.id });
                rescheduleAll().catch(() => {});
              }}
            />
            {PRAYER_KEYS.map((k) => (
              <Chip
                key={k}
                small
                label={PRAYER_NAMES[k].en}
                selected={(settings.adhanPerPrayer[k] ?? settings.adhanDefault) === track.id}
                onPress={() => {
                  updateSettings({ adhanPerPrayer: { ...settings.adhanPerPrayer, [k]: track.id } });
                  rescheduleAll().catch(() => {});
                }}
              />
            ))}
          </View>
          <Sub style={{ marginTop: Spacing.sm, fontSize: 11 }}>{track.license}</Sub>
        </Card>
      ))}

      <Pressable
        onPress={importAdhan}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.goldSoft,
          borderRadius: Radius.md,
          padding: Spacing.lg,
          marginTop: Spacing.sm,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="download" size={19} color={t.gold} />
        <Text style={{ color: t.gold, fontWeight: '800', marginLeft: 10 }}>Import your own adhan audio</Text>
      </Pressable>
      <Sub style={{ marginTop: Spacing.sm, fontSize: 11.5 }}>
        Note: imported recordings play in-app and when the app is open at prayer time. For lock-screen adhan sound,
        choose a bundled recording (Android loads those as system notification sounds at build time).
      </Sub>

      <SectionTitle>Quran recitations</SectionTitle>
      {allReciters().map((r) => (
        <Card key={r.id} style={{ marginBottom: Spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="book" size={20} color={t.gold} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>{r.name}</Text>
              <Sub>
                {Object.keys(r.files).length} surahs bundled
                {r.ayahFiles ? ` · per-ayah files for ${Object.keys(r.ayahFiles).length} surahs` : ''}
              </Sub>
              <Sub style={{ fontSize: 10.5 }}>{r.license}</Sub>
            </View>
            {r.imported && (
              <Pressable onPress={() => removeImportedReciter(r.id)} hitSlop={8}>
                <Icon name="trash" size={18} color={t.danger} />
              </Pressable>
            )}
          </View>
        </Card>
      ))}
      <Pressable
        onPress={importRecitations}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.goldSoft,
          borderRadius: Radius.md,
          padding: Spacing.lg,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="download" size={19} color={t.gold} />
        <Text style={{ color: t.gold, fontWeight: '800', marginLeft: 10 }}>Import recitation files</Text>
      </Pressable>
      <Sub style={{ marginTop: Spacing.sm, fontSize: 11.5 }}>
        Name files like 036.mp3 for a whole surah, or 036005.mp3 for surah 36 ayah 5 (per-ayah enables verse repeat).
        Everything is stored locally on your device.
      </Sub>
      <View style={{ height: 40 }} />
    </Screen>
  );
}
