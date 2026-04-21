export type MusicTab = "player" | "search" | "queue" | "config";

export type RepeatMode = "off" | "all" | "one";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
}

export interface QueueItem {
  uid: string;
  track: Track;
}

export interface MusicSettings {
  volume: number; // 0..100
  shuffle: boolean;
  repeat: RepeatMode;
  crossfade: boolean;
  dark: boolean;
}
