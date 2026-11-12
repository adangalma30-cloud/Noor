import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const LOGO = require('../../assets/images/splash-icon.png');

/**
 * Branded splash shown as a JS overlay the moment the first frame renders
 * (the native splash hands over to it seamlessly — same background colour).
 * Purely decorative and timer-driven: it fades itself out and can never block
 * navigation or startup.
 */
export function AnimatedSplash({ onDone, holdMs = 1500 }: { onDone: () => void; holdMs?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const wordmark = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(false);

  useEffect(() => {
    const enter = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(wordmark, { toValue: 1, duration: 500, delay: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(barWidth, { toValue: 1, duration: 550, delay: 320, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]);

    const timers: ReturnType<typeof setTimeout>[] = [];
    enter.start();

    // Exit: fade the whole overlay out, then unmount via onDone.
    timers.push(
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 350,
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
          }, 600),
        );
      }, holdMs + 450),
    );

    return () => timers.forEach(clearTimeout);
  }, [holdMs, onDone, opacity, logoScale, wordmark, barWidth]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity }]}>
      <View style={styles.center}>
        <Animated.Image
          source={LOGO}
          resizeMode="contain"
          style={[styles.logo, { transform: [{ scale: logoScale }] }]}
        />
        <Animated.Text style={[styles.wordmark, { opacity: wordmark, transform: [{ translateY: wordmark.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
          NOOR
        </Animated.Text>
        <Animated.View
          style={[
            styles.bar,
            { width: barWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 148] }) },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#0B3D2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  logo: {
    width: 176,
    height: 176,
  },
  wordmark: {
    color: '#E8C463',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 8,
    marginTop: 18,
  },
  bar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E8C463',
    marginTop: 14,
    opacity: 0.85,
  },
});
