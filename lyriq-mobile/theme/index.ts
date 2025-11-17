export * from './colors';
export * from './typography';
export * from './spacing';

import { COLORS } from './colors';
import { FONTS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TEXT_STYLES } from './typography';
import { SPACING, RADIUS, TOUCH_TARGET, Z_INDEX } from './spacing';

export const theme = {
  colors: COLORS,
  fonts: FONTS,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  lineHeights: LINE_HEIGHTS,
  textStyles: TEXT_STYLES,
  spacing: SPACING,
  radius: RADIUS,
  touchTarget: TOUCH_TARGET,
  zIndex: Z_INDEX,
} as const;

export type Theme = typeof theme;
