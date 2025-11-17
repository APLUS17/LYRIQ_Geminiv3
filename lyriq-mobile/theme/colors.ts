import { Platform } from 'react-native';

type PlatformType = 'ios' | 'android' | 'web';

// Platform detection
const getPlatform = (): PlatformType => {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
};

// Platform-specific color definitions
const platformColors = {
  ios: {
    accent: 'rgb(0, 123, 255)',
    destructive: 'rgb(254, 67, 54)',
  },
  android: {
    accent: 'rgb(43, 145, 255)',
    destructive: 'rgb(147, 0, 10)',
  },
  web: {
    accent: 'rgb(40, 144, 255)',
    destructive: 'rgb(147, 0, 10)',
  },
};

// Shared colors across all platforms
const sharedColors = {
  // Backgrounds
  backgroundPrimary: 'rgb(0, 2, 5)', // Deepest dark, OLED-friendly
  backgroundSecondary: 'rgb(18, 29, 42)', // Modals, cards, elevated surfaces

  // Text
  textPrimary: 'rgb(246, 250, 255)', // Brightest text, maximum contrast
  textSecondary: 'rgb(156, 160, 165)', // Slightly muted, secondary info

  // Borders and dividers
  border: 'rgb(55, 63, 71)',

  // Grey palette for hierarchy
  grey: 'rgb(156, 160, 165)',
  grey2: 'rgb(142, 146, 151)',
  grey3: 'rgb(128, 132, 137)',
  grey4: 'rgb(114, 118, 123)',
  grey5: 'rgb(100, 104, 109)',
  grey6: 'rgb(86, 90, 95)',

  // Status colors
  success: 'rgb(52, 199, 89)',
  warning: 'rgb(255, 204, 0)',
  error: 'rgb(255, 59, 48)',

  // Special
  recording: 'rgb(220, 38, 38)', // Red for recording indicator
  waveformPlayed: 'rgb(250, 204, 21)', // Yellow for waveform progress
  waveformUnplayed: 'rgb(107, 114, 128)', // Gray for unplayed waveform
};

// Get platform-specific colors
const platform = getPlatform();
const platformSpecific = platformColors[platform];

// Export complete color palette
export const COLORS = {
  ...sharedColors,
  ...platformSpecific,

  // Convenience aliases
  background: sharedColors.backgroundPrimary,
  surface: sharedColors.backgroundSecondary,
  text: sharedColors.textPrimary,
  textMuted: sharedColors.textSecondary,

  // Platform info
  platform,
} as const;

export type ColorKey = keyof typeof COLORS;
