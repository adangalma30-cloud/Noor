import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen, Sub, Title } from '../components/ui';
import { NAMES_OF_ALLAH } from '../data/names';
import { Radius, Spacing, arabicStyle, useTheme } from '../theme';

export default function NamesScreen() {
  const t = useTheme();
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <Screen>
      <Title>99 Names of Allah</Title>
      <Sub style={{ marginTop: 6 }}>Al-Asma al-Husna — the beautiful names, with meanings. Tap a name to see details.</Sub>

      {selected != null && (
        <View
          style={{
            backgroundColor: t.card,
            borderRadius: Radius.lg,
            borderWidth: 1,
            borderColor: t.gold,
            padding: Spacing.xl,
            marginTop: Spacing.lg,
            alignItems: 'center',
          }}
        >
          <Text style={{ ...arabicStyle(40, t.gold, true) }}>{NAMES_OF_ALLAH[selected - 1].ar}</Text>
          <Text style={{ color: t.text, fontWeight: '800', fontSize: 18, marginTop: Spacing.md }}>
            {NAMES_OF_ALLAH[selected - 1].translit}
          </Text>
          <Text style={{ color: t.sub, fontSize: 14, marginTop: 4 }}>{NAMES_OF_ALLAH[selected - 1].en}</Text>
          <Text style={{ color: t.gold, fontSize: 11, marginTop: Spacing.md, fontWeight: '700' }}>#{selected} of 99</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg }}>
        {NAMES_OF_ALLAH.map((n) => (
          <Pressable
            key={n.n}
            onPress={() => setSelected(n.n)}
            style={{
              width: '31%',
              backgroundColor: selected === n.n ? t.goldSoft : t.card,
              borderRadius: Radius.md,
              borderWidth: 1,
              borderColor: selected === n.n ? t.gold : t.border,
              paddingVertical: Spacing.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ ...arabicStyle(20, selected === n.n ? t.gold : t.text, true), textAlign: 'center' }}>{n.ar}</Text>
            <Text style={{ color: t.sub, fontSize: 10, marginTop: 4 }}>{n.translit}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
