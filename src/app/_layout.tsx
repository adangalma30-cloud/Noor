import { Amiri_400Regular, Amiri_700Bold, useFonts } from '@expo-google-fonts/amiri';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { initAudio } from '../lib/audio';
import { loadLibrary } from '../lib/library';
import { configureNotificationHandler, rescheduleAll } from '../lib/schedule';
import { loadPersistedState, useSettings } from '../lib/store';
import { useTheme } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Amiri_400Regular, Amiri_700Bold });
  const [ready, setReady] = useState(false);
  const settings = useSettings();
  const t = useTheme();

  useEffect(() => {
    (async () => {
      try {
        configureNotificationHandler();
        await loadPersistedState();
        await loadLibrary();
        await initAudio();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Keep prayer alarms in sync with location/method/notification settings.
  useEffect(() => {
    if (!ready) return;
    rescheduleAll().catch(() => {});
  }, [ready, settings.lat, settings.lng, settings.method, settings.madhab, settings.preMinutes, settings.notifyAtTime]);

  useEffect(() => {
    if (fontsLoaded && ready) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, ready]);

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
      <StatusBar style={t.dark ? 'light' : 'dark'} />
    </>
  );
}
