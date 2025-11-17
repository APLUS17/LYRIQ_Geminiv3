/**
 * Icon components for Lyriq mobile app
 * Using React Native's built-in SVG support via react-native-svg
 */

import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { COLORS } from '../theme';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// Play Icon
export const PlayIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M8 5v14l11-7z" />
  </Svg>
);

// Pause Icon
export const PauseIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </Svg>
);

// Microphone Icon
export const MicrophoneIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <Line x1="12" y1="19" x2="12" y2="23" />
    <Line x1="8" y1="23" x2="16" y2="23" />
  </Svg>
);

// Trash Icon
export const TrashIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
);

// Plus Icon
export const PlusIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

// Next Icon
export const NextIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M6 4l12 8-12 8V4zm13 0v16h2V4h-2z" />
  </Svg>
);

// Previous Icon
export const PreviousIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M18 4v16l-12-8 12-8zM5 4h2v16H5V4z" />
  </Svg>
);

// Check Icon
export const CheckIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Music Note Icon
export const MusicNoteIcon: React.FC<IconProps> = ({ size = 16, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
  </Svg>
);

// Gemini/AI Icon
export const GeminiIcon: React.FC<IconProps> = ({ size = 16, color = COLORS.accent }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
  </Svg>
);

// Settings Icon
export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
  </Svg>
);

// Close/X Icon
export const CloseIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <Line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </Svg>
);

// Syllable Count Icon
export const SyllableCountIcon: React.FC<IconProps & { active?: boolean }> = ({
  size = 24,
  color,
  active = false
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color || (active ? COLORS.accent : COLORS.textSecondary)}
    strokeWidth="2"
  >
    <Path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
  </Svg>
);

// Chevron Down Icon
export const ChevronDownIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Chevron Up Icon
export const ChevronUpIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
