import { AnimatePresence, motion } from "framer-motion";
import { Play, Pause, Trash2, X } from "lucide-react";
import { useMusicContext } from "@/logic/MusicContext";
import { formatSeconds } from "@/logic/utils";
import { SectionLabel } from "./Primitives";

export const QueueView = () => {
  const {
    queue,
    currentUid,
    isPlaying,
    playQueueItem,
    toggle,
    removeFromQueue,
    clearQueue,
  } = useMusicContext();
  const total = queue.reduce((acc, item) => acc + item.track.duration, 0);

  return (
    <div className="h-full w-full flex flex-col p-3 sm:p-4 gap-3">
      <div className="flex items-center justify-between">
        <SectionLabel>Queue · {formatSeconds(total)}</SectionLabel>
        {queue.length > 0 && (
          <button
            type="button"
            onClick={clearQueue}
            className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-destructive transition-colors focus:outline-none"
          >
            <Trash2 className="w-3 h-3" strokeWidth={2} />
            clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto overflow-x-hidden -mx-1 px-1">
        {queue.length === 0 ? (
          <p className="font-mono text-[10px] text-muted-foreground mt-2">
            Empty queue. Use Search to add tracks.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            <AnimatePresence initial={false}>
              {queue.map((item, i) => {
                const isCurrent = item.uid === currentUid;
                return (
                  <motion.li
                    key={item.uid}
                    layout
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex items-center gap-2 px-2 py-1.5 transition-colors group ${
                      isCurrent
                        ? "bg-foreground text-background"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        isCurrent ? toggle() : playQueueItem(item.uid)
                      }
                      className="w-5 h-5 grid place-items-center shrink-0 focus:outline-none"
                      aria-label={
                        isCurrent ? (isPlaying ? "Pause" : "Play") : "Play"
                      }
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-3 h-3" strokeWidth={2.5} />
                      ) : isCurrent ? (
                        <Play className="w-3 h-3" strokeWidth={2.5} />
                      ) : (
                        <span className="font-mono text-[10px] text-muted-foreground group-hover:hidden">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                      )}
                      {!isCurrent && (
                        <Play
                          className="w-3 h-3 hidden group-hover:block"
                          strokeWidth={2.5}
                        />
                      )}
                    </button>
                    {item.track.thumbnail && (
                      <img
                        src={item.track.thumbnail}
                        alt={item.track.title}
                        className="w-8 h-8 object-cover rounded-sm shrink-0 border border-border"
                      />
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] font-medium truncate">
                        {item.track.title}
                      </span>
                      <span
                        className={`block text-[10px] truncate ${
                          isCurrent ? "opacity-60" : "text-muted-foreground"
                        }`}
                      >
                        {item.track.artist}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] tabular-nums shrink-0">
                      {formatSeconds(item.track.duration)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromQueue(item.uid)}
                      aria-label="Remove from queue"
                      className={`w-5 h-5 grid place-items-center transition-opacity focus:outline-none ${
                        isCurrent
                          ? "opacity-70 hover:opacity-100"
                          : "opacity-0 group-hover:opacity-100 hover:text-destructive"
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
      </div>
    </div>
  );
};
