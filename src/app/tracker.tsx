import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Icon, Screen, SectionTitle, Sub, Title } from '../components/ui';
import { logPrayer, useProgress } from '../lib/store';
import { PRAYER_KEYS, PRAYER_NAMES, type PrayerKey } from '../types';
import { Radius, Spacing, useTheme } from '../theme';

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

export default function TrackerScreen() {
  const t = useTheme();
  const progress = useProgress();
  const [selected, setSelected] = useState(() => dateKey(new Date()));

  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    for (let i = 0; i < 400; i++) {
      const key = dateKey(d);
      const day = progress.tracker[key];
      const complete = day && PRAYER_KEYS.every((p) => day[p]);
      if (complete) s++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [progress.tracker]);

  const monthDays = useMemo(() => {
    const now = new Date();
    const count = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => new Date(now.getFullYear(), now.getMonth(), i + 1));
  }, []);

  const monthStats = useMemo(() => {
    let prayed = 0;
    let possible = 0;
    const now = new Date();
    for (const d of monthDays) {
      if (d > now) break;
      const day = progress.tracker[dateKey(d)];
      possible += 5;
      prayed += PRAYER_KEYS.filter((p) => day?.[p]).length;
    }
    return { prayed, possible };
  }, [monthDays, progress.tracker]);

  const selectedDay = progress.tracker[selected] ?? {};

  return (
    <Screen>
      <Title>Prayer tracker</Title>
      <Sub style={{ marginTop: 6 }}>Tap a day to log your five daily prayers. All data stays on this device.</Sub>

      <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: t.gold, fontSize: 30, fontWeight: '900' }}>{streak}</Text>
          <Sub>day streak</Sub>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: t.gold, fontSize: 30, fontWeight: '900' }}>
            {monthStats.possible ? Math.round((monthStats.prayed / monthStats.possible) * 100) : 0}%
          </Text>
          <Sub>this month</Sub>
        </Card>
      </View>

      <SectionTitle>This month</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {monthDays.map((d) => {
          const key = dateKey(d);
          const day = progress.tracker[key];
          const done = PRAYER_KEYS.filter((p) => day?.[p]).length;
          const isSel = key === selected;
          return (
            <Pressable
              key={key}
              onPress={() => setSelected(key)}
              style={{
                width: '12.5%',
                aspectRatio: 0.9,
                borderRadius: Radius.sm,
                backgroundColor: isSel ? t.primary : done === 5 ? t.goldSoft : t.card,
                borderWidth: 1,
                borderColor: isSel ? t.primary : t.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: isSel ? t.onPrimary : t.text, fontWeight: '700', fontSize: 11.5 }}>{d.getDate()}</Text>
              {done > 0 && (
                <Text style={{ color: isSel ? t.onPrimary : t.gold, fontSize: 9 }}>{done}/5</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <SectionTitle>{selected}</SectionTitle>
      <Card>
        {PRAYER_KEYS.map((p: PrayerKey, i) => (
          <View key={p}>
            {i > 0 && <View style={{ height: 1, backgroundColor: t.border, opacity: 0.5 }} />}
            <Pressable
              onPress={() => logPrayer(selected, p, !selectedDay[p])}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: selectedDay[p] ? t.primary : t.border,
                  backgroundColor: selectedDay[p] ? t.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selectedDay[p] && <Icon name="check" size={15} color={t.onPrimary} />}
              </View>
              <Text style={{ color: t.text, fontWeight: '700', marginLeft: Spacing.md, flex: 1 }}>
                {PRAYER_NAMES[p].en}
              </Text>
              <Text style={{ color: t.sub, fontSize: 12 }}>{selectedDay[p] ? 'Prayed' : 'Tap to mark'}</Text>
            </Pressable>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
