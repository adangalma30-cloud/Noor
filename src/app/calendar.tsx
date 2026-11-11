import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Icon, Screen, SectionTitle, Sub, Title } from '../components/ui';
import {
  HIJRI_MONTHS,
  daysInHijriMonth,
  eventsForHijriMonth,
  formatHijri,
  hijriToGregorian,
  toHijri,
} from '../lib/hijri';
import { useSettings } from '../lib/store';
import { Radius, Spacing, useTheme } from '../theme';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen() {
  const t = useTheme();
  const settings = useSettings();
  const today = new Date();
  const todayH = toHijri(today, settings.hijriAdjust);
  const [view, setView] = useState({ y: todayH.y, m: todayH.m });

  const days = useMemo(() => {
    const len = daysInHijriMonth({ y: view.y, m: view.m, d: 1 });
    const first = hijriToGregorian({ y: view.y, m: view.m, d: 1 });
    const lead = first.getDay();
    const cells: ({ h: number; g: Date } | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= len; d++) {
      cells.push({ h: d, g: hijriToGregorian({ y: view.y, m: view.m, d }) });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  const events = eventsForHijriMonth(view.m);
  const shift = (delta: number) => {
    let m = view.m + delta;
    let y = view.y;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setView({ y, m });
  };

  return (
    <Screen>
      <Title>Hijri calendar</Title>
      <Sub style={{ marginTop: 6 }}>
        Calculated on this device (Umm al-Qura style). Actual dates may differ by a day with moon sighting — use the
        adjustment in Settings.
      </Sub>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg }}>
        <Pressable onPress={() => shift(-1)} style={{ padding: 10, borderRadius: Radius.pill, backgroundColor: t.overlay }}>
          <Icon name="prev" size={17} color={t.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: t.text, fontWeight: '800', fontSize: 19 }}>
            {HIJRI_MONTHS[view.m - 1]} {view.y}
          </Text>
          <Sub style={{ fontSize: 12 }}>
            {hijriToGregorian({ y: view.y, m: view.m, d: 1 }).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </Sub>
        </View>
        <Pressable onPress={() => shift(1)} style={{ padding: 10, borderRadius: Radius.pill, backgroundColor: t.overlay }}>
          <Icon name="next" size={17} color={t.text} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', marginTop: Spacing.lg }}>
        {WEEK.map((w, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', color: t.gold, fontWeight: '800', fontSize: 12 }}>
            {w}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm }}>
        {days.map((cell, i) => {
          if (!cell) return <View key={i} style={{ width: `${100 / 7}%`, height: 52 }} />;
          const isToday =
            cell.g.getFullYear() === today.getFullYear() &&
            cell.g.getMonth() === today.getMonth() &&
            cell.g.getDate() === today.getDate();
          const hasEvent = events.some((e) => e.d === cell.h);
          return (
            <View key={i} style={{ width: `${100 / 7}%`, height: 52, alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  width: 40,
                  height: 44,
                  borderRadius: Radius.sm,
                  backgroundColor: isToday ? t.primary : hasEvent ? t.goldSoft : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: isToday ? t.onPrimary : t.text, fontWeight: '700', fontSize: 14 }}>{cell.h}</Text>
                <Text style={{ color: isToday ? t.onPrimary : t.sub, fontSize: 9.5 }}>{cell.g.getDate()}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <SectionTitle>Events this Hijri month</SectionTitle>
      {events.length === 0 && <Sub>No major events in {HIJRI_MONTHS[view.m - 1]}.</Sub>}
      {events.map((e) => (
        <Card key={`${e.m}-${e.d}-${e.name}`} style={{ marginBottom: Spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: t.gold, fontWeight: '800' }}>{e.d}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={{ color: t.text, fontWeight: '700' }}>{e.name}</Text>
              {!!e.note && <Sub style={{ fontSize: 11.5 }}>{e.note}</Sub>}
            </View>
          </View>
        </Card>
      ))}

      <SectionTitle>Today</SectionTitle>
      <Card>
        <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>{formatHijri(todayH)}</Text>
        <Sub style={{ marginTop: 2 }}>{today.toDateString()}</Sub>
      </Card>
    </Screen>
  );
}
