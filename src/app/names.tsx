import React, { useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen, Sub, Title } from '../components/ui';
import { NAMES_OF_ALLAH, type NameOfAllah } from '../data/names';
import { currentToken, playSource, stopAudio } from '../lib/audio';
import { toggleNameFav, useProgress } from '../lib/store';
import { Radius, Spacing, arabicStyle, useTheme } from '../theme';

type Theme = ReturnType<typeof useTheme>;

function Star({ on, t }: { on: boolean; t: Theme }) {
  return (
    <Text style={{ fontSize: 18, color: on ? t.gold : t.sub, opacity: on ? 1 : 0.55 }}>
      {on ? '★' : '☆'}
    </Text>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  t,
  primary,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  t: Theme;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: primary ? t.gold : t.card,
        borderColor: primary ? t.gold : t.border,
        borderWidth: 1,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Text style={{ fontSize: 14, color: primary ? '#12251C' : t.text }}>{icon}</Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: primary ? '#12251C' : t.text }}>{label}</Text>
    </Pressable>
  );
}

function NameRow({
  item,
  t,
  expanded,
  playing,
  fav,
  onToggleExpand,
  onPlay,
  onReplay,
  onStop,
  onToggleFav,
}: {
  item: NameOfAllah;
  t: Theme;
  expanded: boolean;
  playing: boolean;
  fav: boolean;
  onToggleExpand: () => void;
  onPlay: () => void;
  onReplay: () => void;
  onStop: () => void;
  onToggleFav: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: playing ? t.goldSoft : t.card,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: playing || expanded ? t.gold : t.border,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={onToggleExpand}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        <View style={{ width: 30, alignItems: 'center' }}>
          <Text style={{ color: playing ? t.gold : t.sub, fontSize: 12, fontWeight: '700' }}>{item.n}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text, fontSize: 15, fontWeight: '800' }}>{item.translit}</Text>
          <Text style={{ color: t.sub, fontSize: 12, marginTop: 2 }} numberOfLines={expanded ? undefined : 1}>
            {item.en}
          </Text>
        </View>

        <Text
          style={{
            ...arabicStyle(24, playing ? t.gold : t.text, true),
            textAlign: 'right',
            writingDirection: 'rtl',
            maxWidth: '42%',
          }}
          numberOfLines={1}
        >
          {item.ar}
        </Text>

        <Pressable onPress={onToggleFav} hitSlop={10} style={{ padding: 2 }}>
          <Star on={fav} t={t} />
        </Pressable>
      </Pressable>

      {playing && (
        <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm }}>
          <Text style={{ color: t.gold, fontSize: 11, fontWeight: '700' }}>
            ♪ Playing pronunciation ({item.durSec}s)
          </Text>
        </View>
      )}

      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: t.border,
            padding: Spacing.lg,
            alignItems: 'center',
            gap: Spacing.md,
          }}
        >
          <Text style={{ ...arabicStyle(42, t.gold, true), textAlign: 'center', writingDirection: 'rtl' }}>
            {item.ar}
          </Text>
          <Text style={{ color: t.text, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>{item.translit}</Text>
          <Text style={{ color: t.text, fontSize: 14, textAlign: 'center' }}>{item.en}</Text>

          <View
            style={{
              backgroundColor: t.bg,
              borderRadius: Radius.md,
              borderWidth: 1,
              borderColor: t.border,
              padding: Spacing.lg,
            }}
          >
            <Text style={{ color: t.sub, fontSize: 13, lineHeight: 20, textAlign: 'center' }}>
              {item.explanation}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' }}>
            <ActionButton label="Play" icon="▶" primary onPress={onPlay} t={t} />
            <ActionButton label="Replay" icon="↻" onPress={onReplay} t={t} />
            <ActionButton label="Stop" icon="■" onPress={onStop} t={t} />
            <ActionButton label={fav ? 'Favourited' : 'Favourite'} icon={fav ? '★' : '☆'} onPress={onToggleFav} t={t} />
          </View>

          <Text style={{ color: t.gold, fontSize: 11, fontWeight: '700' }}>#{item.n} of 99 · Al-Asma al-Husna</Text>
        </View>
      )}
    </View>
  );
}

export default function NamesScreen() {
  const t = useTheme();
  const progress = useProgress();
  const [query, setQuery] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [expandedN, setExpandedN] = useState<number | null>(null);
  const [playingN, setPlayingN] = useState<number | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const favs = progress.namesFavs ?? {};

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NAMES_OF_ALLAH.filter((n) => {
      if (favOnly && !favs[String(n.n)]) return false;
      if (!q) return true;
      return (
        n.translit.toLowerCase().includes(q) ||
        n.en.toLowerCase().includes(q) ||
        n.ar.includes(query.trim())
      );
    });
  }, [query, favOnly, favs]);

  const stopHighlight = () => {
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
  };

  const playName = (n: NameOfAllah) => {
    stopHighlight();
    playSource(n.audio);
    setPlayingN(n.n);
    // Clips are short (1–4 s); clear the highlight after the clip ends even if
    // the player event API is unavailable — playback itself is never blocked.
    const token = currentToken();
    clearTimer.current = setTimeout(() => {
      if (currentToken() === token) setPlayingN((cur) => (cur === n.n ? null : cur));
    }, n.durSec * 1000 + 1200);
  };

  const stopName = () => {
    stopHighlight();
    stopAudio();
    setPlayingN(null);
  };

  return (
    <Screen>
      <Title>99 Names of Allah</Title>
      <Sub style={{ marginTop: 6 }}>
        Al-Asma al-Husna — the beautiful names with meanings and authentic pronunciation. Tap a name for
        details; use Play, Replay and Stop for its recording. All audio is bundled offline.
      </Sub>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginTop: Spacing.lg,
        }}
      >
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or meaning…"
          placeholderTextColor={t.sub}
          style={{
            flex: 1,
            backgroundColor: t.card,
            borderWidth: 1,
            borderColor: t.border,
            borderRadius: Radius.md,
            color: t.text,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            fontSize: 14,
          }}
        />
        <Pressable
          onPress={() => setFavOnly((v) => !v)}
          style={{
            backgroundColor: favOnly ? t.goldSoft : t.card,
            borderWidth: 1,
            borderColor: favOnly ? t.gold : t.border,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
          }}
        >
          <Text style={{ color: favOnly ? t.gold : t.sub, fontWeight: '700', fontSize: 13 }}>
            ★ Favourites
          </Text>
        </Pressable>
      </View>

      <Text style={{ color: t.sub, fontSize: 11, marginTop: Spacing.md, marginBottom: Spacing.sm }}>
        {favOnly
          ? `${visible.length} favourite${visible.length === 1 ? '' : 's'}`
          : query.trim()
            ? `${visible.length} result${visible.length === 1 ? '' : 's'}`
            : `${NAMES_OF_ALLAH.length} names · tap any name`}
      </Text>

      {visible.length === 0 && (
        <View
          style={{
            backgroundColor: t.card,
            borderRadius: Radius.lg,
            borderWidth: 1,
            borderColor: t.border,
            padding: Spacing.xl,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: t.sub, fontSize: 13 }}>
            {favOnly ? 'No favourites yet — tap ☆ on any name to save it.' : 'No names match your search.'}
          </Text>
        </View>
      )}

      {visible.map((n) => (
        <NameRow
          key={n.n}
          item={n}
          t={t}
          expanded={expandedN === n.n}
          playing={playingN === n.n}
          fav={!!favs[String(n.n)]}
          onToggleExpand={() => {
            setExpandedN((cur) => (cur === n.n ? null : n.n));
          }}
          onPlay={() => playName(n)}
          onReplay={() => playName(n)}
          onStop={stopName}
          onToggleFav={() => toggleNameFav(String(n.n))}
        />
      ))}
    </Screen>
  );
}
