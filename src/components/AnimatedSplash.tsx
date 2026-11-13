import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ImageBackground, StyleSheet, Text, View } from 'react-native';

const MOSQUE = require('../../assets/images/splash-mosque.png');

const GOLD = '#E8C463';
const GOLD_SOFT = '#F0D896';
const CREAM = '#F5EFE0';
const EMERALD = '#0B3D2E';

/**
 * Islamic splash: Bismillah calligraphy (real Arabic text in the bundled Amiri
 * font — never baked into an image), transliteration and meaning, a golden
 * mosque scene, then the NOOR wordmark and tagline, with staggered fade-ins.
 *
 * Purely decorative and timer-driven: it fades itself out and can never block
 * navigation or startup. If any font or image fails to load the plain system
 * fallbacks still render — the app always opens.
 */
export function AnimatedSplash({ onDone, holdMs = 1600 }: { onDone: () => void; holdMs?: number }) {
  const root = useRef(new Animated.Value(0)).current;
  const art = useRef(new Animated.Value(0)).current;
  const bismillah = useRef(new Animated.Value(0)).current;
  const translit = useRef(new Animated.Value(0)).current;
  const meaning = useRef(new Animated.Value(0)).current;
  const wordmark = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(false);

  useEffect(() => {
    const rise = (v: Animated.Value, delay: number, duration = 550) =>
      Animated.timing(v, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });

    const enter = Animated.parallel([
      Animated.timing(root, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      rise(art, 120, 700),
      rise(bismillah, 260),
      rise(translit, 480),
      rise(meaning, 640),
      rise(wordmark, 860),
      rise(tagline, 1020),
      Animated.timing(barWidth, {
        toValue: 1,
        duration: 550,
        delay: 1120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);

    const timers: ReturnType<typeof setTimeout>[] = [];
    enter.start();

    // Exit: fade the whole overlay out, then unmount via onDone.
    timers.push(
      setTimeout(() => {
        Animated.timing(root, {
          toValue: 0,
          duration: 380,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished && !doneRef.current) {
            doneRef.current = true;
            onDone();
          }
        });
        // Belt-and-braces: never linger even if the animation callback fails.
        timers.push(
          setTimeout(() => {
            if (!doneRef.current) {
              doneRef.current = true;
              onDone();
            }
          }, 650),
        );
      }, holdMs + 700),
    );

    return () => timers.forEach(clearTimeout);
  }, [holdMs, onDone, root, art, bismillah, translit, meaning, wordmark, tagline, barWidth]);

  const rise = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: root }]}>
      <ImageBackground source={MOSQUE} resizeMode="cover" style={StyleSheet.absoluteFill} imageStyle={styles.art}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.artTint, { opacity: art }]} />

        <View style={styles.top}>
          {/* Real Arabic text rendered with the bundled Amiri font — no image calligraphy. */}
          <Animated.Text
            style={[styles.bismillah, rise(bismillah)]}
            numberOfLines={1}
            allowFontScaling={false}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Animated.Text>
          <Animated.Text style={[styles.translit, rise(translit)]} numberOfLines={1} allowFontScaling={false}>
            Bismillāhir-Raḥmānir-Raḥīm
          </Animated.Text>
          <Animated.Text style={[styles.meaning, rise(meaning)]} numberOfLines={2} allowFontScaling={false}>
            In the name of Allah, the Most Compassionate, the Most Merciful.
          </Animated.Text>
        </View>

        <View style={styles.bottom}>
          <Animated.Text style={[styles.wordmark, rise(wordmark)]} allowFontScaling={false}>
            NOOR
          </Animated.Text>
          <Animated.Text style={[styles.tagline, rise(tagline)]} allowFontScaling={false}>
            Your Daily Prayer Companion
          </Animated.Text>
          <Animated.View
            style={[
              styles.bar,
              { width: barWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 148] }) },
            ]}
          />
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: EMERALD,
  },
  art: {
    backgroundColor: EMERALD,
  },
  artTint: {
    backgroundColor: 'transparent',
  },
  top: {
    alignItems: 'center',
    paddingTop: 72,
    paddingHorizontal: 28,
  },
  bismillah: {
    fontFamily: 'Amiri_700Bold',
    color: GOLD,
    fontSize: 34,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  translit: {
    color: GOLD_SOFT,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 12,
    textAlign: 'center',
  },
  meaning: {
    color: CREAM,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.95,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 64,
    alignItems: 'center',
  },
  wordmark: {
    color: GOLD,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 10,
  },
  tagline: {
    color: CREAM,
    fontSize: 13,
    letterSpacing: 1.2,
    marginTop: 10,
    opacity: 0.92,
  },
  bar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginTop: 16,
    opacity: 0.85,
  },
});
