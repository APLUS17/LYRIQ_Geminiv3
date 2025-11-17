// Spacing scale (8px base unit)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Border radius
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Touch targets (minimum 44pt per Apple HIG)
export const TOUCH_TARGET = {
  min: 44,
  comfortable: 48,
  large: 56,
} as const;

// Z-index layers
export const Z_INDEX = {
  base: 1,
  dropdown: 10,
  modal: 100,
  bottomSheet: 200,
  overlay: 500,
  toast: 1000,
} as const;
