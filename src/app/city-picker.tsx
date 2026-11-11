import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import cities from '../data/cities.json';
import { Icon, Screen, Sub } from '../components/ui';
import { setCity, setGpsLocation, updateSettings, useSettings } from '../lib/store';
import { rescheduleAll } from '../lib/schedule';
import type { City } from '../types';
import { Radius, Spacing, useTheme } from '../theme';

const ALL = cities as City[];

export default function CityPicker() {
  const t = useTheme();
  const router = useRouter();
  const settings = useSettings();
  const [query, setQuery] = useState('');
  const [gpsBusy, setGpsBusy] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return ALL.slice(0, 60);
    const out: City[] = [];
    for (const c of ALL) {
      if (c.n.toLowerCase().startsWith(q) || c.a.toLowerCase().startsWith(q)) {
        out.push(c);
        if (out.length >= 80) break;
      }
    }
    if (out.length < 20) {
      for (const c of ALL) {
        if ((c.n.toLowerCase().includes(q) || c.c.toLowerCase() === q) && !out.includes(c)) {
          out.push(c);
          if (out.length >= 80) break;
        }
      }
    }
    return out;
  }, [query]);

  const pick = (c: City) => {
    setCity(c);
    rescheduleAll().catch(() => {});
    router.back();
  };

  const useGps = async () => {
    try {
      setGpsBusy(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setGpsLocation(pos.coords.latitude, pos.coords.longitude, 'Current location');
      rescheduleAll().catch(() => {});
      router.back();
    } finally {
      setGpsBusy(false);
    }
  };

  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      <View style={{ padding: Spacing.lg, paddingBottom: Spacing.sm }}>
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
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search 34,000+ cities worldwide…"
            placeholderTextColor={t.sub}
            style={{ flex: 1, paddingVertical: 12, marginLeft: 10, color: t.text, fontSize: 15 }}
          />
        </View>
        <Pressable
          onPress={useGps}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.primary,
            borderRadius: Radius.md,
            padding: Spacing.md,
            marginTop: Spacing.md,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon name="location" size={18} color={t.onPrimary} />
          <Text style={{ color: t.onPrimary, fontWeight: '700', marginLeft: 10 }}>
            {gpsBusy ? 'Locating…' : 'Use my current location (GPS)'}
          </Text>
        </Pressable>
        <Sub style={{ marginTop: Spacing.sm, fontSize: 11.5 }}>
          Current: {settings.label} · works fully offline
        </Sub>
      </View>
      <FlatList
        data={results}
        keyExtractor={(c) => `${c.n}-${c.c}-${c.lat}-${c.lng}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 60 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => pick(item)}
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
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>{item.n}</Text>
              <Text style={{ color: t.sub, fontSize: 12, marginTop: 1 }}>
                {item.c} · {item.t} {item.p ? `· ${(item.p / 1e6).toFixed(1)}M people` : ''}
              </Text>
            </View>
            <Icon name="location" size={16} color={t.sub} />
          </Pressable>
        )}
      />
    </Screen>
  );
}
