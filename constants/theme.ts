/**
 * GemSpots Design System
 * Premium design tokens for a funded-startup quality app
 */

import { Platform } from 'react-native';

// ─── Semantic Color Palette ────────────────────────────────────────────────
export const Colors = {
  // Primary: Vibrant Violet for community/discovery
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',

  // Accent: Warm Amber for auth/actions
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#D97706',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Dark mode (deep purple-tinted)
  backgroundDark: '#0F0A1A',
  surfaceDark: '#1A1128',
  cardDark: '#1A1128',
  cardDarkElevated: '#261B38',
  borderDark: '#2E2145',
  textPrimaryDark: '#F1F5F9',
  textSecondaryDark: '#A5B4CB',
  textMutedDark: '#64748B',

  // Light mode (cool off-white with subtle violet warmth)
  backgroundLight: '#FAF7FF',
  surfaceLight: '#FFFFFF',
  cardLight: '#FFFFFF',
  cardLightElevated: '#F3EEFF',
  borderLight: 'rgba(124, 58, 237, 0.06)',
  textPrimaryLight: '#1A1033',
  textSecondaryLight: '#4A4458',
  textMutedLight: '#94A3B8',

  // Universal
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#7C3AED', '#5B21B6'] as const,
  gradientAccent: ['#F59E0B', '#D97706'] as const,
  gradientDark: ['#0F0A1A', '#1A1128'] as const,
  gradientCard: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.95)'] as const,
  gradientGem: ['#7C3AED', '#4C1D95'] as const,
  gradientFire: ['#EF4444', '#F59E0B'] as const,
  gradientGold: ['#F59E0B', '#EAB308', '#CA8A04'] as const,
  gradientSilver: ['#94A3B8', '#CBD5E1', '#94A3B8'] as const,
  gradientBronze: ['#D97706', '#B45309', '#D97706'] as const,

  // Tab bar (glassmorphism)
  tabBarDark: 'rgba(15, 10, 26, 0.95)',
  tabBarLight: 'rgba(255, 255, 255, 0.85)',
  tabActiveIndicator: '#7C3AED',
};

// ─── Theme Presets (for useColorScheme) ────────────────────────────────────
export const Theme = {
  light: {
    text: Colors.textPrimaryLight,
    textSecondary: Colors.textSecondaryLight,
    textMuted: Colors.textMutedLight,
    background: Colors.backgroundLight,
    surface: Colors.surfaceLight,
    card: Colors.cardLight,
    cardElevated: Colors.cardLightElevated,
    border: Colors.borderLight,
    tint: Colors.primary,
    icon: Colors.textSecondaryLight,
    tabIconDefault: Colors.textMutedLight,
    tabIconSelected: Colors.primary,
    tabBar: Colors.tabBarLight,
  },
  dark: {
    text: Colors.textPrimaryDark,
    textSecondary: Colors.textSecondaryDark,
    textMuted: Colors.textMutedDark,
    background: Colors.backgroundDark,
    surface: Colors.surfaceDark,
    card: Colors.cardDark,
    cardElevated: Colors.cardDarkElevated,
    border: Colors.borderDark,
    tint: Colors.primary,
    icon: Colors.textSecondaryDark,
    tabIconDefault: Colors.textMutedDark,
    tabIconSelected: Colors.primary,
    tabBar: Colors.tabBarDark,
  },
};

// ─── Spacing Scale ─────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ─── Border Radius Tokens ──────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

// ─── Typography Scale ──────────────────────────────────────────────────────
export const Typography = {
  screenTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    fontFamily: 'Inter_500Medium',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: '300' as const,
    fontFamily: 'Inter_300Light',
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
} as const;

// ─── Shadows (Apple-style soft shadows) ────────────────────────────────────
export const Shadows = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  xl: {
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
  // Apple-style card shadow
  apple: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
  },
  glow: (color: string) => ({
    elevation: 8,
    shadowColor: color,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  }),
};

// ─── Animation Constants ───────────────────────────────────────────────────
export const Animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  pressScale: 0.95,
  bounceScale: 1.15,
} as const;

// ─── Layout Constants ──────────────────────────────────────────────────────
export const Layout = {
  sectionSpacing: Spacing.lg,
  sectionPaddingBottom: Spacing.md,
  screenPadding: Spacing.md,
  cardGap: Spacing.sm,
  tabBarHeight: 80,
  headerHeight: 56,
  buttonHeight: 48,
  inputHeight: 48,
  chipHeight: 36,
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 64,
  avatarXl: 80,
} as const;

// ─── Fonts (for Expo Font loading) ─────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter_400Regular',
    serif: 'serif',
    rounded: 'Inter_400Regular',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Inter', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
