import { motion } from "framer-motion";
import {
  Music2,
  Search,
  ListOrdered,
  Settings as SettingsIcon,
  Minus,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMusicContext } from "@/logic/MusicContext";
import type { MusicTab } from "@/logic/types";

const TABS: { key: MusicTab; label: string; Icon: LucideIcon }[] = [
  { key: "player", label: "Player", Icon: Music2 },
  { key: "search", label: "Search", Icon: Search },
  { key: "queue", label: "Queue", Icon: ListOrdered },
  { key: "config", label: "Config", Icon: SettingsIcon },
];

export const TitleBar = ({
  onMinimize,
  onClose,
}: {
  onMinimize?: () => void;
  onClose?: () => void;
}) => {
  const { tab, setTab, queue } = useMusicContext();
  const queueCount = queue.length;

  return (
    <div className="h-8 w-full flex items-center justify-between px-1 select-none overflow-x-auto">
      <div className="flex gap-0.5">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = tab === key;
          const showBadge = key === "queue" && queueCount > 0;
          return (
            <motion.button
              key={key}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => setTab(key)}
              whileTap={{ scale: 0.94 }}
              className={`relative inline-flex items-center gap-1 px-1.5 py-1 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-foreground rounded-sm ${
                isActive
                  ? "text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="music-active-tab"
                  className="absolute rounded-sm inset-0 bg-foreground -z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="w-3 h-3 relative z-10" strokeWidth={2} />
              <span className="relative z-10 hidden sm:inline">{label}</span>
              {showBadge && (
                <span
                  className={`relative z-10 ml-0.5 font-mono text-[9px] tabular-nums ${
                    isActive ? "opacity-70" : "text-muted-foreground"
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
        {onMinimize && (
          <motion.button
            type="button"
            aria-label="Minimize"
            onClick={onMinimize}
            whileTap={{ scale: 0.9 }}
            className="w-5 h-5 grid place-items-center hover:bg-muted text-muted-foreground transition-colors focus:outline-none"
          >
            <Minus className="w-3 h-3" strokeWidth={2.5} />
          </motion.button>
        )}
        {onClose && (
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            className="w-5 h-5 grid place-items-center hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors focus:outline-none"
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
          </motion.button>
        )}
      </div>
    </div>
  );
};
