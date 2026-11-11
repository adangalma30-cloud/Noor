import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { CountdownDigits, CountdownRing } from '../../components/CountdownRing';
import { Card, Icon, SectionTitle, Sub } from '../../components/ui';
import { DAILY_REMINDERS } from '../../data/duas';
import { playAdhan, stopAudio } from '../../lib/audio';
import { formatHijri, formatHijriAr, toHijri, weekdayName } from '../../lib/hijri';
import {
  addDays,
  countdownParts,
  dayKey,
  formatTime,
  nextPrayer,
  timesFor,
} from '../../lib/prayer';
import { adhanForPrayer } from '../../lib/schedule';
import { findTrack } from '../../lib/library';
import { logPrayer, updateSettings, useProgress, useSettings } from '../../lib/store';
import { PRAYER_KEYS, PRAYER_NAMES, type PrayerKey } from '../../types';
import { Radius, Spacing, arabicStyle, useTheme } from '../../theme';

function HeaderDecor() {
  return (
    <Svg width={400} height={200} viewBox="0 0 400 200" style={{ position: 'absolute', right: -40, top: 0, opacity: 0.16 }}>
      <Circle cx={320} cy={60} r={34} fill="#F0D078" />
      <Path d="M336 44a30 30 0 1 0 0 32 26 26 0 1 1 0-32z" fill="#0B3D2E" />
      <Path d="M60 200v-70a26 26 0 0 1 52 0v70z" fill="#F0D078" />
      <Path d="M150 200v-95a34 34 0 0 1 68 0v95z" fill="#F0D078" />
      <Path d="M250 200v-70a26 26 0 0 1 52 0v70z" fill="#F0D078" />
      <Path d="M40 130l10-22 10 22zM168 105l12-26 12 26zM268 130l10-22 10 22z" fill="#F0D078" />
    </Svg>
  );
}

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const progress = useProgress();
  const [now, setNow] = useState(() => new Date());
  const firedRef = useRef<string>('');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const times = useMemo(() => timesFor(now, settings), [now.getMinutes(), settings.lat, settings.lng, settings.method, settings.madhab]);
  const tomorrow = useMemo(() => timesFor(addDays(now, 1), settings), [now.getDate(), settings.lat, settings.lng, settings.method, settings.madhab]);
  const next = nextPrayer(now, times, tomorrow);
  const cd = countdownParts(now, next.at);
  const hijri = toHijri(now, settings.hijriAdjust);

  // Interval progress for the ring
  const intervalMs = next.at.getTime() - next.currentAt.getTime();
  const elapsed = now.getTime() - next.currentAt.getTime();
  const ringProgress = intervalMs > 0 ? elapsed / intervalMs : 0;

  // Play the assigned adhan at prayer time while the app is open.
  useEffect(() => {
    if (!settings.autoPlayAdhan) return;
    for (const key of PRAYER_KEYS) {
      const at = times[key];
      const diff = now.getTime() - at.getTime();
      const id = `${dayKey(at)}-${key}`;
      if (diff >= 0 && diff < 15000 && firedRef.current !== id && settings.notifyPerPrayer[key]) {
        firedRef.current = id;
        const track = findTrack(adhanForPrayer(key));
        if (track) playAdhan(track, settings.adhanVolume);
      }
    }
  }, [now.getTime()]);

  const todayKey = dayKey(now);
  const todayTracker = progress.tracker[todayKey] ?? {};
  const readToday = progress.readingLog[todayKey] ?? 0;
  const reminder = DAILY_REMINDERS[now.getDate() % DAILY_REMINDERS.length];

  const quickActions: { icon: string; label: string; href: string }[] = [
    { icon: 'book', label: 'Quran', href: '/quran' },
    { icon: 'megaphone', label: 'Adhan', href: '/adhan' },
    { icon: 'hands', label: 'Tasbeeh', href: '/tasbeeh' },
    { icon: 'compass', label: 'Qibla', href: '/qibla' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[t.dark ? '#0B3D2E' : '#0B3D2E', t.dark ? '#123F30' : '#12684F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxl, paddingHorizontal: Spacing.lg, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' }}
        >
          <HeaderDecor />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: '#F0D078', fontSize: 13, fontWeight: '800', letterSpacing: 1.4 }}>NOOR</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginTop: 2 }}>
                {weekdayName(now)}, {now.getDate()}/{now.getMonth() + 1}/{now.getFullYear()}
              </Text>
              <Text style={{ color: '#D8E8E0', fontSize: 13, marginTop: 2 }}>
                {formatHijri(hijri)} · {formatHijriAr(hijri, false)}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/city-picker')}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill }}
            >
              <Icon name="location" size={15} color="#F0D078" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', marginLeft: 6, fontSize: 12.5 }}>{settings.label}</Text>
            </Pressable>
          </View>

          <View style={{ alignItems: 'center', marginTop: Spacing.xl }}>
            <CountdownRing progress={ringProgress} size={184}>
              <Text style={{ color: '#D8E8E0', fontSize: 12.5, fontWeight: '700', letterSpacing: 1 }}>
                {(PRAYER_NAMES[next.key as PrayerKey] ?? { en: 'Sunrise' }).en.toUpperCase()} IN
              </Text>
              <CountdownDigits h={cd.h} m={cd.m} s={cd.s} color="#FFFFFF" />
              <Text style={{ color: '#F0D078', fontSize: 12.5, fontWeight: '700' }}>
                at {formatTime(next.at, settings.timeFormat)}
              </Text>
            </CountdownRing>
            <Text style={{ color: '#D8E8E0', marginTop: Spacing.md, fontSize: 13.5 }}>
              Now: {(PRAYER_NAMES[next.current as PrayerKey] ?? { en: 'Night' }).en} · since {formatTime(next.currentAt, settings.timeFormat)}
            </Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: Spacing.lg, marginTop: -Spacing.xl }}>
          <Card style={{ paddingVertical: Spacing.sm }}>
            {PRAYER_KEYS.map((key, i) => {
              const at = times[key];
              const isNext = next.key === key;
              const done = todayTracker[key];
              return (
                <View key={key}>
                  {i > 0 && <View style={{ height: 1, backgroundColor: t.border, opacity: 0.6 }} />}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13 }}>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: isNext ? t.goldSoft : t.overlay,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ ...arabicStyle(16, isNext ? t.gold : t.sub, true), textAlign: 'center' }}>
                        {PRAYER_NAMES[key].ar}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <Text style={{ color: t.text, fontWeight: '700', fontSize: 15.5 }}>{PRAYER_NAMES[key].en}</Text>
                      <Text style={{ color: t.sub, fontSize: 12 }}>
                        {done ? 'Prayed ✓' : isNext ? 'Next prayer' : ' '}
                      </Text>
                    </View>
                    <Text style={{ color: isNext ? t.gold : t.text, fontWeight: '800', fontSize: 15.5, fontVariant: ['tabular-nums'] }}>
                      {formatTime(at, settings.timeFormat)}
                    </Text>
                    <Pressable
                      onPress={() => {
                        updateSettings({
                          notifyPerPrayer: { ...settings.notifyPerPrayer, [key]: !settings.notifyPerPrayer[key] },
                        });
                      }}
                      hitSlop={10}
                      style={{ marginLeft: Spacing.md }}
                    >
                      <Icon name="megaphone" size={19} color={settings.notifyPerPrayer[key] ? t.primary : t.track} filled={settings.notifyPerPrayer[key]} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
              <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="clock" size={18} color={t.sub} />
              </View>
              <Text style={{ color: t.sub, fontSize: 13, marginLeft: Spacing.md, flex: 1 }}>Sunrise (no prayer)</Text>
              <Text style={{ color: t.sub, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
                {formatTime(times.sunrise, settings.timeFormat)}
              </Text>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: Spacing.lg }}>
          <SectionTitle>Quick access</SectionTitle>
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            {quickActions.map((a) => (
              <Pressable
                key={a.label}
                onPress={() => router.push(a.href as never)}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: t.card,
                  borderRadius: Radius.lg,
                  borderWidth: 1,
                  borderColor: t.border,
                  paddingVertical: Spacing.lg,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={a.icon} size={21} color={t.gold} />
                </View>
                <Text style={{ color: t.text, fontWeight: '700', marginTop: 8, fontSize: 12.5 }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          <SectionTitle>Today</SectionTitle>
          <Card>
            <Text style={{ ...arabicStyle(21, t.text), lineHeight: 40 }}>{reminder.ar}</Text>
            <Text style={{ color: t.sub, fontSize: 13.5, marginTop: Spacing.sm, lineHeight: 20 }}>{reminder.en}</Text>
            <Text style={{ color: t.gold, fontSize: 11.5, marginTop: Spacing.sm, fontWeight: '700' }}>{reminder.ref}</Text>
          </Card>

          <SectionTitle>Reading progress</SectionTitle>
          <Card onPress={() => (progress.lastRead ? router.push(`/surah/${progress.lastRead.surah}`) : router.push('/quran'))}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: t.overlay, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="book" size={22} color={t.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>
                  {readToday >= settings.readingGoal
                    ? 'Daily goal complete — alhamdulillah!'
                    : progress.lastRead
                      ? `Continue Surah ${progress.lastRead.surah}, verse ${progress.lastRead.ayah}`
                      : 'Start your daily Quran reading'}
                </Text>
                <Sub>
                  {readToday} of {settings.readingGoal} ayahs today
                </Sub>
                <View style={{ height: 6, backgroundColor: t.track, borderRadius: 3, marginTop: 8 }}>
                  <View
                    style={{
                      height: 6,
                      width: `${Math.min(100, (readToday / Math.max(1, settings.readingGoal)) * 100)}%`,
                      backgroundColor: t.gold,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            </View>
          </Card>

          <SectionTitle>More</SectionTitle>
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            {[
              { icon: 'moon', label: 'Adhkar', href: '/adhkar' },
              { icon: 'star', label: 'Duas', href: '/duas' },
              { icon: 'calendar', label: 'Calendar', href: '/calendar' },
              { icon: 'check', label: 'Tracker', href: '/tracker' },
            ].map((a) => (
              <Pressable
                key={a.label}
                onPress={() => router.push(a.href as never)}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: t.card,
                  borderRadius: Radius.md,
                  borderWidth: 1,
                  borderColor: t.border,
                  paddingVertical: Spacing.md,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Icon name={a.icon} size={19} color={t.accent} />
                <Text style={{ color: t.text, fontWeight: '600', marginTop: 6, fontSize: 11.5 }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
