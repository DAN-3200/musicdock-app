import type { Track } from "../logic/types";

// Mock catalog — simulates a YouTube-like searchable library.
export const CATALOG: Track[] = [
  { id: "t1", title: "Neon Pulse", artist: "Vector Sun", album: "Grid Horizon", duration: 214 },
  { id: "t2", title: "Static Bloom", artist: "Mono Garden", album: "Slow Signals", duration: 187 },
  { id: "t3", title: "Paper Skies", artist: "Ada Loop", album: "Folded Maps", duration: 242 },
  { id: "t4", title: "Low Orbit", artist: "Cassio Drift", album: "Telemetry", duration: 196 },
  { id: "t5", title: "Quiet Machine", artist: "Hex Park", album: "Pocket Atlas", duration: 263 },
  { id: "t6", title: "Soft Format", artist: "Vector Sun", album: "Grid Horizon", duration: 178 },
  { id: "t7", title: "Midnight Drive", artist: "Halogen Kids", album: "Afterglow", duration: 221 },
  { id: "t8", title: "Glass Garden", artist: "Mono Garden", album: "Slow Signals", duration: 205 },
  { id: "t9", title: "Analog Heart", artist: "Cassio Drift", album: "Telemetry", duration: 232 },
  { id: "t10", title: "Pixel Rain", artist: "Hex Park", album: "Pocket Atlas", duration: 198 },
  { id: "t11", title: "North Field", artist: "Ada Loop", album: "Folded Maps", duration: 254 },
  { id: "t12", title: "Velvet Static", artist: "Halogen Kids", album: "Afterglow", duration: 211 },
  { id: "t13", title: "Sun Cassette", artist: "Vector Sun", album: "Tape Loops", duration: 189 },
  { id: "t14", title: "Hollow Wave", artist: "Bay Index", album: "Tide Charts", duration: 247 },
  { id: "t15", title: "Concrete Bloom", artist: "Bay Index", album: "Tide Charts", duration: 219 },
  { id: "t16", title: "Slow Comet", artist: "Cassio Drift", album: "Apogee", duration: 268 },
  { id: "t17", title: "Tin Sky", artist: "Mono Garden", album: "Field Notes", duration: 174 },
  { id: "t18", title: "Magnet Hour", artist: "Hex Park", album: "Pocket Atlas", duration: 226 },
];

// Simulated network delay to mimic an external service.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const matches = (t: Track, q: string) =>
  [t.title, t.artist, t.album].some((f) => f.toLowerCase().includes(q));

/** Returns lightweight suggestions while the user types. */
export const fetchSuggestions = async (query: string, limit = 6): Promise<Track[]> => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  await delay(120);
  return CATALOG.filter((t) => matches(t, q)).slice(0, limit);
};

/** Performs the "full" search (triggered on Enter). */
export const searchCatalog = async (query: string, limit = 30): Promise<Track[]> => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  await delay(220);
  return CATALOG.filter((t) => matches(t, q)).slice(0, limit);
};
