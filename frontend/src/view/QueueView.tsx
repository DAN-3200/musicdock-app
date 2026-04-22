import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Trash2, X } from "lucide-react";
import { SectionLabel } from "./ui/SectionLabel";
import { formatSeconds } from "../logic/utils";
import { useMusic } from "../logic/useMusic";

export const QueueView = () => {
  const { queue, currentUid, isPlaying, playQueueItem, toggle, removeFromQueue, clearQueue } = useMusic();
  const total = queue.reduce((acc, it) => acc + it.track.duration, 0);

  return (
    <div className="h-full w-full flex flex-col p-4 gap-3">
      <div className="flex items-center justify-between">
        <SectionLabel>Queue · {formatSeconds(total)}</SectionLabel>
        {queue.length > 0 && (
          <button
            type="button"
            onClick={clearQueue}
            className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors focus:outline-none"
          >
            <Trash2 className="w-3 h-3" strokeWidth={2} />
            clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto overflow-x-hidden -mx-1 px-1">
        {queue.length === 0 ? (
          <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 mt-2">
            Fila vazia. Use a aba Search para adicionar faixas.
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
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => (isCurrent ? toggle() : playQueueItem(item.uid))}
                      className="w-5 h-5 grid place-items-center shrink-0 focus:outline-none"
                      aria-label={isCurrent ? (isPlaying ? "Pause" : "Play") : "Play"}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-3 h-3" strokeWidth={2.5} />
                      ) : isCurrent ? (
                        <Play className="w-3 h-3" strokeWidth={2.5} />
                      ) : (
                        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 group-hover:hidden">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                      )}
                      {!isCurrent && (
                        <Play className="w-3 h-3 hidden group-hover:block" strokeWidth={2.5} />
                      )}
                    </button>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] font-medium truncate">{item.track.title}</span>
                      <span
                        className={`block text-[10px] truncate ${
                          isCurrent ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"
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
                      aria-label="Remover da fila"
                      className={`w-5 h-5 grid place-items-center transition-opacity focus:outline-none ${
                        isCurrent
                          ? "opacity-70 hover:opacity-100"
                          : "opacity-0 group-hover:opacity-100 hover:text-red-600 dark:hover:text-red-400"
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
