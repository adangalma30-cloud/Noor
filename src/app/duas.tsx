import React from 'react';
import { Text, View } from 'react-native';
import { Card, Screen, SectionTitle, Sub, Title } from '../components/ui';
import { DUAS } from '../data/duas';
import { Spacing, arabicStyle, useTheme } from '../theme';

export default function DuasScreen() {
  const t = useTheme();
  return (
    <Screen>
      <Title>Daily Duas</Title>
      <Sub style={{ marginTop: 6 }}>Short authentic supplications for everyday moments — saved entirely on your device.</Sub>
      <SectionTitle>Supplications</SectionTitle>
      {DUAS.map((dua) => (
        <Card key={dua.id} style={{ marginBottom: Spacing.md }}>
          <Text style={{ color: t.gold, fontWeight: '800', fontSize: 13.5 }}>
            {dua.title}
            <Text style={{ color: t.sub, fontWeight: '400' }}>{'  ·  '}{dua.titleAr}</Text>
          </Text>
          <Text style={{ ...arabicStyle(21, t.text), lineHeight: 40, marginTop: Spacing.sm }}>{dua.ar}</Text>
          <Sub style={{ marginTop: Spacing.sm }}>{dua.en}</Sub>
          <Text style={{ color: t.gold, fontSize: 11, marginTop: Spacing.sm, fontWeight: '700' }}>{dua.ref}</Text>
        </Card>
      ))}
    </Screen>
  );
}
