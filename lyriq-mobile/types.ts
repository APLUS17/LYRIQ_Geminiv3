// Data models for Lyriq mobile app

export interface AudioTake {
  id: string;
  url: string; // For expo-av playback (local URI or base64 data URI)
  data: string; // base64 encoded audio data for persistence
  mimeType: string;
  duration: number; // in seconds
  timestamp: number;
}

export interface Lyric {
  id: string;
  text: string; // Plain text in mobile (no HTML/rich text like web version)
}

export interface Section {
  id: string;
  title: string;
  lyrics: Lyric[];
  takes: AudioTake[];
}

export interface Song {
  sections: Section[];
}

export interface MasterBeat {
  url: string;
  uri: string; // File system URI
  duration: number;
  fileName: string;
}

// UI State types
export interface RecordingState {
  status: 'idle' | 'recording';
  targetSectionId: string | null;
  startTime: number | null;
}

export interface PlayerState {
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTime: number; // in seconds
  duration: number; // in seconds
}
