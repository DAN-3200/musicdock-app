import type { Track } from "./types";

export const SAMPLE_TRACKS: Track[] = [
  { id: "1", title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", duration: 243, thumbnail: "https://img.youtube.com/vi/dX3k_QDnzHE/mqdefault.jpg" },
  { id: "2", title: "Resonance", artist: "HOME", album: "Odyssey", duration: 213, thumbnail: "https://img.youtube.com/vi/8GW6sLrK40k/mqdefault.jpg" },
  { id: "3", title: "Crystals", artist: "M.O.O.N.", album: "Hotline Miami OST", duration: 198, thumbnail: "https://img.youtube.com/vi/AVblOqZBlJw/mqdefault.jpg" },
  { id: "4", title: "Nightcall", artist: "Kavinsky", album: "OutRun", duration: 258, thumbnail: "https://img.youtube.com/vi/MV_3Dpw-BRY/mqdefault.jpg" },
  { id: "5", title: "A Real Hero", artist: "College & Electric Youth", album: "Drive OST", duration: 284, thumbnail: "https://img.youtube.com/vi/-DSVDcw6iW8/mqdefault.jpg" },
  { id: "6", title: "Flicker", artist: "Porter Robinson", album: "Worlds", duration: 278, thumbnail: "https://img.youtube.com/vi/D1sZ_vwqwcE/mqdefault.jpg" },
  { id: "7", title: "Digital Love", artist: "Daft Punk", album: "Discovery", duration: 301, thumbnail: "https://img.youtube.com/vi/QOngRDVtEQI/mqdefault.jpg" },
  { id: "8", title: "Intro", artist: "The xx", album: "xx", duration: 127, thumbnail: "https://img.youtube.com/vi/xMV6l2y67rk/mqdefault.jpg" },
  { id: "9", title: "Tadow", artist: "Masego & FKJ", album: "Single", duration: 325, thumbnail: "https://img.youtube.com/vi/hC8CH0Z3L54/mqdefault.jpg" },
  { id: "10", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: 200, thumbnail: "https://img.youtube.com/vi/4NRXx6U8ABQ/mqdefault.jpg" },
];

export const SUGGESTIONS: Track[] = SAMPLE_TRACKS.slice(0, 5);
