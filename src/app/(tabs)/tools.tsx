import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, Screen, SectionTitle, Sub, Title } from '../../components/ui';
import { Radius, Spacing, useTheme } from '../../theme';

const TOOLS: { icon: string; title: string; desc: string; href: string }[] = [
  { icon: 'hands', title: 'Tasbeeh', desc: 'Digital counter with targets and saved totals', href: '/tasbeeh' },
  { icon: 'compass', title: 'Qibla compass', desc: 'Direction to the Kaaba from your location', href: '/qibla' },
  { icon: 'calendar', title: 'Hijri calendar', desc: 'Islamic month view with events', href: '/calendar' },
  { icon: 'moon', title: 'Morning & evening Adhkar', desc: 'Authentic daily remembrances with counters', href: '/adhkar' },
  { icon: 'star', title: 'Daily Duas', desc: 'Supplications for everyday moments', href: '/duas' },
  { icon: 'heart', title: '99 Names of Allah', desc: 'Al-Asma al-Husna with meanings', href: '/names' },
  { icon: 'check', title: 'Prayer tracker', desc: 'Log your salah and build consistency', href: '/tracker' },
  { icon: 'info', title: 'Sources & licenses', desc: 'Where every text and recording comes from', href: '/licenses' },
];

export default function ToolsScreen() {
  const t = useTheme();
  const router = useRouter();
  return (
    <Screen>
      <Title>Islamic tools</Title>
      <Sub style={{ marginTop: 6 }}>Everything works offline — nothing leaves your device.</Sub>
      <SectionTitle>All tools</SectionTitle>
      {TOOLS.map((tool) => (
        <Pressable
          key={tool.href}
          onPress={() => router.push(tool.href as never)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.card,
            borderRadius: Radius.lg,
            borderWidth: 1,
            borderColor: t.border,
            padding: Spacing.lg,
            marginBottom: Spacing.md,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={tool.icon} size={21} color={t.gold} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={{ color: t.text, fontWeight: '700', fontSize: 15.5 }}>{tool.title}</Text>
            <Sub style={{ fontSize: 12.5 }}>{tool.desc}</Sub>
          </View>
          <Icon name="next" size={16} color={t.sub} />
        </Pressable>
      ))}
    </Screen>
  );
}
