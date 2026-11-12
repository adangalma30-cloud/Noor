import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, Share, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import surahs from '../../data/surahs.json';
import { Card, Chip, Icon, Screen, Sub } from '../../components/ui';
import { stopAudio } from '../../lib/audio';
import { allReciters, findReciter, useLibrary } from '../../lib/library';
import { loadQuranSources, loadSurahVerses, type QuranSources, type VerseRow } from '../../lib/quranDb';
import { toggleBookmark, updateProgress, updateSettings, useProgress, useSettings, getProgress } from '../../lib/store';
import { layersOf, modeFromLayers, type TranslationLang } from '../../types';
import { Radius, Spacing, arabicStyle, useTheme } from '../../theme';

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

  const layers = layersOf(settings.quranDisplay);

  // Three-layer verses from the offline SQLite database (JSON fallback inside).
  const [verses, setVerses] = useState<VerseRow[] | null>(null);
  const [sources, setSources] = useState<QuranSources | null>(null);
  useEffect(() => {
    let alive = true;
    setVerses(null);
    loadSurahVerses(surahId).then((v) => {
      if (alive) setVerses(v);
    });
    loadQuranSources().then((s) => {
      if (alive) setSources(s);
    });
    return () => {
      alive = false;
    };
  }, [surahId]);

  const [reciterId, setReciterId] = useState(() => allReciters()[0]?.id ?? 'muammar');
  const [speed, setSpeed] = useState(1);
  const [repeat, setRepeat] = useState<'off' | 'surah' | 'verse'>('off');
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
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
        // The highlight is only truthful when a real per-ayah file is playing.
        setPlayingAyah(ayahFiles && ayah != null ? ayah : null);
      } catch {
        // ignore player errors — UI stays usable
      }
    },
    [player, sourceFor, speed, settings.adhanVolume, ayahFiles]
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

  // Auto-advance / repeat handling on finish (verse sync comes from per-ayah files).
  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (s: { didJustFinish?: boolean }) => {
      if (!s?.didJustFinish) return;
      const len = verses?.length ?? meta.ayahs;
      if (repeat === 'verse' && playingAyah != null && ayahFiles) {
        playFrom(playingAyah);
      } else if (repeat === 'surah') {
        playFrom(ayahFiles ? 1 : undefined);
      } else if (playingAyah != null && ayahFiles && playingAyah < len) {
        playFrom(playingAyah + 1);
      } else {
        setPlayingAyah(null);
      }
    });
    return () => sub.remove();
  }, [player, repeat, playingAyah, ayahFiles, playFrom, verses, meta.ayahs]);

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

  const toggleLayer = useCallback(
    (key: 'arabic' | 'translit' | 'translation') => {
      const next = { ...layers, [key]: !layers[key] };
      if (!next.arabic && !next.translit && !next.translation) return; // always show something
      updateSettings({ quranDisplay: modeFromLayers(next.arabic, next.translit, next.translation) });
    },
    [layers]
  );

  const shareVerse = useCallback(
    (item: VerseRow) => {
      const lang = settings.translationLang;
      const translation = lang === 'sw' ? item.sw : item.en;
      const trLabel = lang === 'sw' ? 'Swahili' : 'English';
      const message = [
        item.ar,
        item.translit ? `\n${item.translit}` : '',
        `\n${translation}`,
        `\n— Quran ${meta.en} (${meta.id}), Ayah ${item.n} · NOOR`,
        trLabel === 'Swahili' ? 'Swahili translation: Ali Muhsin Al-Barwani' : 'Translation by Talal Itani, ClearQuran.com.',
      ]
        .filter(Boolean)
        .join('\n');
      Share.share({ message }).catch(() => {});
    },
    [settings.translationLang, meta.en, meta.id]
  );

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
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' }}>
            <Chip small label="Arabic" selected={layers.arabic} onPress={() => toggleLayer('arabic')} />
            <Chip small label="Transliteration" selected={layers.translit} onPress={() => toggleLayer('translit')} />
            <Chip small label="Translation" selected={layers.translation} onPress={() => toggleLayer('translation')} />
            {layers.translation && (
              <Chip
                small
                label={settings.translationLang === 'sw' ? 'Swahili' : 'English'}
                selected
                onPress={() =>
                  updateSettings({ translationLang: (settings.translationLang === 'en' ? 'sw' : 'en') as TranslationLang })
                }
              />
            )}
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
        data={verses ?? []}
        keyExtractor={(v) => String(v.n)}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 140 }}
        onViewableItemsChanged={onViewable.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        ListEmptyComponent={
          verses === null ? (
            <Sub style={{ marginTop: Spacing.xl, textAlign: 'center' }}>Loading surah…</Sub>
          ) : undefined
        }
        ListFooterComponent={
          sources ? (
            <Card style={{ padding: Spacing.lg, marginTop: Spacing.lg }}>
              <Text style={{ color: t.text, fontWeight: '800', fontSize: 13, marginBottom: Spacing.sm }}>Sources</Text>
              <Sub>Arabic: {sources.arabic}</Sub>
              <Sub style={{ marginTop: 3 }}>Transliteration: {sources.translit}</Sub>
              <Sub style={{ marginTop: 3 }}>English: {sources.en}</Sub>
              <Sub style={{ marginTop: 3 }}>Swahili: {sources.sw}</Sub>
            </Card>
          ) : undefined
        }
        renderItem={({ item }) => {
          const bKey = `${surahId}:${item.n}`;
          const marked = !!bookmarkKeys[bKey];
          const playing = playingAyah === item.n && status.playing;
          const translation = settings.translationLang === 'sw' ? item.sw : item.en;
          return (
            <View
              style={{
                backgroundColor: t.card,
                borderRadius: Radius.md,
                borderWidth: 1,
                borderColor: playing ? t.accent : marked ? t.gold : t.border,
                padding: Spacing.lg,
                marginTop: Spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: t.gold, fontWeight: '800', fontSize: 11 }}>{item.n}</Text>
                  </View>
                  <Pressable onPress={() => playFrom(item.n)} hitSlop={8} disabled={!hasSurahAudio && !ayahFiles}>
                    <Icon
                      name={playing ? 'pause' : 'play'}
                      size={16}
                      color={hasSurahAudio || ayahFiles ? t.primary : t.track}
                      filled={playing}
                    />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Pressable onPress={() => shareVerse(item)} hitSlop={8}>
                    <Icon name="share" size={17} color={t.sub} />
                  </Pressable>
                  <Pressable onPress={() => toggleBookmark(bKey)} hitSlop={8}>
                    <Icon name="heart" size={18} color={marked ? t.gold : t.sub} filled={marked} />
                  </Pressable>
                </View>
              </View>
              {layers.arabic && !!item.ar && (
                <Text
                  style={{
                    ...arabicStyle(settings.fontSize + 8, t.text),
                    lineHeight: (settings.fontSize + 8) * 1.95,
                    marginTop: Spacing.sm,
                    textAlign: 'right',
                    writingDirection: 'rtl',
                  }}
                >
                  {item.ar}
                </Text>
              )}
              {layers.translit && !!item.translit && (
                <Text
                  style={{
                    color: t.sub,
                    fontSize: 14.5,
                    lineHeight: 24,
                    fontStyle: 'italic',
                    letterSpacing: 0.2,
                    marginTop: Spacing.md,
                  }}
                >
                  {item.translit}
                </Text>
              )}
              {layers.translation && !!translation && (
                <Text style={{ color: t.text, fontSize: 14.5, lineHeight: 23, marginTop: Spacing.md }}>{translation}</Text>
              )}
            </View>
          );
        }}
      />
    </Screen>
  );
}
