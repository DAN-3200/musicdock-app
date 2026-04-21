import { atom } from "jotai";
import type { MusicSettings, MusicTab, QueueItem, Track } from "./types";
import { CATALOG } from "../infra/catalog";

let uidCounter = 0;
export const makeUid = (trackId: string) =>
  `q-${Date.now().toString(36)}-${uidCounter++}-${trackId}`;

const initialQueue = (): QueueItem[] =>
  CATALOG.slice(0, 4).map((t, i) => ({ uid: `q-init-${i}-${t.id}`, track: t }));

export const DEFAULT_SETTINGS: MusicSettings = {
  volume: 70,
  shuffle: false,
  repeat: "off",
  crossfade: false,
  dark: false,
};

// ---------- Primitive atoms ----------
export const tabAtom = atom<MusicTab>("player");
export const queueAtom = atom<QueueItem[]>(initialQueue());
export const currentIndexAtom = atom(0);
export const positionAtom = atom(0);
export const isPlayingAtom = atom(false);
export const settingsAtom = atom<MusicSettings>(DEFAULT_SETTINGS);

// Search state
export const searchQueryAtom = atom("");
export const searchSubmittedAtom = atom(""); // last query submitted via Enter
export const suggestionsAtom = atom<Track[]>([]);
export const searchResultsAtom = atom<Track[]>([]);
export const isSearchingAtom = atom(false);

// ---------- Derived atoms ----------
export const safeIndexAtom = atom((get) => {
  const q = get(queueAtom);
  const i = get(currentIndexAtom);
  return Math.min(i, Math.max(0, q.length - 1));
});

export const currentTrackAtom = atom<Track>((get) => {
  const q = get(queueAtom);
  const i = get(safeIndexAtom);
  return q[i]?.track ?? CATALOG[0];
});

export const currentUidAtom = atom<string | undefined>((get) => {
  const q = get(queueAtom);
  const i = get(safeIndexAtom);
  return q[i]?.uid;
});

export const progressAtom = atom((get) => {
  const t = get(currentTrackAtom);
  const p = get(positionAtom);
  return t.duration > 0 ? p / t.duration : 0;
});

export const queueTrackIdsAtom = atom((get) =>
  get(queueAtom).map((it) => it.track.id)
);
