import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import quranAr from '../../data/quran-ar.json';
import quranEn from '../../data/quran-en.json';
import surahs from '../../data/surahs.json';
import { Card, Chip, Icon, Screen, Sub } from '../../components/ui';
import { playSource, stopAudio } from '../../lib/audio';
import { allReciters, findReciter, useLibrary } from '../../lib/library';
import { toggleBookmark, updateProgress, useProgress, useSettings, getProgress } from '../../lib/store';
import { Radius, Spacing, arabicStyle, useTheme } from '../../theme';

const AR = quranAr as Record<string, Record<string, string>>;
const EN = quranEn as Record<string, Record<string, string>>;
const META = surahs as { id: number; ar: string; en: string; type: string; ayahs: number }[];

const SPEEDS = [0.75, 1, 1.25, 1.5];

export default function SurahScreen() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const surahId = Math.max(1, Math.min(114, Number(params.id) || 1));
  const meta = META[surahId - 1];
  const settings = useSettings();
  const progress = useProgress();
  useLibrary();

  const verses = useMemo(() => {
    const ar = AR[String(surahId)] ?? {};
    const en = EN[String(surahId)] ?? {};
    return Object.keys(ar)
      .map(Number)
      .sort((a, b) => a - b)
      .map((n) => ({ n, ar: ar[String(n)], en: en[String(n)] ?? '' }));
  }, [surahId]);

  const [reciterId, setReciterId] = useState(() => allReciters()[0]?.id ?? 'muammar');
  const [speed, setSpeed] = useState(1);
  const [repeat, setRepeat] = useState<'off' | 'surah' | 'verse'>('off');
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [showEn, setShowEn] = useState(settings.showTranslation);
  const reciter = findReciter(reciterId) ?? allReciters()[0];
  const hasSurahAudio = !!reciter?.files[surahId];
  const ayahFiles = reciter?.ayahFiles?.[surahId];
  const viewed = useRef<Set<string>>(new Set());

  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const sourceFor = useCallback(
    (ayah?: number) => {
      if (!reciter) return null;
      if (ayah != null && ayahFiles?.[ayah]) return { uri: ayahFiles[ayah] };
      const f = reciter.files[surahId];
      if (f == null) return null;
      return typeof f === 'number' ? f : { uri: f };
    },
    [reciter, ayahFiles, surahId]
  );

  const playFrom = useCallback(
    (ayah?: number) => {
      const src = sourceFor(ayah);
      if (src == null) return;
      try {
        player.replace(src as never);
        player.playbackRate = speed;
        player.volume = settings.adhanVolume;
        player.play();
        setPlayingAyah(ayah ?? null);
      } catch {
        // ignore player errors — UI stays usable
      }
    },
    [player, sourceFor, speed, settings.adhanVolume]
  );

  const togglePlay = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else {
      if (playingAyah != null && ayahFiles) playFrom(playingAyah);
      else if (status.currentTime > 0) player.play();
      else playFrom(ayahFiles ? 1 : undefined);
    }
  }, [player, status.playing, status.currentTime, playFrom, playingAyah, ayahFiles]);

  // Auto-advance / repeat handling on finish
  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (s: { didJustFinish?: boolean }) => {
      if (!s?.didJustFinish) return;
      if (repeat === 'verse' && playingAyah != null && ayahFiles) {
        playFrom(playingAyah);
      } else if (repeat === 'surah') {
        playFrom(ayahFiles ? 1 : undefined);
      } else if (playingAyah != null && ayahFiles && playingAyah < verses.length) {
        playFrom(playingAyah + 1);
        setPlayingAyah(playingAyah + 1);
      } else {
        setPlayingAyah(null);
      }
    });
    return () => sub.remove();
  }, [player, repeat, playingAyah, ayahFiles, playFrom, verses.length]);

  // Save last-read + reading progress as verses come into view
  const onViewable = useRef(({ viewableItems }: { viewableItems: { item: { n: number } }[] }) => {
    const first = viewableItems[0]?.item;
    if (!first) return;
    const key = `${surahId}:${first.n}`;
    if (!viewed.current.has(key)) {
      viewed.current.add(key);
      const p = getProgress();
      const day = new Date().toISOString().slice(0, 10);
      updateProgress({
        lastRead: { surah: surahId, ayah: first.n },
        readingLog: { ...p.readingLog, [day]: (p.readingLog[day] ?? 0) + 1 },
      });
    } else {
      updateProgress({ lastRead: { surah: surahId, ayah: first.n } });
    }
  });

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const bookmarkKeys = progress.bookmarks;

  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
        <Card style={{ padding: Spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontWeight: '800', fontSize: 17 }}>
                {meta.id}. {meta.en}
              </Text>
              <Sub>
                {meta.type} · {meta.ayahs} ayahs
              </Sub>
            </View>
            <Text style={{ ...arabicStyle(28, t.gold, true) }}>{meta.ar}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.sm }}>
            <Pressable
              onPress={() => surahId > 1 && router.push(`/surah/${surahId - 1}`)}
              style={{ padding: 10, borderRadius: Radius.pill, backgroundColor: t.overlay }}
            >
              <Icon name="prev" size={18} color={t.text} />
            </Pressable>
            <Pressable
              onPress={togglePlay}
              disabled={!hasSurahAudio && !ayahFiles}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: hasSurahAudio || ayahFiles ? t.primary : t.track,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={status.playing ? 'pause' : 'play'} size={22} color={t.onPrimary} filled />
            </Pressable>
            <Pressable
              onPress={() => surahId < 114 && router.push(`/surah/${surahId + 1}`)}
              style={{ padding: 10, borderRadius: Radius.pill, backgroundColor: t.overlay }}
            >
              <Icon name="next" size={18} color={t.text} />
            </Pressable>

            <Pressable
              onPress={() => setRepeat(repeat === 'off' ? 'surah' : repeat === 'surah' ? 'verse' : 'off')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: Radius.pill,
                backgroundColor: repeat !== 'off' ? t.goldSoft : t.overlay,
                marginLeft: 'auto',
              }}
            >
              <Icon name="repeat" size={16} color={repeat !== 'off' ? t.gold : t.sub} />
              <Text style={{ marginLeft: 6, color: repeat !== 'off' ? t.gold : t.sub, fontWeight: '700', fontSize: 12 }}>
                {repeat === 'off' ? 'Repeat off' : repeat === 'surah' ? 'Repeat surah' : 'Repeat verse'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
              style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: Radius.pill, backgroundColor: t.overlay }}
            >
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 12 }}>{speed}×</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, flexWrap: 'wrap' }}>
            {allReciters().map((r) => (
              <Chip
                key={r.id}
                small
                label={`${r.name}${r.files[surahId] ? '' : ' · no audio'}`}
                selected={r.id === reciterId}
                onPress={() => {
                  stopAudio();
                  setPlayingAyah(null);
                  setReciterId(r.id);
                }}
              />
            ))}
            <Chip small label={showEn ? 'Hide translation' : 'Show translation'} selected={showEn} onPress={() => setShowEn(!showEn)} />
          </View>

          {repeat === 'verse' && !ayahFiles && (
            <Sub style={{ marginTop: Spacing.sm, color: t.gold }}>
              Verse repeat needs a per-ayah recitation. Import one in Adhan → Quran recitations (files named like 001001.mp3).
            </Sub>
          )}
          {!hasSurahAudio && !ayahFiles && (
            <Sub style={{ marginTop: Spacing.sm }}>
              No audio for this surah in the selected recitation. Import audio in Adhan → Quran recitations.
            </Sub>
          )}
          {status.playing && (
            <Sub style={{ marginTop: Spacing.sm }}>
              Playing · {(status.currentTime ?? 0).toFixed(0)}s / {(status.duration ?? 0).toFixed(0)}s
            </Sub>
          )}
        </Card>
      </View>

      <FlatList
        data={verses}
        keyExtractor={(v) => String(v.n)}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 140 }}
        onViewableItemsChanged={onViewable.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => {
          const bKey = `${surahId}:${item.n}`;
          const marked = !!bookmarkKeys[bKey];
          return (
            <View
              style={{
                backgroundColor: t.card,
                borderRadius: Radius.md,
                borderWidth: 1,
                borderColor: marked ? t.gold : t.border,
                padding: Spacing.lg,
                marginTop: Spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: t.gold, fontWeight: '800', fontSize: 11 }}>{item.n}</Text>
                  </View>
                  {!!ayahFiles && (
                    <Pressable onPress={() => { setPlayingAyah(item.n); playFrom(item.n); }} hitSlop={8}>
                      <Icon name={playingAyah === item.n && status.playing ? 'pause' : 'play'} size={16} color={t.primary} filled={playingAyah === item.n && status.playing} />
                    </Pressable>
                  )}
                </View>
                <Pressable onPress={() => toggleBookmark(bKey)} hitSlop={8}>
                  <Icon name="heart" size={18} color={marked ? t.gold : t.sub} filled={marked} />
                </Pressable>
              </View>
              <Text style={{ ...arabicStyle(settings.fontSize + 8, t.text), lineHeight: (settings.fontSize + 8) * 1.95, marginTop: Spacing.sm }}>
                {item.ar}
              </Text>
              {showEn && !!item.en && (
                <Text style={{ color: t.sub, fontSize: 14, lineHeight: 22, marginTop: Spacing.md }}>{item.en}</Text>
              )}
            </View>
          );
        }}
      />
    </Screen>
  );
}
