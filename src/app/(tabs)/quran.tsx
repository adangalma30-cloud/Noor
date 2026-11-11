import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Chip, Icon, Screen } from '../../components/ui';
import surahs from '../../data/surahs.json';
import { allReciters, useLibrary } from '../../lib/library';
import { useProgress, useSettings } from '../../lib/store';
import { Radius, Spacing, arabicStyle, useTheme } from '../../theme';

interface SurahMeta {
  id: number;
  ar: string;
  en: string;
  type: string;
  ayahs: number;
}

const ALL = surahs as SurahMeta[];

export default function QuranScreen() {
  const t = useTheme();
  const router = useRouter();
  const settings = useSettings();
  const progress = useProgress();
  useLibrary();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'audio' | 'bookmarked'>('all');

  const reciters = allReciters();
  const hasAudio = useMemo(() => {
    const set = new Set<number>();
    for (const r of reciters) for (const k of Object.keys(r.files)) set.add(Number(k));
    return set;
  }, [reciters]);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL.filter((s) => {
      if (filter === 'audio' && !hasAudio.has(s.id)) return false;
      if (filter === 'bookmarked' && !Object.keys(progress.bookmarks).some((b) => b.startsWith(`${s.id}:`))) return false;
      if (!q) return true;
      return (
        s.en.toLowerCase().includes(q) ||
        s.ar.includes(query.trim()) ||
        String(s.id) === q
      );
    });
  }, [query, filter, hasAudio, progress.bookmarks]);

  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.card,
            borderRadius: Radius.pill,
            borderWidth: 1,
            borderColor: t.border,
            paddingHorizontal: Spacing.lg,
          }}
        >
          <Icon name="search" size={17} color={t.sub} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search surah by name or number…"
            placeholderTextColor={t.sub}
            style={{ flex: 1, paddingVertical: 12, marginLeft: 10, color: t.text, fontSize: 15 }}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
          <Chip label="All 114" small selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="With audio" small selected={filter === 'audio'} onPress={() => setFilter('audio')} />
          <Chip label="Bookmarked" small selected={filter === 'bookmarked'} onPress={() => setFilter('bookmarked')} />
        </View>
        {!!progress.lastRead && (
          <Pressable
            onPress={() => router.push(`/surah/${progress.lastRead!.surah}`)}
            style={{
              marginTop: Spacing.md,
              backgroundColor: t.primary,
              borderRadius: Radius.md,
              padding: Spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon name="play" size={17} color={t.onPrimary} filled />
            <Text style={{ color: t.onPrimary, fontWeight: '700', marginLeft: 10, flex: 1 }}>
              Continue — Surah {progress.lastRead.surah}, verse {progress.lastRead.ayah}
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={data}
        keyExtractor={(s) => String(s.id)}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 120 }}
        renderItem={({ item }) => {
          const audio = hasAudio.has(item.id);
          return (
            <Pressable
              onPress={() => router.push(`/surah/${item.id}`)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: t.card,
                borderRadius: Radius.md,
                borderWidth: 1,
                borderColor: t.border,
                padding: Spacing.md,
                marginTop: Spacing.sm,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: t.goldSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: t.gold, fontWeight: '800', fontSize: 13 }}>{item.id}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={{ color: t.text, fontWeight: '700', fontSize: 15.5 }}>{item.en}</Text>
                <Text style={{ color: t.sub, fontSize: 12, marginTop: 1 }}>
                  {item.type} · {item.ayahs} ayahs {audio ? '· 🔊' : ''}
                </Text>
              </View>
              <Text style={{ ...arabicStyle(22, t.text, true), marginLeft: Spacing.sm }}>{item.ar}</Text>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
