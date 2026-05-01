export type MusicTab = "player" | "search" | "queue" | "config";

export type RepeatMode = "off" | "all" | "one";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  thumbnail?: string;
  url?: string;
}

export interface QueueItem {
  uid: string;
  track: Track;
}

export interface MusicSettings {
  shuffle: boolean;
  crossfade: boolean;
  dark: boolean;
  repeat: RepeatMode;
  volume: number;
  autoplay: boolean;
}
