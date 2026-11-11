import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Chip, Icon, Screen, SectionTitle, Sub, Title } from '../components/ui';
import { TASBEEH_PRESETS } from '../data/adhkar';
import { updateProgress, useProgress } from '../lib/store';
import { Radius, Spacing, arabicStyle, useTheme } from '../theme';

export default function TasbeehScreen() {
  const t = useTheme();
  const progress = useProgress();
  const [presetAr, setPresetAr] = useState(progress.tasbeeh.preset || TASBEEH_PRESETS[0].ar);
  const preset = TASBEEH_PRESETS.find((p) => p.ar === presetAr) ?? TASBEEH_PRESETS[0];
  const count = progress.tasbeeh.preset === presetAr ? progress.tasbeeh.count : 0;
  const total = progress.tasbeeh.total;

  const increment = () => {
    Haptics.selectionAsync().catch(() => {});
    const next = count + 1;
    if (next === preset.target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    updateProgress({ tasbeeh: { count: next, total: total + 1, preset: presetAr } });
  };

  const reset = () => updateProgress({ tasbeeh: { count: 0, total, preset: presetAr } });

  return (
    <Screen>
      <Title>Tasbeeh</Title>
      <Sub style={{ marginTop: 6 }}>Tap the circle to count. Your totals are saved on this device.</Sub>

      <SectionTitle>Dhikr</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        {TASBEEH_PRESETS.map((p) => (
          <Chip
            key={p.ar}
            small
            label={p.label}
            selected={p.ar === presetAr}
            onPress={() => {
              updateProgress({ tasbeeh: { count: 0, total, preset: p.ar } });
              setPresetAr(p.ar);
            }}
          />
        ))}
      </View>

      <View style={{ alignItems: 'center', marginTop: Spacing.xl }}>
        <Text style={{ ...arabicStyle(30, t.gold, true), marginBottom: Spacing.lg }}>{presetAr}</Text>
        <Pressable
          onPress={increment}
          style={({ pressed }) => ({
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: t.primary,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.97 : 1 }],
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          })}
        >
          <Text style={{ color: t.onPrimary, fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{count}</Text>
          <Text style={{ color: t.onPrimary, opacity: 0.85, fontSize: 13, fontWeight: '700' }}>
            target {preset.target}
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl }}>
          <Pressable
            onPress={reset}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.card, borderRadius: Radius.pill, borderWidth: 1, borderColor: t.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}
          >
            <Icon name="repeat" size={17} color={t.text} />
            <Text style={{ color: t.text, fontWeight: '700', marginLeft: 8 }}>Reset counter</Text>
          </Pressable>
        </View>
      </View>

      <SectionTitle>Lifetime</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: t.gold, fontSize: 28, fontWeight: '900' }}>{total}</Text>
            <Sub>Total tasbeeh</Sub>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: t.gold, fontSize: 28, fontWeight: '900' }}>{Math.floor(total / preset.target)}</Text>
            <Sub>Completed rounds</Sub>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
