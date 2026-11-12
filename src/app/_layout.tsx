import { Amiri_400Regular, Amiri_700Bold, useFonts } from '@expo-google-fonts/amiri';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { initAudio } from '../lib/audio';
import { loadLibrary } from '../lib/library';
import { configureNotificationHandler, rescheduleAll } from '../lib/schedule';
import { runEssentialStartup } from '../lib/startup';
import { useSettings } from '../lib/store';
import { Radius, Spacing, useTheme } from '../theme';
import { AnimatedSplash } from '../components/AnimatedSplash';

// The native splash is deliberately NOT held with preventAutoHideAsync: it
// hands over to the animated JS splash on the first rendered frame and can
// therefore never get stuck. This call is pure insurance in case any module
// ever prevents auto-hide; a timer releases it unconditionally.
SplashScreen.hideAsync().catch(() => {});
setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 2500);

/** Absolute cap on how long the native splash may stay up, whatever happens. */
const SPLASH_FALLBACK_MS = 4000;

type Phase = 'loading' | 'ready' | 'error';

export default function RootLayout() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [attempt, setAttempt] = useState(0);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [splashDone, setSplashDone] = useState(false);
  const settings = useSettings();
  const t = useTheme();

  // Amiri is embedded natively (expo-font config plugin) and is never a gate:
  // this runtime load only improves the iOS family-name mapping, and a failure
  // falls back to system fonts instead of blocking the dashboard.
  useFonts({ Amiri_400Regular, Amiri_700Bold });

  // 1. Essential startup: saved settings only, with a hard timeout. Optional
  //    services (audio mode, imported library, notifications) start afterwards
  //    and can never block the dashboard.
  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    setStartupError(null);

    configureNotificationHandler();

    (async () => {
      let error: string | null = null;
      try {
        await runEssentialStartup();
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
      if (cancelled) return;
      if (error) {
        setStartupError(error);
        setPhase('error');
      } else {
        setPhase('ready');
        loadLibrary().catch(() => {});
        initAudio().catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // 2. Hide the splash as soon as startup settles (success OR error screen).
  useEffect(() => {
    if (phase !== 'loading') SplashScreen.hideAsync().catch(() => {});
  }, [phase]);

  // 3. Failsafe: whatever happens above, the splash must not outlive this.
  useEffect(() => {
    const id = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), SPLASH_FALLBACK_MS);
    return () => clearTimeout(id);
  }, []);

  // Keep prayer alarms in sync with location/method/notification settings.
  useEffect(() => {
    if (phase !== 'ready') return;
    rescheduleAll().catch(() => {});
  }, [phase, settings.lat, settings.lng, settings.method, settings.madhab, settings.preMinutes, settings.notifyAtTime]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  if (phase === 'error') {
    return (
      <>
        <StartupErrorScreen message={startupError ?? 'Unknown startup error'} onRetry={retry} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.primary,
          headerTitleStyle: { fontWeight: '700', color: t.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="surah/[id]" options={{ title: 'Quran' }} />
        <Stack.Screen name="city-picker" options={{ title: 'Choose a city', presentation: 'modal' }} />
        <Stack.Screen name="tasbeeh" options={{ title: 'Tasbeeh' }} />
        <Stack.Screen name="qibla" options={{ title: 'Qibla' }} />
        <Stack.Screen name="calendar" options={{ title: 'Hijri Calendar' }} />
        <Stack.Screen name="adhkar" options={{ title: 'Adhkar' }} />
        <Stack.Screen name="duas" options={{ title: 'Daily Duas' }} />
        <Stack.Screen name="names" options={{ title: '99 Names of Allah' }} />
        <Stack.Screen name="tracker" options={{ title: 'Prayer Tracker' }} />
        <Stack.Screen name="licenses" options={{ title: 'Sources & Licenses' }} />
      </Stack>
      {!splashDone && <AnimatedSplash onDone={() => setSplashDone(true)} />}
      <StatusBar style={t.dark ? 'light' : 'dark'} />
    </>
  );
}

/** Shown only if startup genuinely fails — always offers a way forward. */
function StartupErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0B3D2E',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
      }}
    >
      <Text style={{ color: '#E8C463', fontSize: 28, fontWeight: '800', letterSpacing: 2 }}>NOOR</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: Spacing.xl, textAlign: 'center' }}>
        NOOR could not finish starting up
      </Text>
      <Text style={{ color: '#D8E8E0', fontSize: 14, marginTop: Spacing.md, textAlign: 'center', lineHeight: 21 }}>
        {message}
      </Text>
      <Text style={{ color: '#93A89E', fontSize: 13, marginTop: Spacing.md, textAlign: 'center', lineHeight: 19 }}>
        Your saved data is untouched and everything works offline. Tap Retry, or restart the app.
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={{
          marginTop: Spacing.xxl,
          backgroundColor: '#E8C463',
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: Radius.pill,
        }}
      >
        <Text style={{ color: '#0B3D2E', fontWeight: '800', fontSize: 16 }}>Retry</Text>
      </Pressable>
    </View>
  );
}
