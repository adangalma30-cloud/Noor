import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';

export function CountdownRing({
  progress,
  size = 168,
  children,
}: {
  /** 0..1 — fraction of the interval already elapsed */
  progress: number;
  size?: number;
  children?: React.ReactNode;
}) {
  const t = useTheme();
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={t.gold}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - clamped)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

export function CountdownDigits({ h, m, s, color }: { h: number; m: number; s: number; color: string }) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={{ fontSize: 34, fontWeight: '800', color, fontVariant: ['tabular-nums'] }}>
        {pad(h)}:{pad(m)}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color, marginLeft: 4, fontVariant: ['tabular-nums'] }}>
        :{pad(s)}
      </Text>
    </View>
  );
}
