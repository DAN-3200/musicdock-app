import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
} from "lucide-react";
import { useMusicContext } from "@/logic/MusicContext";
import { formatSeconds } from "@/logic/utils";
import { SectionLabel, IconButton } from "./Primitives";

export const PlayerView = () => {
  const {
    current,
    isPlaying,
    progress,
    position,
    settings,
    setSettings,
    toggle,
    next,
    prev,
    seek,
    cycleRepeat,
  } = useMusicContext();

  const RepeatIcon = settings.repeat === "one" ? Repeat1 : Repeat;
  const track = current?.track;
  const title = track?.title ?? "No track selected";
  const artist = track?.artist ?? "—";
  const album = track?.album ?? "";
  const duration = track?.duration ?? 0;

  return (
    <div className="h-full w-full flex flex-col p-3 sm:p-4 gap-3 sm:gap-4">
      <div className="flex flex-col gap-1">
        <SectionLabel>Now Playing</SectionLabel>
        <motion.h2
          key={track?.id ?? "none"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm sm:text-[15px] font-semibold text-foreground truncate"
        >
          {title}
        </motion.h2>
        <p className="text-[11px] sm:text-[12px] text-muted-foreground truncate">
          {artist}{album ? ` · ${album}` : ""}
        </p>
      </div>

      <div
        aria-hidden
        className="flex-1 grid place-items-center bg-muted border border-border overflow-hidden"
      >
        {track?.thumbnail ? (
          <motion.img
            key={track.id}
            src={track.thumbnail}
            alt={track.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full object-cover"
          />
        ) : (
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{
              duration: 12,
              ease: "linear",
              repeat: isPlaying ? Infinity : 0,
            }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/60 grid place-items-center"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-background border border-border" />
          </motion.div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - rect.left) / rect.width);
          }}
          className="relative h-1 w-full bg-muted focus:outline-none"
          aria-label="Seek"
        >
          <motion.span
            className="absolute inset-y-0 left-0 bg-foreground"
            animate={{ width: `${progress * 100}%` }}
            transition={{ ease: "linear", duration: 0.2 }}
          />
        </button>
        <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
          <span>{formatSeconds(position)}</span>
          <span>{formatSeconds(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <IconButton
          ariaLabel="Shuffle"
          active={settings.shuffle}
          size="sm"
          onClick={() => setSettings({ shuffle: !settings.shuffle })}
        >
          <Shuffle className="w-3.5 h-3.5" strokeWidth={2} />
        </IconButton>

        <div className="flex items-center gap-1">
          <IconButton ariaLabel="Previous" onClick={prev}>
            <SkipBack className="w-4 h-4" strokeWidth={2} />
          </IconButton>
          <IconButton
            ariaLabel={isPlaying ? "Pause" : "Play"}
            size="lg"
            active
            onClick={toggle}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" strokeWidth={2.5} />
            ) : (
              <Play className="w-5 h-5" strokeWidth={2.5} />
            )}
          </IconButton>
          <IconButton ariaLabel="Next" onClick={next}>
            <SkipForward className="w-4 h-4" strokeWidth={2} />
          </IconButton>
        </div>

        <IconButton
          ariaLabel={`Repeat: ${settings.repeat}`}
          active={settings.repeat !== "off"}
          size="sm"
          onClick={cycleRepeat}
        >
          <RepeatIcon className="w-3.5 h-3.5" strokeWidth={2} />
        </IconButton>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
        <input
          type="range"
          min={0}
          max={100}
          value={settings.volume}
          onChange={(e) => setSettings({ volume: Number(e.target.value) })}
          className="flex-1 h-1 accent-foreground"
          aria-label="Volume"
        />
        <span className="font-mono text-[10px] tabular-nums w-7 text-right text-muted-foreground">
          {settings.volume}
        </span>
      </div>
    </div>
  );
};
