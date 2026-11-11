import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Card, Chip, Divider, Icon, Row, Screen, SectionTitle, Segmented, Sub, Title } from '../../components/ui';
import { METHOD_LABELS, updateSettings, useSettings } from '../../lib/store';
import { rescheduleAll } from '../../lib/schedule';
import type { MethodId } from '../../types';
import { Radius, Spacing, useTheme } from '../../theme';

function Stepper({ value, onDec, onInc, label }: { value: string; onDec: () => void; onInc: () => void; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
      <Text style={{ color: t.sub, fontSize: 13, marginRight: 'auto' }}>{label}</Text>
      <Pressable onPress={onDec} style={{ padding: 8, borderRadius: Radius.pill, backgroundColor: t.overlay }}>
        <Icon name="minus" size={16} color={t.text} />
      </Pressable>
      <Text style={{ color: t.text, fontWeight: '800', minWidth: 44, textAlign: 'center' }}>{value}</Text>
      <Pressable onPress={onInc} style={{ padding: 8, borderRadius: Radius.pill, backgroundColor: t.overlay }}>
        <Icon name="plus" size={16} color={t.text} />
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const settings = useSettings();
  const [gpsBusy, setGpsBusy] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);

  const useGps = async () => {
    try {
      setGpsBusy(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow location access to use your current position — or pick a city manually.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      updateSettings({
        locationMode: 'auto',
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        label: 'Current location',
        city: null,
      });
      rescheduleAll().catch(() => {});
    } catch (e) {
      Alert.alert('Location failed', 'Could not get your position. You can choose a city manually instead.');
    } finally {
      setGpsBusy(false);
    }
  };

  return (
    <Screen>
      <Title>Settings</Title>

      <SectionTitle>Location</SectionTitle>
      <Card>
        <Row label="Selected location" value={settings.label} onPress={() => router.push('/city-picker')} right={<Icon name="next" size={15} color={t.sub} />} />
        <Divider />
        <Pressable
          onPress={useGps}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.overlay,
            borderRadius: Radius.md,
            padding: Spacing.md,
            marginTop: Spacing.md,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon name="location" size={18} color={t.primary} />
          <Text style={{ color: t.primary, fontWeight: '700', marginLeft: 10 }}>
            {gpsBusy ? 'Locating…' : 'Use my current location (GPS)'}
          </Text>
        </Pressable>
        <Sub style={{ marginTop: Spacing.sm, fontSize: 11.5 }}>
          Location is used only on this device to calculate prayer times and Qibla. No internet is required.
        </Sub>
      </Card>

      <SectionTitle>Prayer calculation</SectionTitle>
      <Card>
        <Row
          label="Calculation method"
          value={METHOD_LABELS[settings.method].split(' (')[0]}
          onPress={() => setMethodOpen(!methodOpen)}
          right={<Icon name="next" size={15} color={t.sub} />}
        />
        {methodOpen && (
          <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
            {(Object.keys(METHOD_LABELS) as MethodId[]).map((m) => (
              <Chip
                key={m}
                small
                label={METHOD_LABELS[m]}
                selected={settings.method === m}
                onPress={() => {
                  updateSettings({ method: m });
                  rescheduleAll().catch(() => {});
                  setMethodOpen(false);
                }}
              />
            ))}
          </View>
        )}
        <Divider />
        <Text style={{ color: t.text, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm }}>Asr juristic method</Text>
        <Segmented
          value={settings.madhab}
          onChange={(v) => {
            updateSettings({ madhab: v });
            rescheduleAll().catch(() => {});
          }}
          options={[
            { value: 'shafi', label: "Standard (Shafi'i, Maliki, Hanbali)" },
            { value: 'hanafi', label: 'Hanafi' },
          ]}
        />
        <Divider />
        <Text style={{ color: t.text, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm }}>Hijri date adjustment</Text>
        <Stepper
          label="Days (absorbs moon-sighting drift)"
          value={settings.hijriAdjust > 0 ? `+${settings.hijriAdjust}` : String(settings.hijriAdjust)}
          onDec={() => updateSettings({ hijriAdjust: Math.max(-2, settings.hijriAdjust - 1) })}
          onInc={() => updateSettings({ hijriAdjust: Math.min(2, settings.hijriAdjust + 1) })}
        />
      </Card>

      <SectionTitle>Notifications & Adhan</SectionTitle>
      <Card>
        <Row
          label="Notify at prayer time"
          right={
            <Pressable onPress={() => { updateSettings({ notifyAtTime: !settings.notifyAtTime }); rescheduleAll().catch(() => {}); }}>
              <Icon name="check" size={20} color={settings.notifyAtTime ? t.primary : t.track} filled={settings.notifyAtTime} />
            </Pressable>
          }
        />
        <Divider />
        <Text style={{ color: t.text, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm }}>Remind me before prayer</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
          {[0, 5, 10, 15, 20, 30].map((m) => (
            <Chip
              key={m}
              small
              label={m === 0 ? 'Off' : `${m} min`}
              selected={settings.preMinutes === m}
              onPress={() => {
                updateSettings({ preMinutes: m });
                rescheduleAll().catch(() => {});
              }}
            />
          ))}
        </View>
        <Divider />
        <Row
          label="Play adhan automatically"
          sub="At prayer time while the app is open"
          right={
            <Pressable onPress={() => updateSettings({ autoPlayAdhan: !settings.autoPlayAdhan })}>
              <Icon name="check" size={20} color={settings.autoPlayAdhan ? t.primary : t.track} filled={settings.autoPlayAdhan} />
            </Pressable>
          }
        />
        <Divider />
        <Text style={{ color: t.text, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm }}>Adhan volume</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
          {[0.25, 0.5, 0.75, 1].map((v) => (
            <Chip
              key={v}
              small
              label={`${Math.round(v * 100)}%`}
              selected={Math.abs(settings.adhanVolume - v) < 0.01}
              onPress={() => updateSettings({ adhanVolume: v })}
            />
          ))}
        </View>
      </Card>

      <SectionTitle>Display</SectionTitle>
      <Card>
        <Text style={{ color: t.text, fontWeight: '700', marginBottom: Spacing.sm }}>Clock format</Text>
        <Segmented
          value={String(settings.timeFormat) as '12' | '24'}
          onChange={(v) => updateSettings({ timeFormat: v === '24' ? 24 : 12 })}
          options={[
            { value: '12', label: '12-hour' },
            { value: '24', label: '24-hour' },
          ]}
        />
        <Divider />
        <Text style={{ color: t.text, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm }}>Theme</Text>
        <Segmented
          value={settings.theme}
          onChange={(v) => updateSettings({ theme: v })}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
        />
        <Divider />
        <Text style={{ color: t.text, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm }}>Quran text size</Text>
        <Segmented
          value={String(settings.fontSize) as '17' | '19' | '21'}
          onChange={(v) => updateSettings({ fontSize: Number(v) as 17 | 19 | 21 })}
          options={[
            { value: '17', label: 'Small' },
            { value: '19', label: 'Medium' },
            { value: '21', label: 'Large' },
          ]}
        />
        <Divider />
        <Row
          label="Show English translation"
          right={
            <Pressable onPress={() => updateSettings({ showTranslation: !settings.showTranslation })}>
              <Icon name="check" size={20} color={settings.showTranslation ? t.primary : t.track} filled={settings.showTranslation} />
            </Pressable>
          }
        />
      </Card>

      <SectionTitle>Reading</SectionTitle>
      <Card>
        <Stepper
          label="Daily ayah goal"
          value={`${settings.readingGoal}`}
          onDec={() => updateSettings({ readingGoal: Math.max(1, settings.readingGoal - 5) })}
          onInc={() => updateSettings({ readingGoal: Math.min(300, settings.readingGoal + 5) })}
        />
      </Card>

      <SectionTitle>About</SectionTitle>
      <Card>
        <Row label="Sources & licenses" sub="Texts, translations and audio provenance" onPress={() => router.push('/licenses')} right={<Icon name="next" size={15} color={t.sub} />} />
        <Divider />
        <Row label="Battery optimization" sub="Keep adhan alarms exact on aggressive devices" onPress={() => {
          Alert.alert(
            'Keep adhan alarms exact',
            'Some Android devices (Xiaomi, Huawei, Samsung, Oppo…) delay background alarms to save battery.\n\n1. Open Android Settings → Apps → Noor → Battery.\n2. Set it to “Unrestricted”.\n3. In Settings → Apps → Special access → Alarms & reminders, allow Noor.\n\nNoor also uses exact alarms and re-registers its schedule after every restart.'
          );
        }} right={<Icon name="next" size={15} color={t.sub} />} />
        <Divider />
        <Sub style={{ marginTop: Spacing.md, fontSize: 12 }}>
          Noor v1.0.0 — fully offline prayer companion. No accounts, no tracking, no internet required.
        </Sub>
      </Card>
      <View style={{ height: 40 }} />
    </Screen>
  );
}
