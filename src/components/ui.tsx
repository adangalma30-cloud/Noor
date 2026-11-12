import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ColorValue,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Radius, Spacing, arabicStyle, useTheme } from '../theme';

export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const inner = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl * 2 }, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }, style]}>{children}</View>
  );
  return <View style={{ flex: 1, backgroundColor: t.bg }}>{inner}</View>;
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const t = useTheme();
  const body = (
    <View
      style={[
        {
          backgroundColor: t.card,
          borderRadius: Radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.border,
          padding: Spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      {body}
    </Pressable>
  );
}

export function SectionTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return (
    <Text
      style={[
        {
          fontSize: 13,
          fontWeight: '700',
          letterSpacing: 1.1,
          textTransform: 'uppercase',
          color: t.gold,
          marginBottom: Spacing.sm,
          marginTop: Spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Title({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 24, fontWeight: '800', color: t.text }, style]}>{children}</Text>;
}

export function Sub({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 14, color: t.sub, lineHeight: 21 }, style]}>{children}</Text>;
}

export function Chip({
  label,
  selected,
  onPress,
  small,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: small ? Spacing.md : Spacing.lg,
          paddingVertical: small ? 6 : 10,
          borderRadius: Radius.pill,
          borderWidth: 1,
          borderColor: selected ? t.primary : t.border,
          backgroundColor: selected ? t.primary : t.card,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={{ color: selected ? t.onPrimary : t.text, fontWeight: '600', fontSize: small ? 12.5 : 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.track, borderRadius: Radius.pill, padding: 4 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: Radius.pill,
              backgroundColor: active ? t.primary : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: active ? t.onPrimary : t.sub, fontWeight: '700', fontSize: 13 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Row({
  label,
  value,
  onPress,
  right,
  sub,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  sub?: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.text, fontSize: 15.5, fontWeight: '600' }}>{label}</Text>
        {!!sub && <Text style={{ color: t.sub, fontSize: 12.5, marginTop: 2 }}>{sub}</Text>}
      </View>
      {!!value && <Text style={{ color: t.sub, fontSize: 14, marginRight: right ? 8 : 0 }}>{value}</Text>}
      {right}
    </Pressable>
  );
}

export function Divider() {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border }} />;
}

export function Arabic({ children, size = 22, style }: { children: React.ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[arabicStyle(size, t.text), style]}>{children}</Text>;
}

const ICONS: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10V20h5v-5.5h3V20h5V10',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM20 18v3H6.5A2.5 2.5 0 0 1 4 18.5',
  megaphone: 'M3 10v4h3l7 4V6l-7 4zm10-1 6-3v12l-6-3z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  gear: 'M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM12 2l1.6 2.6 3-.5.6 3 2.8 1.2-1.3 2.8L20 14l-2.3 2 .5 3-3 .8L14 22h-4l-1.2-2.2-3-.8.5-3L4 14l1.3-2.9L4 8.3l2.8-1.2.6-3 3 .5z',
  compass: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm3.5-12.5-2 5-5 2 2-5z',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  hands: 'M7 11V6.5a1.5 1.5 0 0 1 3 0V11m0-1V5a1.5 1.5 0 0 1 3 0v5m0-.5V6a1.5 1.5 0 0 1 3 0v6.5c0 4-2.5 7.5-6.5 7.5S6 17 6 13.5V11a1.5 1.5 0 0 1 3 0',
  star: 'M12 3l2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9z',
  check: 'M4 12.5 9.5 18 20 6.5',
  clock: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3.5 2',
  location: 'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
  heart: 'M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.5 2.7c0 5.8-8.5 11.3-8.5 11.3z',
  share: 'M12 3v11M8 6.5 12 3l4 3.5M5 13v7h14v-7',
  pause: 'M8 5h3v14H8zM13 5h3v14h-3z',
  play: 'M8 5l11 7-11 7z',
  next: 'M6 5l9 7-9 7zM17 5h2v14h-2z',
  prev: 'M18 5l-9 7 9 7zM5 5h2v14H5z',
  repeat: 'M4 9V7a3 3 0 0 1 3-3h10l-2.5-2.5M20 15v2a3 3 0 0 1-3 3H7l2.5 2.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M5 7h14M9 7V5h6v2m-7 0 1 13h8l1-13',
  info: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 11v6M12 7.5v.5',
  download: 'M12 3v11m0 0 4.5-4.5M12 14l-4.5-4.5M4 19h16',
  search: 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zM16 16l5 5',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z',
};

export function Icon({
  name,
  size = 22,
  color,
  filled = false,
}: {
  name: keyof typeof ICONS | string;
  size?: number;
  color?: ColorValue;
  filled?: boolean;
}) {
  const t = useTheme();
  const d = ICONS[name] ?? ICONS.star;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={d}
        stroke={(color ?? t.text) as string}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? (color ?? t.text) : 'none'}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({});
