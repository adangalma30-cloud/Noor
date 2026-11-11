import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import { Card, Icon, Screen, SectionTitle, Sub, Title } from '../components/ui';
import { compassLabel, greatCircleKm, qiblaBearing } from '../lib/qibla';
import { useSettings } from '../lib/store';
import { Radius, Spacing, useTheme } from '../theme';

export default function QiblaScreen() {
  const t = useTheme();
  const settings = useSettings();
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<boolean | null>(null);

  const qibla = qiblaBearing(settings.lat, settings.lng);
  const distance = greatCircleKm(settings.lat, settings.lng);
  const rotation = heading == null ? qibla : qibla - heading;

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status === 'granted');
      if (status !== 'granted') return;
      try {
        sub = await Location.watchHeadingAsync((h) => {
          setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading);
        });
      } catch {
        setPermission(false);
      }
    })();
    return () => {
      sub?.remove();
    };
  }, []);

  return (
    <Screen>
      <Title>Qibla compass</Title>
      <Sub style={{ marginTop: 6 }}>
        The Qibla is calculated locally from your selected location ({settings.label}). Hold the phone flat, away
        from metal objects, and rotate slowly to calibrate the compass.
      </Sub>

      <View style={{ alignItems: 'center', marginTop: Spacing.xxl }}>
        <View
          style={{
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: t.card,
            borderWidth: 2,
            borderColor: t.border,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}
        >
          <Svg width={240} height={240} viewBox="0 0 240 240">
            <Circle cx={120} cy={120} r={112} stroke={t.border} strokeWidth={2} fill="none" />
            {Array.from({ length: 36 }).map((_, i) => (
              <Line
                key={i}
                x1={120 + 104 * Math.cos((i * 10 * Math.PI) / 180)}
                y1={120 + 104 * Math.sin((i * 10 * Math.PI) / 180)}
                x2={120 + (i % 9 === 0 ? 92 : 98) * Math.cos((i * 10 * Math.PI) / 180)}
                y2={120 + (i % 9 === 0 ? 92 : 98) * Math.sin((i * 10 * Math.PI) / 180)}
                stroke={t.sub}
                strokeWidth={i % 9 === 0 ? 2 : 1}
              />
            ))}
            {/* Needle rotates so the gold tip points at the Qibla relative to heading */}
            <Polygon
              points="120,32 112,120 128,120"
              fill={t.gold}
              transform={`rotate(${rotation} 120 120)`}
            />
            <Polygon
              points="120,208 112,120 128,120"
              fill={t.sub}
              opacity={0.35}
              transform={`rotate(${rotation} 120 120)`}
            />
            <Circle cx={120} cy={120} r={12} fill={t.primary} />
            <Path d="M120 218l6 10h-12z" fill={t.danger} />
          </Svg>
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text style={{ color: t.gold, fontSize: 26, fontWeight: '900' }}>{Math.round(qibla)}°</Text>
            <Sub style={{ fontSize: 11.5 }}>{compassLabel(qibla)} from true north</Sub>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl }}>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Icon name="location" size={20} color={t.primary} />
            <Text style={{ color: t.text, fontWeight: '800', fontSize: 16, marginTop: 6 }}>{distance.toLocaleString()} km</Text>
            <Sub style={{ fontSize: 11.5 }}>to the Kaaba</Sub>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Icon name="compass" size={20} color={t.primary} />
            <Text style={{ color: t.text, fontWeight: '800', fontSize: 16, marginTop: 6 }}>
              {heading == null ? '—' : `${Math.round(heading)}°`}
            </Text>
            <Sub style={{ fontSize: 11.5 }}>device heading</Sub>
          </Card>
        </View>

        {permission === false && (
          <Card style={{ marginTop: Spacing.lg, backgroundColor: t.goldSoft, borderColor: t.gold }}>
            <Text style={{ color: t.gold, fontWeight: '700' }}>Compass needs location permission</Text>
            <Sub style={{ marginTop: 4 }}>
              The arrow above still shows the correct Qibla direction relative to north. Grant location access in
              Settings to align it with the way your phone is facing.
            </Sub>
          </Card>
        )}

        <SectionTitle>How to use</SectionTitle>
        <Card>
          <Sub>
            1. Hold the phone flat in your palm.{'\n'}2. The gold tip points towards the Qibla.{'\n'}3. When the gold
            tip is at the top of the dial, you are facing the Kaaba.{'\n'}4. The compass uses your device magnetometer —
            no internet needed.
          </Sub>
        </Card>
      </View>
    </Screen>
  );
}
