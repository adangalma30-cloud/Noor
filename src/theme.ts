import { useColorScheme } from 'react-native';
import { useSettings } from './lib/store';

export interface ThemeColors {
  dark: boolean;
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  sub: string;
  border: string;
  primary: string;
  onPrimary: string;
  accent: string;
  gold: string;
  goldSoft: string;
  danger: string;
  track: string;
  overlay: string;
}

const light: ThemeColors = {
  dark: false,
  bg: '#F5F2EA',
  card: '#FFFFFF',
  cardAlt: '#EFEBDE',
  text: '#15251E',
  sub: '#5F6F67',
  border: '#E4DECD',
  primary: '#0E5A44',
  onPrimary: '#FFFFFF',
  accent: '#128C6E',
  gold: '#A87B21',
  goldSoft: '#F2E7C6',
  danger: '#A9432E',
  track: '#E0D9C6',
  overlay: 'rgba(11,61,46,0.06)',
};

const dark: ThemeColors = {
  dark: true,
  bg: '#071A14',
  card: '#0E271F',
  cardAlt: '#12312A',
  text: '#ECF3EE',
  sub: '#93A89E',
  border: '#1D3B31',
  primary: '#1DB98A',
  onPrimary: '#04140E',
  accent: '#2CC295',
  gold: '#E8C463',
  goldSoft: '#2E2A15',
  danger: '#D96C55',
  track: '#1D3B31',
  overlay: 'rgba(255,255,255,0.05)',
};

export const Palettes = { light, dark };

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  const { theme } = useSettings();
  const mode = theme === 'system' ? (scheme ?? 'light') : theme;
  return mode === 'dark' ? dark : light;
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = { sm: 10, md: 16, lg: 22, pill: 999 };

export const Fonts = {
  arabic: 'Amiri_400Regular',
  arabicBold: 'Amiri_700Bold',
};

export function arabicStyle(size: number, color: string, bold = false) {
  return {
    fontFamily: bold ? Fonts.arabicBold : Fonts.arabic,
    fontSize: size,
    color,
    writingDirection: 'rtl' as const,
    textAlign: 'right' as const,
  };
}
