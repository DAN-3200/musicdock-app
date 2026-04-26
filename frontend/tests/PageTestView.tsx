import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Check,
  X,
  CornerDownLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Download,
  Loader2,
  Minus,
  Music2,
  ListOrdered,
  Inbox,
  type LucideIcon,
} from "lucide-react";

import { WindowMinimise, Quit } from "../wailsjs/runtime";
import { SongController } from "../src/infra/song.controller";
import { usePlayer, useSearch, useSearchSuggestions } from "./usePlayer";
import type { VideoResult } from "./usePlayer";

import { IconButton } from "../src/view/ui/IconButton";
import { SectionLabel } from "../src/view/ui/SectionLabel";

/* ──────────────────────────────────────────────────────────────────────────
 * Tokens de layout — fonte única para evitar inconsistências de tamanho.
 * ────────────────────────────────────────────────────────────────────────── */
const SHELL = "w-full max-w-[420px] mx-auto"; // largura responsiva
const STAGE_H = "h-[clamp(360px,60vh,520px)]"; // altura do palco fluida
const SURFACE =
  "bg-zinc-900 border border-zinc-800";
const ROW_HOVER = "hover:bg-zinc-800/80";

/* ──────────────────────────────────────────────────────────────────────────
 * SearchBar
 * ────────────────────────────────────────────────────────────────────────── */
interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = useSearchSuggestions(input);

  const triggerSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    setInput(q);
    setFocused(false);
    setActiveIdx(-1);
    inputRef.current?.blur();
    onSearch(q);
  };

  const showSuggestions =
    focused && input.trim().length > 0 && suggestions.length > 0;

  // Reset highlight when suggestions change
  useEffect(() => setActiveIdx(-1), [input]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const pick = activeIdx >= 0 ? suggestions[activeIdx] : input;
      triggerSearch(pick);
      return;
    }
    if (e.key === "Escape") {
      inputRef.current?.blur();
      return;
    }
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  };

  return (
    <div className="relative">
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none"
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onKeyDown={handleKey}
        placeholder="Buscar artistas ou músicas…"
        aria-label="Buscar"
        className="w-full h-9 pl-8 pr-16 bg-zinc-900 border border-zinc-800 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-100 transition-colors"
      />
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {input && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setInput("");
              inputRef.current?.focus();
            }}
            aria-label="Limpar"
            className="w-5 h-5 grid place-items-center text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
          </button>
        )}
        <kbd className="hidden sm:inline-flex items-center font-mono text-[9px] text-zinc-500 border border-zinc-800 px-1 py-0.5">
          <CornerDownLeft className="w-2.5 h-2.5" strokeWidth={2} />
        </kbd>
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-zinc-950 border border-zinc-800 shadow-2xl max-h-56 overflow-y-auto"
            role="listbox"
          >
            {suggestions.map((s, i) => {
              const active = i === activeIdx;
              return (
                <li key={`${s}-${i}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => triggerSearch(s)}
                    className={`w-full text-left flex items-center gap-2 px-2 py-1.5 transition-colors ${active ? "bg-zinc-800" : "hover:bg-zinc-800"
                      }`}
                  >
                    <Search
                      className="w-3 h-3 text-zinc-500 shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-[12px] text-zinc-100 truncate">
                      {s}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * EmptyState — reutilizável
 * ────────────────────────────────────────────────────────────────────────── */
const EmptyState = ({
  Icon,
  title,
  hint,
}: {
  Icon: LucideIcon;
  title: string;
  hint?: string;
}) => (
  <div className={`${SURFACE} h-full grid place-items-center p-6`}>
    <div className="flex flex-col items-center gap-2 text-center">
      <Icon className="w-6 h-6 text-zinc-600" strokeWidth={1.5} />
      <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
        {title}
      </p>
      {hint && <p className="text-[11px] text-zinc-600">{hint}</p>}
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────────────────
 * VideoList
 * ────────────────────────────────────────────────────────────────────────── */
interface VideoListProps {
  results: VideoResult[];
  queueIds: Set<string>;
  activeId: string | undefined;
  onEnqueue: (video: VideoResult) => void;
  onPlayNow: (video: VideoResult) => void;
}

export const VideoList = ({
  results,
  queueIds,
  activeId,
  onEnqueue,
  onPlayNow,
}: VideoListProps) => {
  if (results.length === 0) {
    return (
      <EmptyState
        Icon={Search}
        title="Sem resultados"
        hint="Pressione Enter para buscar."
      />
    );
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <SectionLabel className="mb-2 px-0.5">Resultados · {results.length}</SectionLabel>
      <ul className="flex flex-col gap-1 overflow-y-auto flex-1 -mx-1 px-1 pb-1">
        <AnimatePresence initial={false}>
          {results.map((video, i) => {
            const isActive = video.id === activeId;
            const inQueue = queueIds.has(video.id);
            return (
              <motion.li
                key={video.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: i * 0.02, duration: 0.18 }}
                className={`group flex items-center gap-2 px-2 py-1.5 transition-colors ${isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : `text-zinc-300 ${ROW_HOVER}`
                  }`}
              >
                <img
                  src={video.thumbnail}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="w-12 h-8 object-cover flex-shrink-0 grayscale group-hover:grayscale-0 transition-all"
                />
                <p className="flex-1 min-w-0 text-[12px] font-medium truncate">
                  {video.title}
                </p>

                <button
                  type="button"
                  onClick={() => onPlayNow(video)}
                  aria-label="Tocar agora"
                  title="Tocar agora"
                  className={`w-7 h-7 grid place-items-center transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-100 ${isActive
                    ? "text-zinc-900 hover:bg-zinc-200"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
                    }`}
                >
                  <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEnqueue(video)}
                  disabled={inQueue}
                  aria-label={inQueue ? "Já na fila" : "Adicionar à fila"}
                  title={inQueue ? "Já na fila" : "Adicionar à fila"}
                  className={`w-7 h-7 grid place-items-center transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-100 ${inQueue
                    ? "text-zinc-600 cursor-not-allowed"
                    : isActive
                      ? "bg-zinc-900 text-zinc-100 hover:bg-zinc-700"
                      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-300"
                    }`}
                >
                  {inQueue ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : (
                    <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  )}
                </motion.button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * Queue
 * ────────────────────────────────────────────────────────────────────────── */
interface QueueProps {
  queue: VideoResult[];
  currentIndex: number;
  onPlayAt: (index: number) => void;
  onDequeue: (index: number) => void;
}

export const Queue = ({
  queue,
  currentIndex,
  onPlayAt,
  onDequeue,
}: QueueProps) => (
  <div className="flex flex-col min-h-0 flex-1">
    <SectionLabel className="mb-2 px-0.5">Queue · {queue.length}</SectionLabel>
    <ul className="flex flex-col gap-0.5 overflow-y-auto flex-1 -mx-1 px-1 pb-1">
      <AnimatePresence initial={false}>
        {queue.map((video, index) => {
          const isActive = index === currentIndex;
          return (
            <motion.li
              key={video.id}
              layout
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8, height: 0 }}
              transition={{ duration: 0.18 }}
              className={`group flex items-center gap-2 px-2 py-1.5 transition-colors ${isActive
                ? "bg-zinc-100 text-zinc-900"
                : `text-zinc-300 ${ROW_HOVER}`
                }`}
            >
              <span className="font-mono text-[10px] tabular-nums w-5 shrink-0 text-center opacity-70">
                {isActive ? (
                  <Play className="w-3 h-3 inline" strokeWidth={2.5} />
                ) : (
                  (index + 1).toString().padStart(2, "0")
                )}
              </span>
              <img
                src={video.thumbnail}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="w-10 h-6 object-cover flex-shrink-0"
              />
              <button
                type="button"
                onClick={() => onPlayAt(index)}
                className={`flex-1 min-w-0 text-left text-[11px] truncate focus:outline-none ${isActive ? "font-medium" : ""
                  }`}
              >
                {video.title}
              </button>
              <button
                type="button"
                onClick={() => onDequeue(index)}
                aria-label="Remover da fila"
                title="Remover"
                className={`w-6 h-6 grid place-items-center transition-opacity focus:outline-none ${isActive
                  ? "opacity-70 hover:opacity-100"
                  : "opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-400"
                  }`}
              >
                <X className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  </div>
);

/* ──────────────────────────────────────────────────────────────────────────
 * Player
 * ────────────────────────────────────────────────────────────────────────── */
const VolumeIcon = ({ v }: { v: number }) => {
  if (v === 0) return <VolumeX className="w-3.5 h-3.5" strokeWidth={2} />;
  if (v < 50) return <Volume1 className="w-3.5 h-3.5" strokeWidth={2} />;
  return <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />;
};

interface PlayerProps {
  activeItem: VideoResult | null;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  isDownloading: boolean;
  hasNext: boolean;
  hasPrev: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onDownload: () => void;
  isPlaying: boolean,
  isPaused: boolean
}

export const Player = ({
  activeItem,
  currentTime,
  duration,
  volume,
  isLoading,
  isDownloading,
  hasNext,
  hasPrev,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onDownload,
  isPlaying,
  isPaused
}: PlayerProps) => {

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const lastVolume = useRef(volume || 70);

  useEffect(() => {
    if (volume > 0) lastVolume.current = volume;
  }, [volume]);

  const handleBar = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    onSeek(ratio * duration);
  };

  // Keyboard shortcuts: space toggles, arrows skip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /INPUT|TEXTAREA/.test(target.tagName)) return;
      if (!activeItem) return;
      if (e.code === "Space") {
        e.preventDefault();
        isPlaying ? onPause() : onPlay();
      } else if (e.key === "ArrowRight") {
        onSeek(Math.min(duration, currentTime + 5));
      } else if (e.key === "ArrowLeft") {
        onSeek(Math.max(0, currentTime - 5));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeItem, isPlaying, currentTime, duration, onPlay, onPause, onSeek]);

  const toggleMute = () =>
    onVolumeChange(volume === 0 ? lastVolume.current || 70 : 0);

  return (
    <div className={`${SURFACE} p-4 flex flex-col gap-3 h-full`}>
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>Now Playing</SectionLabel>
        <button
          type="button"
          disabled={isDownloading || !activeItem}
          onClick={onDownload}
          className={`inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-100 ${isDownloading || !activeItem
            ? "text-zinc-600 border border-zinc-800 cursor-not-allowed"
            : "text-zinc-300 border border-zinc-700 hover:border-zinc-100 hover:text-zinc-100"
            }`}
        >
          {isDownloading ? (
            <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
          ) : (
            <Download className="w-3 h-3" strokeWidth={2} />
          )}
          {isDownloading ? "BAIXANDO" : "DOWNLOAD"}
        </button>
      </div>

      {/* Artwork */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 border border-zinc-800">
        <AnimatePresence mode="wait">
          {activeItem ? (
            <motion.img
              key={activeItem.id}
              src={activeItem.thumbnail}
              alt={activeItem.title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <Music2
                className="w-8 h-8 text-zinc-700"
                strokeWidth={1.5}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Track info — altura fixa para evitar shift */}
      <div className="h-[20px]">
        <AnimatePresence mode="wait">
          {activeItem ? (
            <motion.p
              key={activeItem.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[12px] font-medium text-zinc-100 truncate"
              title={activeItem.title}
            >
              {activeItem.title}
            </motion.p>
          ) : (
            <p className="text-[12px] text-zinc-500">
              Nenhuma faixa selecionada
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* Seek bar */}
      <div className="flex flex-col gap-1">
        <div
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          onClick={handleBar}
          className="w-full h-1.5 bg-zinc-800 cursor-pointer group relative"
        >
          <motion.div
            className="h-full bg-zinc-100 group-hover:bg-white transition-colors"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 tabular-nums">
          <span>{SongController.formatTime(currentTime)}</span>
          <span>{SongController.formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <IconButton label="Anterior" onClick={onPrev} disabled={!hasPrev}>
          <SkipBack className="w-4 h-4" strokeWidth={2} />
        </IconButton>

        <motion.button
          type="button"
          onClick={isPaused ? onPlay : onPause}
          disabled={isLoading || !activeItem}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="inline-flex items-center justify-center w-12 h-12 bg-zinc-100 text-zinc-900 hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
          ) : !isPaused ? (
            <Pause className="w-5 h-5" strokeWidth={2.5} />
          ) : (
            <Play className="w-5 h-5 ml-0.5" strokeWidth={2.5} />
          )}
        </motion.button>

        <IconButton label="Próxima" onClick={onNext} disabled={!hasNext}>
          <SkipForward className="w-4 h-4" strokeWidth={2} />
        </IconButton>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 mt-auto">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={volume === 0 ? "Unmute" : "Mute"}
          className="w-7 h-7 grid place-items-center text-zinc-400 hover:text-zinc-100 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-100"
        >
          <VolumeIcon v={volume} />
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="flex-1 accent-zinc-100 h-1 cursor-pointer"
          aria-label="Volume"
        />
        <span className="font-mono text-[10px] text-zinc-500 w-7 text-right tabular-nums">
          {volume}
        </span>
      </div>
    </div >
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────────────────────────────────── */
type Tab = "player" | "search" | "queue";

export const PageTestView = () => {
  const {
    queue,
    currentIndex,
    activeItem,
    hasNext,
    hasPrev,
    enqueue,
    enqueueAndPlay,
    dequeue,
    playAt,
    playNext,
    playPrev,
    volume,
    setVolume,
    currentTime,
    duration,
    isLoading,
    isDownloading,
    play,
    pause,
    seek,
    download,
    isPlaying,
    isPaused
  } = usePlayer();

  const { results, search } = useSearch();
  const queueIds = useMemo(() => new Set(queue.map((v) => v.id)), [queue]);

  const [tab, setTab] = useState<Tab>("search");

  // Atalho global Cmd/Ctrl+K → busca
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTab("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const TABS: {
    key: Tab;
    label: string;
    Icon: LucideIcon;
    badge?: number;
  }[] = [
      { key: "player", label: "Player", Icon: Music2 },
      { key: "search", label: "Search", Icon: Search },
      { key: "queue", label: "Queue", Icon: ListOrdered, badge: queue.length },
    ];

  return (
    <div className="dark bg-zinc-950 text-zinc-100 min-h-screen">
      <div className={`${SHELL} p-2 flex flex-col gap-2`}>
        {/* Title bar */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-2 py-1.5 wails-draggable">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 bg-zinc-100 shrink-0" />
            <h1 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-100 truncate">
              Gopher
            </h1>
            {activeItem && (
              <span className="hidden sm:inline text-[11px] text-zinc-500 truncate">
                · {activeItem.title}
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-0.5 shrink-0"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={() => WindowMinimise()}
              aria-label="Minimizar"
              title="Minimizar"
              className="w-6 h-6 grid place-items-center text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-100"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => Quit?.()}
              aria-label="Fechar"
              title="Fechar"
              className="w-6 h-6 grid place-items-center text-zinc-500 hover:text-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-100"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          className="flex gap-0.5 bg-zinc-900 border border-zinc-800 p-1"
        >
          {TABS.map(({ key, label, Icon, badge }) => {
            const isActive = tab === key;
            const showBadge = !!badge && badge > 0;
            return (
              <motion.button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(key)}
                whileTap={{ scale: 0.96 }}
                className={`relative flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-100 ${isActive
                  ? "text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="page-test-active-tab"
                    className="absolute inset-0 bg-zinc-100 -z-0"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}
                <Icon
                  className="w-3.5 h-3.5 relative z-10 shrink-0"
                  strokeWidth={2}
                />
                <span className="relative z-10 hidden xs:inline sm:inline">
                  {label}
                </span>
                {showBadge && (
                  <span
                    className={`relative z-10 font-mono text-[9px] tabular-nums ${isActive ? "text-zinc-900/70" : "text-zinc-500"
                      }`}
                  >
                    {badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Stage — altura única e fluida; conteúdo interno controla scroll */}
        <div className={`relative ${STAGE_H}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col gap-3 min-h-0"
            >
              {tab === "search" && (
                <>
                  <SearchBar onSearch={search} />
                  <VideoList
                    results={results}
                    queueIds={queueIds}
                    activeId={activeItem?.id}
                    onEnqueue={enqueue}
                    onPlayNow={enqueueAndPlay}
                  />
                </>
              )}

              {tab === "queue" &&
                (queue.length === 0 ? (
                  <EmptyState
                    Icon={Inbox}
                    title="Fila vazia"
                    hint="Use a aba Search para adicionar faixas."
                  />
                ) : (
                  <Queue
                    queue={queue}
                    currentIndex={currentIndex}
                    onPlayAt={playAt}
                    onDequeue={dequeue}
                  />
                ))}

              {tab === "player" && (
                <Player
                  isPaused={isPaused}
                  isPlaying={isPlaying}
                  activeItem={activeItem}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  isLoading={isLoading}
                  isDownloading={isDownloading}
                  hasNext={hasNext}
                  hasPrev={hasPrev}
                  onPlay={play}
                  onPause={pause}
                  onNext={playNext}
                  onPrev={playPrev}
                  onSeek={seek}
                  onVolumeChange={setVolume}
                  onDownload={download}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
