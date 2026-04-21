import { useAtom } from "jotai";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Volume1 } from "lucide-react";
import { motion } from "framer-motion";
import { IconButton } from "./ui/IconButton";
import { SectionLabel } from "./ui/SectionLabel";
import { formatSeconds } from "../logic/utils";
import { useMusic } from "../logic/useMusic";
import { settingsAtom } from "../logic/atoms";
import type { RepeatMode } from "../logic/types";

const RepeatIcon = ({ mode }: { mode: RepeatMode }) =>
  mode === "one" ? (
    <Repeat1 className="w-4 h-4" strokeWidth={2} />
  ) : (
    <Repeat className="w-4 h-4" strokeWidth={2} />
  );

const VolumeIcon = ({ v }: { v: number }) => {
  if (v === 0) return <VolumeX className="w-3.5 h-3.5" strokeWidth={2} />;
  if (v < 50) return <Volume1 className="w-3.5 h-3.5" strokeWidth={2} />;
  return <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />;
};

export const PlayerView = () => {
  const {
    current: track,
    position,
    progress,
    isPlaying,
    settings,
    toggle,
    next,
    prev,
    seek,
    setSettings,
    cycleRepeat,
  } = useMusic();
  const [, setSettingsAtom] = useAtom(settingsAtom);

  const pct = Math.round(progress * 100);

  const handleBar = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
  };

  const toggleMute = () => {
    if (settings.volume === 0) setSettings({ volume: 70 });
    else setSettings({ volume: 0 });
  };

  return (
    <div className="h-full w-full flex flex-col p-4 gap-3">
      <SectionLabel>Now Playing</SectionLabel>

      {/* Hero artwork */}
      <div className="flex flex-col items-center gap-3 pt-1">
        <div className="relative">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={
              isPlaying
                ? { repeat: Infinity, duration: 8, ease: "linear" }
                : { duration: 0.4 }
            }
            className="w-24 h-24 rounded-full grid place-items-center bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-500 shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 dark:from-zinc-300 dark:to-zinc-500 grid place-items-center">
              <div className="w-3 h-3 rounded-full bg-zinc-50 dark:bg-zinc-900 ring-2 ring-zinc-900/40 dark:ring-zinc-100/40" />
            </div>
          </motion.div>
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full ring-2 ring-zinc-900/20 dark:ring-zinc-100/20"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeOut" }}
            />
          )}
        </div>

        <div className="text-center min-w-0 w-full px-2">
          <motion.p
            key={track.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate"
          >
            {track.title}
          </motion.p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            {track.artist} · {track.album}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1">
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          onClick={handleBar}
          className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 cursor-pointer group relative"
        >
          <motion.div
            className="h-full bg-zinc-900 dark:bg-zinc-100 group-hover:bg-zinc-700 dark:group-hover:bg-zinc-300 transition-colors"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
          <span>{formatSeconds(position)}</span>
          <span>{formatSeconds(track.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <IconButton
          label="Shuffle"
          onClick={() => setSettings({ shuffle: !settings.shuffle })}
          className={settings.shuffle ? "!bg-zinc-900 !text-white dark:!bg-zinc-100 dark:!text-zinc-900" : ""}
        >
          <Shuffle className="w-4 h-4" strokeWidth={2} />
        </IconButton>

        <IconButton label="Anterior" onClick={prev}>
          <SkipBack className="w-4 h-4" strokeWidth={2} />
        </IconButton>

        <motion.button
          type="button"
          onClick={toggle}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="inline-flex items-center justify-center w-11 h-11 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" strokeWidth={2.5} />
          ) : (
            <Play className="w-5 h-5 ml-0.5" strokeWidth={2.5} />
          )}
        </motion.button>

        <IconButton label="Próxima" onClick={next}>
          <SkipForward className="w-4 h-4" strokeWidth={2} />
        </IconButton>

        <IconButton
          label={`Repeat ${settings.repeat}`}
          onClick={cycleRepeat}
          className={settings.repeat !== "off" ? "!bg-zinc-900 !text-white dark:!bg-zinc-100 dark:!text-zinc-900" : ""}
        >
          <RepeatIcon mode={settings.repeat} />
        </IconButton>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={settings.volume === 0 ? "Unmute" : "Mute"}
          className="w-6 h-6 grid place-items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus:outline-none"
        >
          <VolumeIcon v={settings.volume} />
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.volume}
          onChange={(e) => setSettings({ volume: Number(e.target.value) })}
          className="flex-1 accent-zinc-900 dark:accent-zinc-100 h-1"
          aria-label="Volume"
        />
        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 w-7 text-right tabular-nums">
          {settings.volume}
        </span>
      </div>
    </div>
  );
};
