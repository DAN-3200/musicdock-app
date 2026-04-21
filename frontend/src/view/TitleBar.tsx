import { useAtom, useAtomValue } from "jotai";
import { Music2, Search, ListOrdered, Settings as SettingsIcon, Minus, X, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { queueAtom, tabAtom } from "../logic/atoms";
import type { MusicTab } from "../logic/types";

interface Props {
  onMinimize?: () => void;
  onClose?: () => void;
}

const TABS: { key: MusicTab; label: string; Icon: LucideIcon }[] = [
  { key: "player", label: "Player", Icon: Music2 },
  { key: "search", label: "Search", Icon: Search },
  { key: "queue", label: "Queue", Icon: ListOrdered },
  { key: "config", label: "Config", Icon: SettingsIcon },
];

export const TitleBar = ({ onMinimize, onClose }: Props) => {
  const [active, setActive] = useAtom(tabAtom);
  const queueCount = useAtomValue(queueAtom).length;

  return (
    <div className="h-8 w-full flex items-center justify-between px-1 select-none wails-draggable">
      <div className="flex gap-0.5">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          const showBadge = key === "queue" && queueCount > 0;
          return (
            <motion.button
              key={key}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActive(key)}
              whileTap={{ scale: 0.94 }}
              className={`relative inline-flex items-center gap-1 px-1.5 py-1 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900 rounded-xs ${isActive
                  ? "text-white dark:text-zinc-900"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
            >
              {isActive && (
                <motion.span
                  layoutId="music-active-tab"
                  className="absolute rounded-xs inset-0 bg-zinc-900 dark:bg-zinc-100 -z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="w-3 h-3 relative z-10" strokeWidth={2} />
              <span className="relative z-10">{label}</span>
              {showBadge && (
                <span
                  className={`relative z-10 ml-0.5 font-mono text-[9px] tabular-nums ${isActive ? "text-white/70 dark:text-zinc-900/70" : "text-zinc-400 dark:text-zinc-500"
                    }`}
                >
                  {queueCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-1">
        <motion.button
          type="button"
          aria-label="Minimizar"
          onClick={onMinimize}
          whileTap={{ scale: 0.9 }}
          className="w-5 h-5 grid place-items-center bg-transparent hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900"
        >
          <Minus className="w-3 h-3" strokeWidth={2.5} />
        </motion.button>
        <motion.button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          whileTap={{ scale: 0.9 }}
          className="w-5 h-5 grid place-items-center bg-transparent hover:bg-red-500/50 text-white transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900"
        >
          <X className="w-3 h-3" strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
};
