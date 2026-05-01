import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { MusicTab, MusicSettings, QueueItem, Track, RepeatMode } from "./types";
import { uid } from "./utils";
import { SAMPLE_TRACKS, SUGGESTIONS } from "./sampleData";

interface MusicContextValue {
  // Navigation
  tab: MusicTab;
  setTab: (t: MusicTab) => void;

  // Settings
  settings: MusicSettings;
  setSettings: (partial: Partial<MusicSettings>) => void;

  // Queue
  queue: QueueItem[];
  currentUid: string | null;
  current: QueueItem | null;
  addToQueue: (track: Track) => void;
  playQueueItem: (uid: string) => void;
  removeFromQueue: (uid: string) => void;
  clearQueue: () => void;

  // Player
  isPlaying: boolean;
  progress: number;
  position: number;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (ratio: number) => void;
  cycleRepeat: () => void;

  // Search
  query: string;
  setQuery: (q: string) => void;
  submittedQuery: string;
  isSearching: boolean;
  searchResults: Track[];
  suggestions: Track[];
  liveResults: Track[];
  submitSearch: () => void;
  clearSearch: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusicContext() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicContext must be used within MusicProvider");
  return ctx;
}

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [tab, setTab] = useState<MusicTab>("player");

  // Settings
  const [settings, setSettingsRaw] = useState<MusicSettings>({
    shuffle: false,
    crossfade: false,
    dark: false,
    repeat: "off",
    volume: 75,
    autoplay: true,
  });
  const setSettings = useCallback((partial: Partial<MusicSettings>) => {
    setSettingsRaw((prev) => ({ ...prev, ...partial }));
  }, []);

  // Queue
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const current = useMemo(() => queue.find((q) => q.uid === currentUid) ?? null, [queue, currentUid]);

  // Player
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [position, setPosition] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const posRef = useRef(0);

  useEffect(() => { posRef.current = position; }, [position]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isPlaying && current) {
      intervalRef.current = setInterval(() => {
        const next = posRef.current + 0.5;
        if (next >= current.track.duration) {
          const idx = queue.findIndex((q) => q.uid === currentUid);
          if (idx < queue.length - 1) {
            setCurrentUid(queue[idx + 1].uid);
            setPosition(0); setProgress(0);
          } else if (settings.repeat === "all" && queue.length > 0) {
            setCurrentUid(queue[0].uid);
            setPosition(0); setProgress(0);
          } else if (settings.repeat === "one") {
            setPosition(0); setProgress(0);
          } else {
            setIsPlaying(false);
          }
          return;
        }
        posRef.current = next;
        setPosition(next);
        setProgress(next / current.track.duration);
      }, 500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentUid, current?.track.duration, settings.repeat, queue]);

  const toggle = useCallback(() => {
    if (!current && queue.length > 0) {
      setCurrentUid(queue[0].uid);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  }, [current, queue]);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => {
      if (prev.some((q) => q.track.id === track.id)) return prev;
      const item: QueueItem = { uid: uid(), track };
      if (!currentUid) {
        setCurrentUid(item.uid);
        if (settings.autoplay) setIsPlaying(true);
      }
      return [...prev, item];
    });
  }, [currentUid, settings.autoplay]);

  const playQueueItem = useCallback((itemUid: string) => {
    setCurrentUid(itemUid);
    setPosition(0); setProgress(0);
    setIsPlaying(true);
  }, []);

  const removeFromQueue = useCallback((itemUid: string) => {
    setQueue((prev) => prev.filter((q) => q.uid !== itemUid));
    if (currentUid === itemUid) {
      setCurrentUid(null); setIsPlaying(false);
      setPosition(0); setProgress(0);
    }
  }, [currentUid]);

  const clearQueue = useCallback(() => {
    setQueue([]); setCurrentUid(null); setIsPlaying(false);
    setPosition(0); setProgress(0);
  }, []);

  const next = useCallback(() => {
    const idx = queue.findIndex((q) => q.uid === currentUid);
    if (idx < queue.length - 1) playQueueItem(queue[idx + 1].uid);
    else if (settings.repeat === "all" && queue.length > 0) playQueueItem(queue[0].uid);
  }, [queue, currentUid, settings.repeat, playQueueItem]);

  const prev = useCallback(() => {
    const idx = queue.findIndex((q) => q.uid === currentUid);
    if (idx > 0) playQueueItem(queue[idx - 1].uid);
  }, [queue, currentUid, playQueueItem]);

  const seek = useCallback((ratio: number) => {
    if (!current) return;
    const newPos = ratio * current.track.duration;
    setPosition(newPos); setProgress(ratio);
    posRef.current = newPos;
  }, [current]);

  const cycleRepeat = useCallback(() => {
    const order: RepeatMode[] = ["off", "all", "one"];
    const idx = order.indexOf(settings.repeat);
    setSettings({ repeat: order[(idx + 1) % order.length] });
  }, [settings.repeat, setSettings]);

  // Search
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  const liveResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SAMPLE_TRACKS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q)
    );
  }, [query]);

  const submitSearch = useCallback(() => {
    if (!query.trim()) return;
    setSubmittedQuery(query);
    setIsSearching(true);
    setTimeout(() => {
      const q = query.toLowerCase();
      setSearchResults(SAMPLE_TRACKS.filter(
        (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q)
      ));
      setIsSearching(false);
    }, 300);
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery(""); setSubmittedQuery(""); setSearchResults([]);
  }, []);

  const value: MusicContextValue = {
    tab, setTab, settings, setSettings,
    queue, currentUid, current, addToQueue, playQueueItem, removeFromQueue, clearQueue,
    isPlaying, progress, position, toggle, next, prev, seek, cycleRepeat,
    query, setQuery, submittedQuery, isSearching, searchResults,
    suggestions: SUGGESTIONS, liveResults, submitSearch, clearSearch,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};
