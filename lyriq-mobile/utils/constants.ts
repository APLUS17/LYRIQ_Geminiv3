export const APP_CONFIG = {
  name: 'Lyriq',
  version: '1.0.0',
  autoSaveInterval: 10000, // 10 seconds
} as const;

export const AUDIO_CONFIG = {
  sampleRate: 44100,
  channels: 2,
  bitrate: 128000,
  fileExtension: 'mp3',
  mimeType: 'audio/mp3',
} as const;

export const GESTURE_CONFIG = {
  swipeThreshold: 80, // pixels
  longPressDuration: 300, // milliseconds
  deleteAnimationDuration: 500, // milliseconds
} as const;

export const WAVEFORM_CONFIG = {
  barWidth: 2,
  barGap: 1,
  height: 64,
  backgroundColor: 'rgb(107, 114, 128)', // gray
  progressColor: 'rgb(250, 204, 21)', // yellow
  playheadColor: 'rgb(250, 204, 21)', // yellow
} as const;

export const SECTION_TYPES = [
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Bridge',
  'Outro',
  'Hook',
  'Refrain',
  'Instrumental',
  'Ad-lib',
] as const;

export type SectionType = typeof SECTION_TYPES[number];
