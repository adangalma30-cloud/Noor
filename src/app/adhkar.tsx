import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Screen, SectionTitle, Segmented, Sub, Title } from '../components/ui';
import { EVENING_ADHKAR, MORNING_ADHKAR, POST_PRAYER_ADHKAR, type Dhikr } from '../data/adhkar';
import { Radius, Spacing, arabicStyle, useTheme } from '../theme';

function DhikrCard({ dhikr, index }: { dhikr: Dhikr; index: number }) {
  const t = useTheme();
  const [count, setCount] = useState(0);
  const done = count >= dhikr.count;
  return (
    <Card style={{ marginBottom: Spacing.md, borderColor: done ? t.gold : t.border, borderWidth: 1 }}>
      <Text style={{ ...arabicStyle(22, t.text), lineHeight: 42 }}>{dhikr.ar}</Text>
      <Sub style={{ marginTop: Spacing.md }}>{dhikr.en}</Sub>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md }}>
        <Sub style={{ fontSize: 11.5, color: t.gold, fontWeight: '700' }}>{dhikr.ref}</Sub>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <Text style={{ color: done ? t.gold : t.sub, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
            {Math.min(count, dhikr.count)}/{dhikr.count}
          </Text>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setCount((c) => {
                const n = c + 1;
                if (n === dhikr.count) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                return n;
              });
            }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: done ? t.gold : t.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: done ? '#3A2B08' : t.onPrimary, fontWeight: '900', fontSize: 16 }}>
              {done ? '✓' : '+1'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setCount(0)} hitSlop={8}>
            <Sub style={{ fontSize: 11 }}>reset</Sub>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

export default function AdhkarScreen() {
  const [tab, setTab] = useState<'morning' | 'evening' | 'post'>('morning');
  const list = tab === 'morning' ? MORNING_ADHKAR : tab === 'evening' ? EVENING_ADHKAR : POST_PRAYER_ADHKAR;
  return (
    <Screen>
      <Title>Adhkar</Title>
      <Sub style={{ marginTop: 6 }}>
        The authentic morning, evening and post-prayer remembrances. Tap to count each dhikr.
      </Sub>
      <View style={{ marginTop: Spacing.lg }}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'morning', label: 'Morning' },
            { value: 'evening', label: 'Evening' },
            { value: 'post', label: 'After prayer' },
          ]}
        />
      </View>
      <SectionTitle>{tab === 'morning' ? 'Morning Adhkar' : tab === 'evening' ? 'Evening Adhkar' : 'Post-prayer Adhkar'}</SectionTitle>
      {list.map((d, i) => (
        <DhikrCard key={`${tab}-${i}`} dhikr={d} index={i} />
      ))}
    </Screen>
  );
}
