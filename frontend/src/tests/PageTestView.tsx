import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Check, X,
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Volume1,
  Download, Loader2, ListMusic, Disc3, Minus,
  Shuffle, Repeat, Repeat1, Infinity as InfinityIcon,
} from "lucide-react";

import { SongController } from "../infra/song.controller";
import { usePlayer, useSearch, useSearchSuggestions } from "./usePlayer";
import { NativeCommands } from "../infra/commands.native";

/* ─────────────────────────────────────────────────────────────────────────────
   Desktop Gadget Shell — fixed 440×400 widget.
   Logic stays in usePlayer.ts; this file is presentation only.
   ───────────────────────────────────────────────────────────────────────── */

type View = "player" | "search" | "queue";

// ─── Volume icon ────────────────────────────────────────────────────────────
const VolIcon = ({ v }: { v: number }) => {
  if (v === 0) return <VolumeX className="w-3.5 h-3.5" strokeWidth={2.25} />;
  if (v < 50)  return <Volume1 className="w-3.5 h-3.5" strokeWidth={2.25} />;
  return <Volume2 className="w-3.5 h-3.5" strokeWidth={2.25} />;
};

// ─── Tab bar atom ────────────────────────────────────────────────────────────
const TabBtn = ({
  active, onClick, icon, label, badge,
}: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; badge?: number;
}) => (
  <button
    type="button" onClick={onClick}
    className={`relative flex-1 h-full flex items-center justify-center gap-2 label-mono text-[11px] transition-colors ${
      active ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
    }`}
  >
    {icon}<span>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className={`absolute top-1 right-2 min-w-[18px] h-[18px] px-1 grid place-items-center text-[10px] font-bold ${
        active ? "bg-yellow-400 text-neutral-900" : "bg-neutral-900 text-white"
      }`}>
        {badge}
      </span>
    )}
  </button>
);

// ─── Main gadget ─────────────────────────────────────────────────────────────
export const PageTestView = () => {
  const {
    queue, currentIndex, activeItem, hasNext, hasPrev,
    enqueue, enqueueAndPlay, dequeue, playAt, playNext, playPrev,
    volume, setVolume, currentTime, duration,
    isLoading, isDownloading, isPlaying, isPaused,
    play, pause, seek, download,
    autoplay, shuffle, loop,
    toggleAutoplay, toggleShuffle, cycleLoop,
  } = usePlayer();

  const { results, search } = useSearch();
  const queueIds = useMemo(() => new Set(queue.map((v: any) => v.id)), [queue]);

  const [view, setView] = useState<View>("player");
  const [query, setQuery] = useState("");
  const [showSug, setShowSug] = useState(false);
  const suggestions = useSearchSuggestions(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const lastVolume = useRef(volume || 25);
  useEffect(() => { if (volume > 0) lastVolume.current = volume; }, [volume]);

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration);
  };
  const toggleMute = () => setVolume(volume === 0 ? lastVolume.current || 25 : 0);

  const triggerSearch = (q: string) => {
    const v = q.trim(); if (!v) return;
    setQuery(v); setShowSug(false); inputRef.current?.blur();
    search(v);
  };

  // Spacebar play/pause + arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (/INPUT|TEXTAREA/.test(tag) || !activeItem) return;
      if (e.code === "Space") { e.preventDefault(); isPlaying ? pause() : play(); }
      else if (e.key === "ArrowRight") seek(Math.min(duration, currentTime + 5));
      else if (e.key === "ArrowLeft")  seek(Math.max(0, currentTime - 5));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeItem, isPlaying, currentTime, duration, play, pause, seek]);

  return (
    <div className="h-screen w-full bg-transparent grid place-items-center">
      {/* The Gadget — fixed 440×400 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-[95%] h-[95%] relative bg-white text-neutral-900 border-2 border-neutral-900 shadow-[8px_8px_0_0_theme(colors.black/0.6)] flex flex-col overflow-hidden"
       
      >
        {/* Title bar */}
        <header className="h-10 shrink-0 bg-neutral-900 text-white flex items-center justify-between px-3 select-none wails-draggable">
          <div className="flex items-center gap-2">
            <Disc3 className={`w-5 h-5 ${isPlaying ? "animate-spin" : ""}`} strokeWidth={2.5} />
            <span className="label-mono text-[12px]">GOPHER · GADGET</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => NativeCommands.Minimizar()} className="p-2 grid place-items-center hover:bg-white/20">
              <Minus className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
            <button onClick={() => NativeCommands.CloseWindow()} className="p-2 grid place-items-center hover:bg-yellow-400/50">
              <X className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {view === "player" && (
              <motion.div
                key="player"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex"
              >
                {/* Cover */}
                <div className="w-[150px] shrink-0 border-r-2 border-neutral-900 bg-neutral-100 relative overflow-hidden">
                  {activeItem ? (
                    <img
                      src={activeItem.thumbnail} alt=""
                      className="absolute inset-0 w-full h-full object-cover grayscale contrast-125"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-neutral-400">
                      <Disc3 className="w-12 h-12 opacity-40" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute top-1 left-1">
                    <span className="label-mono px-1 py-0.5 bg-neutral-900 text-white">
                      {currentIndex >= 0 ? `№${(currentIndex + 1).toString().padStart(2, "0")}` : "№--"}
                    </span>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex-1 min-w-0 flex flex-col p-3 gap-2">
                  <div className="label-mono text-neutral-500 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 ${isPlaying ? "bg-yellow-400" : "bg-neutral-400"}`} />
                    {isLoading ? "LOADING" : isPaused ? "PAUSED" : isPlaying ? "ON AIR" : "READY"}
                  </div>

                  <h2 className="font-display font-black text-[17px] leading-tight line-clamp-3 min-h-[60px]">
                    {activeItem ? activeItem.title : (
                      <span className="italic text-neutral-400 font-normal">No track loaded.</span>
                    )}
                  </h2>

                  {/* Seek */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                      <span>{SongController.formatTime(currentTime)}</span>
                      <span className="opacity-60">{SongController.formatTime(duration)}</span>
                    </div>
                    <div
                      onClick={handleSeekClick}
                      role="progressbar" aria-valuenow={Math.round(pct)}
                      className="relative w-full h-2 border-2 border-neutral-900 bg-white cursor-pointer"
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-yellow-400"
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.25, ease: "linear" }}
                      />
                    </div>
                  </div>

                  {/* Transport */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button" onClick={playPrev} disabled={!hasPrev}
                      className="ghost-btn w-10 h-10 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Previous"
                    >
                      <SkipBack className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <motion.button
                      type="button"
                      onClick={isPaused ? play : pause}
                      disabled={isLoading || !activeItem}
                      whileTap={{ scale: 0.92 }}
                      className="ink-btn w-14 h-10 disabled:opacity-30 disabled:cursor-not-allowed bg-yellow-400 text-neutral-900 border-yellow-400"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isLoading
                        ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                        : !isPaused
                          ? <Pause className="w-5 h-5" strokeWidth={2.5} />
                          : <Play  className="w-5 h-5 ml-0.5" strokeWidth={2.5} />}
                    </motion.button>
                    <button
                      type="button" onClick={playNext} disabled={!hasNext}
                      className="ghost-btn w-10 h-10 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Next"
                    >
                      <SkipForward className="w-4 h-4" strokeWidth={2.5} />
                    </button>

                    <div className="flex-1" />

                    {/* Playback modes: shuffle · loop · autoplay */}
                    <button
                      type="button" onClick={toggleShuffle}
                      className={`ghost-btn w-8 h-10 ${shuffle ? "bg-yellow-400 text-neutral-900 border-yellow-400" : ""}`}
                      aria-label={`Shuffle ${shuffle ? "on" : "off"}`}
                      aria-pressed={shuffle}
                      title={`Shuffle: ${shuffle ? "ON" : "OFF"}`}
                    >
                      <Shuffle className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                    <button
                      type="button" onClick={cycleLoop}
                      className={`ghost-btn w-8 h-10 relative ${loop !== "off" ? "bg-yellow-400 text-neutral-900 border-yellow-400" : ""}`}
                      aria-label={`Loop ${loop}`}
                      title={`Loop: ${loop.toUpperCase()}`}
                    >
                      {loop === "one"
                        ? <Repeat1 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        : <Repeat className="w-3.5 h-3.5" strokeWidth={2.5} />}
                      {loop === "all" && (
                        <span className="absolute -top-0.5 -right-0.5 label-mono text-[7px] bg-neutral-900 text-yellow-400 px-0.5 leading-none py-[1px]">A</span>
                      )}
                    </button>
                    <button
                      type="button" onClick={toggleAutoplay}
                      className={`ghost-btn w-8 h-10 ${autoplay ? "bg-yellow-400 text-neutral-900 border-yellow-400" : ""}`}
                      aria-label={`Autoplay ${autoplay ? "on" : "off"}`}
                      aria-pressed={autoplay}
                      title={`Autoplay: ${autoplay ? "ON" : "OFF"}`}
                    >
                      <InfinityIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>

                    <button
                      type="button" disabled={isDownloading || !activeItem} onClick={download}
                      className="ghost-btn w-10 h-10 disabled:opacity-30 disabled:cursor-not-allowed ml-1"
                      aria-label="Archive"
                    >
                      {isDownloading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Download className="w-4 h-4" strokeWidth={2.25} />}
                    </button>
                  </div>

                  {/* Volume row */}
                  <div className="flex items-center gap-2 border-t-2 border-neutral-900 pt-2">
                    <button
                      type="button" onClick={toggleMute}
                      className="w-7 h-7 grid place-items-center hover:text-yellow-400 transition-colors"
                      aria-label={volume === 0 ? "Unmute" : "Mute"}
                    >
                      <VolIcon v={volume} />
                    </button>
                    <input
                      type="range" min={0} max={100} value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="flex-1 accent-yellow-400 h-1 cursor-pointer"
                      aria-label="Volume"
                    />
                    <span className="label-mono w-7 text-right">{volume.toString().padStart(3, "0")}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {view === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Search bar */}
                <div className="shrink-0 border-b-2 border-neutral-900 p-2 relative">
                  <div className="flex items-center border-2 border-neutral-900 bg-white h-8">
                    <Search className="w-3.5 h-3.5 mx-2 opacity-60 shrink-0" strokeWidth={2.25} />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setShowSug(true)}
                      onBlur={() => setTimeout(() => setShowSug(false), 120)}
                      onKeyDown={(e) => { if (e.key === "Enter") triggerSearch(query); }}
                      placeholder="search…"
                      className="flex-1 bg-transparent font-display italic text-sm placeholder:text-neutral-400 focus:outline-none"
                    />
                    {query && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                        className="px-1.5 text-neutral-400 hover:text-yellow-400"
                      >
                        <X className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showSug && suggestions.length > 0 && query.trim() && (
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="absolute left-2 right-2 top-full mt-0.5 z-50 bg-white border-2 border-neutral-900 max-h-32 overflow-y-auto shadow-[3px_3px_0_0_theme(colors.neutral.900)]"
                      >
                        {suggestions.slice(0, 5).map((s, i) => (
                          <li key={`${s}-${i}`}>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => triggerSearch(s)}
                              className="w-full text-left px-2 py-1.5 font-display italic text-sm hover:bg-neutral-900 hover:text-white"
                            >
                              {s}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="h-full grid place-items-center px-4">
                      <p className="font-display italic text-sm text-neutral-400 text-center">
                        Type & press <kbd className="border border-neutral-400 px-1 label-mono">ENTER</kbd>
                      </p>
                    </div>
                  ) : (
                    <ul>
                      <AnimatePresence initial={false}>
                        {results.map((video, i) => {
                          const inQ = queueIds.has(video.id);
                          const isAct = video.id === activeItem?.id;
                          return (
                            <motion.li
                              key={video.id} layout
                              initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                              transition={{ delay: i * 0.01, duration: 0.15 }}
                              className={`group flex items-center gap-2 px-2 py-1.5 border-b border-neutral-200 ${
                                isAct ? "bg-yellow-400 text-neutral-900" : "hover:bg-neutral-100"
                              }`}
                            >
                              <span className="label-mono opacity-60 w-5 text-right shrink-0">
                                {(i + 1).toString().padStart(2, "0")}
                              </span>
                              <img
                                src={video.thumbnail} alt="" loading="lazy"
                                className="w-10 h-7 object-cover border border-neutral-900 grayscale group-hover:grayscale-0 shrink-0"
                              />
                              <p className="flex-1 min-w-0 font-display text-[12px] leading-tight truncate" title={video.title}>
                                {video.title}
                              </p>
                              <button
                                type="button" onClick={() => enqueueAndPlay(video)}
                                className="w-6 h-6 grid place-items-center border border-neutral-900 hover:bg-neutral-900 hover:text-white"
                                aria-label="Play now"
                              >
                                <Play className="w-3 h-3" strokeWidth={2.5} />
                              </button>
                              <button
                                type="button" onClick={() => enqueue(video)} disabled={inQ}
                                className={`w-6 h-6 grid place-items-center border border-neutral-900 ${
                                  inQ ? "opacity-40" : "bg-neutral-900 text-white hover:bg-yellow-400 hover:border-yellow-400"
                                }`}
                                aria-label={inQ ? "Queued" : "Enqueue"}
                              >
                                {inQ ? <Check className="w-3 h-3" strokeWidth={2.5} /> : <Plus className="w-3 h-3" strokeWidth={2.5} />}
                              </button>
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>
              </motion.div>
            )}

            {view === "queue" && (
              <motion.div
                key="queue"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 overflow-y-auto"
              >
                {queue.length === 0 ? (
                  <div className="h-full grid place-items-center px-4">
                    <p className="font-display italic text-sm text-neutral-400 text-center">
                      The queue is silent.
                    </p>
                  </div>
                ) : (
                  <ul>
                    <AnimatePresence initial={false}>
                      {queue.map((v, i) => {
                        const isAct = i === currentIndex;
                        return (
                          <motion.li
                            key={v.id} layout
                            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`group flex items-center gap-2 px-2 py-1.5 border-b border-neutral-200 ${
                              isAct ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
                            }`}
                          >
                            <span className="label-mono w-5 text-center shrink-0">
                              {isAct ? "▶" : (i + 1).toString().padStart(2, "0")}
                            </span>
                            <button
                              type="button" onClick={() => playAt(i)}
                              className="flex-1 min-w-0 text-left font-display italic text-[12px] truncate"
                            >
                              {v.title}
                            </button>
                            <button
                              type="button" onClick={() => dequeue(i)} aria-label="Remove"
                              className={`w-5 h-5 grid place-items-center transition-opacity hover:text-yellow-400 ${
                                isAct ? "opacity-90" : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <X className="w-3 h-3" strokeWidth={2.5} />
                            </button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab bar / status footer */}
        <nav className="h-11 shrink-0 border-t-2 border-neutral-900 flex">
          <TabBtn
            active={view === "player"} onClick={() => setView("player")}
            icon={<Disc3 className="w-4 h-4" strokeWidth={2.5} />} label="PLAY"
          />
          <div className="w-px bg-neutral-900" />
          <TabBtn
            active={view === "search"} onClick={() => setView("search")}
            icon={<Search className="w-4 h-4" strokeWidth={2.5} />} label="FIND"
            badge={results.length}
          />
          <div className="w-px bg-neutral-900" />
          <TabBtn
            active={view === "queue"} onClick={() => setView("queue")}
            icon={<ListMusic className="w-4 h-4" strokeWidth={2.5} />} label="QUEUE"
            badge={queue.length}
          />
        </nav>
      </motion.div>
    </div>
  );
};

export default PageTestView;
